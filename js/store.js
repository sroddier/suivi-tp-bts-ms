(function (w) {
  const KEY = "suivi-tp-bts-ms";

  function published() {
    return JSON.parse(JSON.stringify(w.PROMO || { eleves: [], evaluations: [] }));
  }

  function local() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
  }

  function saveLocal(data, opts) {
    localStorage.setItem(KEY, JSON.stringify(data));
    if (opts && opts.skipSync) return;
    if (w.Sheets && typeof w.Sheets.sync === "function") w.Sheets.sync();
  }

  function merge() {
    const pub = published();
    const loc = local();
    if (!loc) return pub;

    let eleves;
    if (loc.replaceEleves) {
      eleves = [...(loc.eleves || [])];
    } else {
      eleves = [...pub.eleves];
      (loc.eleves || []).forEach((e) => {
        const i = eleves.findIndex((x) => x.code === e.code);
        if (i >= 0) eleves[i] = e; else eleves.push(e);
      });
    }

    const codes = new Set(eleves.map((e) => e.code));
    const evaluations = loc.replaceEleves
      ? pub.evaluations.filter((ev) => codes.has(ev.code))
      : [...pub.evaluations];
    (loc.evaluations || []).forEach((ev) => {
      if (loc.replaceEleves && !codes.has(ev.code)) return;
      const i = evaluations.findIndex((x) => x.code === ev.code && x.tp === ev.tp);
      if (i >= 0) evaluations[i] = ev; else evaluations.push(ev);
    });
    if (loc.deleted) {
      loc.deleted.forEach((d) => {
        const i = evaluations.findIndex((x) => x.code === d.code && x.tp === d.tp);
        if (i >= 0) evaluations.splice(i, 1);
      });
    }
    return {
      annee: loc.annee || pub.annee,
      groupe: loc.groupe || pub.groupe,
      eleves,
      evaluations
    };
  }

  function setEval(ev) {
    const loc = local() || { eleves: [], evaluations: [], deleted: [] };
    loc.evaluations = loc.evaluations || [];
    const i = loc.evaluations.findIndex((x) => x.code === ev.code && x.tp === ev.tp);
    if (i >= 0) loc.evaluations[i] = ev; else loc.evaluations.push(ev);
    loc.deleted = (loc.deleted || []).filter((d) => !(d.code === ev.code && d.tp === ev.tp));
    saveLocal(loc);
  }

  function upsertEleve(el) {
    const cur = merge();
    const loc = local() || { eleves: [], evaluations: [] };
    loc.eleves = loc.replaceEleves ? [...(loc.eleves || [])] : [...cur.eleves];
    loc.replaceEleves = true;
    const i = loc.eleves.findIndex((x) => x.code === el.code);
    if (i >= 0) loc.eleves[i] = Object.assign({}, loc.eleves[i], el);
    else loc.eleves.push(el);
    loc.evaluations = loc.evaluations || [];
    saveLocal(loc);
  }

  function setEleves(eleves, opts) {
    const options = Object.assign({ mode: "replace" }, opts);
    const cur = merge();
    const loc = local() || { evaluations: [], deleted: [] };
    loc.replaceEleves = true;
    if (options.groupe) loc.groupe = options.groupe;
    if (options.mode === "merge") {
      const next = [...cur.eleves];
      eleves.forEach((el) => {
        const i = next.findIndex((x) => x.code === el.code);
        if (i >= 0) next[i] = Object.assign({}, next[i], el);
        else next.push(el);
      });
      loc.eleves = next;
    } else {
      loc.eleves = eleves;
    }
    loc.evaluations = loc.evaluations || [];
    saveLocal(loc);
  }

  function exportJson() {
    return JSON.stringify(merge(), null, 2);
  }

  function importJson(text, opts) {
    let t = String(text || "").replace(/^\uFEFF/, "").trim();
    t = t.replace(/^window\.PROMO\s*=\s*/, "").replace(/;\s*$/, "");
    const data = JSON.parse(t);
    if (!data.eleves || !data.evaluations) throw new Error("Fichier incomplet");
    if (data.eleves.length) data.replaceEleves = true;
    saveLocal(data, opts);
  }

  function resetLocal() {
    localStorage.removeItem(KEY);
  }

  w.Store = { published, local, merge, setEval, upsertEleve, setEleves, exportJson, importJson, resetLocal, saveLocal };
})(window);
