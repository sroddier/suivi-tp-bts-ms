/**
 * BTS MS — passerelle Google Sheet
 * 1. Extensions > Apps Script  (depuis le classeur)
 * 2. Coller ce fichier, enregistrer
 * 3. Déployer > Nouveau déploiement > Application Web
 *    - Exécuter en tant que : Moi
 *    - Qui a accès : Tout le monde
 * 4. Copier l’URL …/exec dans l’espace professeur du site
 */
const SPREADSHEET_ID = "1JYMdFuGzN5Hv20Oj4zGj12FU_vlTd7eFV3NdT99p6GA";
const TOKEN = "7856";

function ss() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function sheet_(name, headers) {
  const book = ss();
  let sh = book.getSheetByName(name);
  if (!sh) sh = book.insertSheet(name);
  const first = sh.getRange(1, 1, 1, headers.length).getValues()[0];
  const ok = headers.every((h, i) => String(first[i] || "") === h);
  if (!ok) {
    sh.clear();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function elevesSheet() {
  return sheet_("Eleves", ["code", "nom", "prenom", "groupe", "identifiant"]);
}

function evalsSheet() {
  return sheet_("Evaluations", ["code", "tp", "date", "note", "niveau", "veto", "commentaire", "scores_json"]);
}

function writeAll(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const eleves = Array.isArray(data.eleves) ? data.eleves : [];
    const evaluations = Array.isArray(data.evaluations) ? data.evaluations : [];
    const shE = elevesSheet();
    const lastE = shE.getLastRow();
    if (lastE > 1) shE.getRange(2, 1, lastE - 1, 5).clearContent();
    if (eleves.length) {
      shE.getRange(2, 1, eleves.length, 5).setValues(eleves.map((e) => [
        e.code || "", e.nom || "", e.prenom || "", e.groupe || "", e.identifiant || ""
      ]));
    }
    const shV = evalsSheet();
    const lastV = shV.getLastRow();
    if (lastV > 1) shV.getRange(2, 1, lastV - 1, 8).clearContent();
    if (evaluations.length) {
      shV.getRange(2, 1, evaluations.length, 8).setValues(evaluations.map((ev) => [
        ev.code || "",
        ev.tp || "",
        ev.date || "",
        ev.note == null ? "" : ev.note,
        ev.niveau == null ? "" : ev.niveau,
        ev.veto ? "oui" : "",
        ev.commentaire || "",
        JSON.stringify(ev.scores || {})
      ]));
    }
    const meta = sheet_("Meta", ["cle", "valeur"]);
    meta.getRange(2, 1, 3, 2).setValues([
      ["annee", data.annee || ""],
      ["groupe", data.groupe || ""],
      ["maj", new Date().toISOString()]
    ]);
  } finally {
    lock.releaseLock();
  }
}

function readAll() {
  const shE = elevesSheet();
  const nE = shE.getLastRow();
  const eleves = nE > 1
    ? shE.getRange(2, 1, nE - 1, 5).getValues().filter((r) => r[0]).map((r) => ({
        code: String(r[0]),
        nom: String(r[1] || ""),
        prenom: String(r[2] || ""),
        groupe: String(r[3] || ""),
        identifiant: String(r[4] || "")
      }))
    : [];
  const shV = evalsSheet();
  const nV = shV.getLastRow();
  const evaluations = nV > 1
    ? shV.getRange(2, 1, nV - 1, 8).getValues().filter((r) => r[0] && r[1]).map((r) => {
        let scores = {};
        try { scores = JSON.parse(r[7] || "{}"); } catch (e) { scores = {}; }
        return {
          code: String(r[0]),
          tp: String(r[1]),
          date: String(r[2] || ""),
          note: r[3] === "" ? null : Number(r[3]),
          niveau: r[4] === "" ? null : Number(r[4]),
          veto: String(r[5]).toLowerCase() === "oui",
          commentaire: String(r[6] || ""),
          scores: scores
        };
      })
    : [];
  const shM = sheet_("Meta", ["cle", "valeur"]);
  const meta = {};
  const nM = shM.getLastRow();
  if (nM > 1) {
    shM.getRange(2, 1, nM - 1, 2).getValues().forEach((r) => {
      if (r[0]) meta[String(r[0])] = String(r[1] || "");
    });
  }
  return {
    annee: meta.annee || "",
    groupe: meta.groupe || "",
    eleves: eleves,
    evaluations: evaluations
  };
}

function tokenOk_(value) {
  return String(value || "") === TOKEN;
}

function jsonp_(e, obj) {
  const cb = String((e && e.parameter && e.parameter.callback) || "callback").replace(/[^\w$]/g, "");
  return ContentService
    .createTextOutput(cb + "(" + JSON.stringify(obj) + ")")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doGet(e) {
  e = e || { parameter: {} };
  if (!tokenOk_(e.parameter.token)) return jsonp_(e, { ok: false, error: "token" });
  const action = e.parameter.action || "ping";
  if (action === "load") return jsonp_(e, { ok: true, data: readAll() });
  if (action === "ping") return jsonp_(e, { ok: true, ping: true });
  return jsonp_(e, { ok: false, error: "action" });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (!tokenOk_(body.token)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "token" }));
    }
    if (body.action === "save") {
      writeAll(body.data || {});
      return ContentService.createTextOutput(JSON.stringify({ ok: true }));
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "action" }));
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }));
  }
}
