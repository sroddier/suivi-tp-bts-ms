(function (w) {
  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  function noteFromNiveau(m) {
    if (m == null || Number.isNaN(m)) return null;
    if (m <= 1) return m * 8;
    if (m <= 2) return 8 + (m - 1) * 6;
    return 14 + (m - 2) * 6;
  }

  function labelNiveau(m) {
    if (m == null) return { n: null, label: "Non observé", cls: "" };
    const n = Math.max(0, Math.min(3, Math.round(m)));
    return { n, label: w.NIVEAUX[n].label, cls: "n" + n };
  }

  function groupScores(scores) {
    const by = {};
    Object.entries(scores || {}).forEach(([id, val]) => {
      if (val === "" || val == null) return;
      const n = Number(val);
      if (Number.isNaN(n)) return;
      const cid = id.split("-")[0];
      (by[cid] ||= []).push(n);
    });
    const niveaux = {};
    Object.keys(by).forEach((cid) => { niveaux[cid] = mean(by[cid]); });
    return niveaux;
  }

  function scoreTp(scores, opts) {
    const options = Object.assign({ vetoSecurite: true }, opts);
    const niveaux = groupScores(scores);
    const vals = Object.values(niveaux);
    const niveau = mean(vals);
    let note = noteFromNiveau(niveau);
    let veto = false;
    if (options.vetoSecurite && note != null) {
      const hit = (w.SECURITE || []).some((id) => Number(scores[id]) === 0);
      if (hit) {
        veto = true;
        note = Math.min(note, 8);
      }
    }
    return {
      niveaux,
      niveau,
      note,
      veto,
      competences: Object.keys(niveaux)
    };
  }

  function fmtNote(n) {
    if (n == null) return "—";
    const r = Math.round(n * 10) / 10;
    return (Number.isInteger(r) ? r.toFixed(0) : r.toFixed(1)) + " / 20";
  }

  function fmtNiv(n) {
    if (n == null) return "—";
    return (Math.round(n * 10) / 10).toFixed(1) + " / 3";
  }

  function weightedRecent(values) {
    if (!values.length) return null;
    const last = values.slice(-3);
    let wsum = 0, nsum = 0;
    last.forEach((v, i) => {
      const wgt = i + 1;
      wsum += wgt;
      nsum += v * wgt;
    });
    return nsum / wsum;
  }

  function profilEleve(evaluations, tps) {
    const tpById = Object.fromEntries((tps || []).map((t) => [t.id, t]));
    const byComp = {};
    const tpNotes = [];

    (evaluations || []).forEach((ev) => {
      const sc = scoreTp(ev.scores);
      tpNotes.push({
        tp: ev.tp,
        date: ev.date,
        titre: tpById[ev.tp] ? tpById[ev.tp].titre : ev.tp,
        pole: tpById[ev.tp] ? tpById[ev.tp].pole : null,
        note: sc.note,
        niveau: sc.niveau,
        veto: sc.veto,
        niveaux: sc.niveaux,
        commentaire: ev.commentaire || "",
        scores: ev.scores
      });
      Object.entries(sc.niveaux).forEach(([cid, val]) => {
        (byComp[cid] ||= []).push({ date: ev.date, tp: ev.tp, val });
      });
    });

    tpNotes.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    Object.keys(byComp).forEach((cid) => {
      byComp[cid].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    });

    const actuel = {};
    Object.keys(w.COMPETENCES).forEach((cid) => {
      const hist = byComp[cid] || [];
      const niveau = weightedRecent(hist.map((h) => h.val));
      actuel[cid] = {
        niveau,
        hist,
        ...labelNiveau(niveau)
      };
    });

    const notes = tpNotes.map((t) => t.note).filter((n) => n != null);
    return {
      tpNotes,
      actuel,
      moyenne: mean(notes),
      nTp: tpNotes.length
    };
  }

  function sparkPoints(hist, wdt, hgt) {
    if (!hist.length) return "";
    const max = Math.max(hist.length - 1, 1);
    return hist.map((h, i) => {
      const x = (i / max) * (wdt - 4) + 2;
      const y = hgt - 3 - (h.val / 3) * (hgt - 6);
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
  }

  w.Engine = {
    mean, noteFromNiveau, labelNiveau, groupScores, scoreTp,
    fmtNote, fmtNiv, weightedRecent, profilEleve, sparkPoints
  };
})(window);
