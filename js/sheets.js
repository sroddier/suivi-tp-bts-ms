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

  function jsonp(action) {
    return new Promise((resolve, reject) => {
      if (!configured()) return reject(new Error("URL Apps Script manquante"));
      const cb = "sheetsCb" + Date.now();
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

  async function load() {
    const res = await jsonp("load");
    if (!res || !res.ok) throw new Error((res && res.error) || "échec");
    return res.data || { eleves: [], evaluations: [] };
  }

  async function save() {
    if (!configured()) throw new Error("URL Apps Script manquante");
    const body = JSON.stringify({ token: TOKEN, action: "save", data: payload() });
    await fetch(url(), {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: body
    });
  }

  let timer = null;
  function sync() {
    if (!configured()) return Promise.resolve(false);
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(async () => {
        try {
          await save();
          resolve(true);
        } catch (e) {
          resolve(false);
        }
      }, 400);
    });
  }

  w.Sheets = { url, setUrl, configured, ping, load, save, sync, SHEET_LINK, TOKEN, DEFAULT_URL };
})(window);
