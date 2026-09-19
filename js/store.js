(function (w) {
  const KEY = "suivi-tp-bts-ms";

  function published() {
    return JSON.parse(JSON.stringify(w.PROMO || { eleves: [], evaluations: [] }));
  }

  function local() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
  }

  function saveLocal(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function merge() {
    const pub = published();
    const loc = local();
    if (!loc) return pub;
    const eleves = [...pub.eleves];
    (loc.eleves || []).forEach((e) => {
      const i = eleves.findIndex((x) => x.code === e.code);
      if (i >= 0) eleves[i] = e; else eleves.push(e);
    });
    const evaluations = [...pub.evaluations];
    (loc.evaluations || []).forEach((ev) => {
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
    const loc = local() || { eleves: [], evaluations: [] };
    loc.eleves = loc.eleves || [];
    const i = loc.eleves.findIndex((x) => x.code === el.code);
    if (i >= 0) loc.eleves[i] = el; else loc.eleves.push(el);
    saveLocal(loc);
  }

  function exportJson() {
    return JSON.stringify(merge(), null, 2);
  }

  function importJson(text) {
    const data = JSON.parse(text);
    if (!data.eleves || !data.evaluations) throw new Error("Fichier incomplet");
    saveLocal(data);
  }

  function resetLocal() {
    localStorage.removeItem(KEY);
  }

  w.Store = { published, local, merge, setEval, upsertEleve, exportJson, importJson, resetLocal, saveLocal };
})(window);
