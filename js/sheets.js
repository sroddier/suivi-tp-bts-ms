(function (w) {
  const URL_KEY = "suivi-tp-bts-ms-sheet-url";
  const TOKEN = "7856";
  const DEFAULT_URL = "https://script.google.com/macros/s/AKfycbya9Uhkv38wG-PDYVEPbFX1qtnoWFmU6zuGkto758amGWE-kGpRWZVoMEMhUWvwmJ10/exec";
  const SHEET_LINK = "https://docs.google.com/spreadsheets/d/1JYMdFuGzN5Hv20Oj4zGj12FU_vlTd7eFV3NdT99p6GA/edit";

  function url() {
    try {
      const stored = (localStorage.getItem(URL_KEY) || "").trim();
      return stored || DEFAULT_URL;
    } catch {
      return DEFAULT_URL;
    }
  }

  function setUrl(u) {
    u = String(u || "").trim().replace(/\/+$/, "");
    try { localStorage.setItem(URL_KEY, u); }
    catch (_) {}
  }

  function configured() {
    return /^https:\/\/script\.google\.com\//.test(url());
  }

  function payload() {
    const data = w.Store.merge();
    data.evaluations = (data.evaluations || []).map((ev) => {
      const sc = w.Engine.scoreTp(ev.scores || {});
      return Object.assign({}, ev, {
        note: sc.note,
        niveau: sc.niveau,
        veto: sc.veto
      });
    });
    return data;
  }

  let jsonpSeq = 0;
  function jsonp(action) {
    return new Promise((resolve, reject) => {
      if (!configured()) return reject(new Error("URL Apps Script manquante"));
      const cb = "sheetsCb" + (++jsonpSeq);
      const t = setTimeout(() => { cleanup(); reject(new Error("Délai dépassé")); }, 20000);
      const script = document.createElement("script");
      function cleanup() {
        clearTimeout(t);
        try { delete w[cb]; } catch (_) { w[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      w[cb] = function (data) {
        cleanup();
        resolve(data);
      };
      script.onerror = function () {
        cleanup();
        reject(new Error("Impossible de joindre Google"));
      };
      const sep = url().indexOf("?") >= 0 ? "&" : "?";
      script.src = url() + sep + "action=" + encodeURIComponent(action)
        + "&token=" + encodeURIComponent(TOKEN)
        + "&callback=" + encodeURIComponent(cb);
      document.body.appendChild(script);
    });
  }

  async function ping() {
    const res = await jsonp("ping");
    if (!res || !res.ok) throw new Error((res && res.error) || "échec");
    return res;
  }

  function asIsoDate(value) {
    const s = String(value == null ? "" : value).trim();
    if (!s) return "";
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return iso[1] + "-" + iso[2] + "-" + iso[3];
    const fr = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (fr) return fr[3] + "-" + fr[2].padStart(2, "0") + "-" + fr[1].padStart(2, "0");
    const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const long = s.match(/^[A-Za-z]{3} ([A-Za-z]{3}) (\d{1,2}) (\d{4})/);
    if (long && months[long[1]]) return long[3] + "-" + months[long[1]] + "-" + String(long[2]).padStart(2, "0");
    return s;
  }

  async function load() {
    const res = await jsonp("load");
    if (!res || !res.ok) throw new Error((res && res.error) || "échec");
    const data = res.data || { eleves: [], evaluations: [] };
    data.evaluations = (data.evaluations || []).map((ev) => Object.assign({}, ev, { date: asIsoDate(ev.date) }));
    return data;
  }

  async function save() {
    if (!configured()) throw new Error("URL Apps Script manquante");
    const body = JSON.stringify({ token: TOKEN, action: "save", data: payload() });
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      await fetch(url(), {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: body,
        signal: ctrl.signal
      });
    } catch (e) {
      if (e && e.name === "AbortError") throw new Error("Délai dépassé");
      throw new Error("Impossible de joindre Google");
    } finally {
      clearTimeout(t);
    }
  }

  function canonScores(scores) {
    const out = {};
    Object.keys(scores || {}).sort().forEach((k) => {
      const n = Number(scores[k]);
      if (!Number.isNaN(n)) out[k] = n;
    });
    return out;
  }

  function canonEval(ev) {
    return {
      code: String(ev.code || "").trim(),
      tp: String(ev.tp || "").trim(),
      commentaire: String(ev.commentaire || "").trim(),
      scores: canonScores(ev.scores)
    };
  }

  function canonEleve(e) {
    return {
      code: String(e.code || "").trim(),
      nom: String(e.nom || "").trim(),
      prenom: String(e.prenom || "").trim(),
      groupe: String(e.groupe || "").trim(),
      identifiant: String(e.identifiant || "").trim()
    };
  }

  function sameData(a, b) {
    const byCode = (x, y) => x.code.localeCompare(y.code);
    const byTp = (x, y) => (x.code + "\0" + x.tp).localeCompare(y.code + "\0" + y.tp);
    const elevesA = (a.eleves || []).map(canonEleve).sort(byCode);
    const elevesB = (b.eleves || []).map(canonEleve).sort(byCode);
    const evalsA = (a.evaluations || []).map(canonEval).sort(byTp);
    const evalsB = (b.evaluations || []).map(canonEval).sort(byTp);
    return JSON.stringify(elevesA) === JSON.stringify(elevesB)
      && JSON.stringify(evalsA) === JSON.stringify(evalsB);
  }

  function matchesExpect(remote, expect) {
    const want = canonEval(expect);
    const ev = (remote.evaluations || []).find((x) => canonEval(x).code === want.code && canonEval(x).tp === want.tp);
    if (!ev) return "évaluation absente après relecture";
    const got = canonEval(ev);
    if (JSON.stringify(got.scores) !== JSON.stringify(want.scores)) return "niveaux différents après relecture";
    if (got.commentaire !== want.commentaire) return "commentaire différent après relecture";
    return "";
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Le POST part en no-cors : le navigateur ne lit pas la réponse. On relit le classeur.
  async function verify(expect) {
    let reason = "le classeur relu ne correspond pas à l’envoi";
    for (let i = 0; i < 3; i++) {
      if (i) await sleep(700);
      const remote = await load();
      if (expect && expect.code && expect.tp) {
        reason = matchesExpect(remote, expect);
        if (!reason) return { ok: true };
        continue;
      }
      if (sameData(payload(), remote)) return { ok: true };
    }
    return { ok: false, reason: reason };
  }

  let timer = null;
  let waiters = [];
  let onResult = null;
  let chain = Promise.resolve();

  async function flush() {
    if (!waiters.length) return;
    const batch = waiters;
    waiters = [];
    const expect = batch.reduce((acc, w) => w.expect || acc, null);
    let result;
    try {
      await save();
      result = await verify(expect);
    } catch (e) {
      result = { ok: false, reason: (e && e.message) || "échec" };
    }
    batch.forEach((w) => w.resolve(result));
    if (typeof onResult === "function") {
      try { onResult(result); } catch (_) {}
    }
  }

  function sync(expect) {
    if (!configured()) return Promise.resolve({ ok: false, skipped: true, reason: "Sheet non connecté" });
    return new Promise((resolve) => {
      waiters.push({ resolve, expect: expect || null });
      clearTimeout(timer);
      timer = setTimeout(() => {
        chain = chain.then(flush, flush);
      }, 400);
    });
  }

  function onSyncResult(fn) {
    onResult = fn;
  }

  w.Sheets = {
    url, setUrl, configured, ping, load, save, sync, onSyncResult,
    SHEET_LINK, TOKEN, DEFAULT_URL
  };
})(window);
