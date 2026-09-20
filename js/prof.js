(function () {
  const $ = (id) => document.getElementById(id);
  const FILTRE_KEY = "suivi-tp-bts-ms-filtres";
  let selCode = null;
  let selTp = (window.TPS && TPS[0]) ? TPS[0].id : "DEC-PAL1";
  let draft = {};
  let selGroupes = null;

  function promo() { return Store.merge(); }

  function groupeOf(e) {
    const g = (e.groupe || "").trim();
    return g || "Sans classe";
  }

  function allGroupes() {
    const set = new Set();
    promo().eleves.forEach((e) => set.add(groupeOf(e)));
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }

  function loadFiltres() {
    try {
      const raw = JSON.parse(localStorage.getItem(FILTRE_KEY) || "null");
      if (Array.isArray(raw) && raw.length) selGroupes = new Set(raw);
    } catch (_) {}
  }

  function saveFiltres() {
    try { localStorage.setItem(FILTRE_KEY, JSON.stringify([...selGroupes])); }
    catch (_) {}
  }

  function syncFiltres() {
    const gs = allGroupes();
    if (!selGroupes) {
      selGroupes = new Set(gs);
      return;
    }
    if (gs.length && ![...selGroupes].some((g) => gs.includes(g))) {
      selGroupes = new Set(gs);
    }
  }

  function filteredEleves() {
    syncFiltres();
    return promo().eleves
      .filter((e) => selGroupes.has(groupeOf(e)))
      .slice()
      .sort((a, b) => {
        const na = ((a.nom || "") + " " + (a.prenom || "")).trim();
        const nb = ((b.nom || "") + " " + (b.prenom || "")).trim();
        return na.localeCompare(nb, "fr");
      });
  }

  function ensureSel() {
    const list = filteredEleves();
    if (!list.find((e) => e.code === selCode)) {
      selCode = list[0] ? list[0].code : null;
      loadDraft();
    }
  }

  function renderPromos() {
    const gs = allGroupes();
    syncFiltres();
    if (!gs.length) {
      $("promos").innerHTML = "<span class='muted'>Aucune classe importée.</span>";
      return;
    }
    $("promos").innerHTML = gs.map((g) =>
      `<label><input type="checkbox" data-g="${g}" ${selGroupes.has(g) ? "checked" : ""}> ${g}</label>`
    ).join("");
    $("promos").querySelectorAll("input").forEach((box) => {
      box.addEventListener("change", () => {
        if (box.checked) selGroupes.add(box.dataset.g);
        else selGroupes.delete(box.dataset.g);
        saveFiltres();
        ensureSel();
        renderSelect();
        renderGrid();
        renderTable();
      });
    });
  }

  function renderSelect() {
    const list = filteredEleves();
    const p = promo();
    $("eleve-sel").innerHTML = list.length
      ? list.map((e) => {
          const evs = p.evaluations.filter((x) => x.code === e.code);
          const label = ((e.nom ? e.nom + " " : "") + e.prenom + " — " + e.code).trim();
          return `<option value="${e.code}" ${e.code === selCode ? "selected" : ""}>${label} (${evs.length} TP)</option>`;
        }).join("")
      : `<option value="">Aucun élève dans cette promo</option>`;
    $("eleve-count").textContent = list.length
      ? list.length + " élève" + (list.length > 1 ? "s" : "") + " dans la sélection"
      : "Cochez au moins une promo.";
  }

  function renderList() {
    renderPromos();
    renderSelect();
  }

  function renderTps() {
    $("tps").innerHTML = TPS.map((t) =>
      `<button type="button" data-tp="${t.id}" class="${t.id === selTp ? "on" : ""}">
        ${t.id} <small>${t.titre}</small>
      </button>`
    ).join("");
    $("tps").querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => { selTp = b.dataset.tp; loadDraft(); render(); });
    });
  }

  function loadDraft() {
    const p = promo();
    const ev = p.evaluations.find((x) => x.code === selCode && x.tp === selTp);
    draft = ev ? { ...ev, scores: { ...ev.scores } } : {
      code: selCode, tp: selTp, date: new Date().toISOString().slice(0, 10), scores: {}, commentaire: ""
    };
  }

  function renderGrid() {
    const tp = TPS.find((t) => t.id === selTp);
    const el = promo().eleves.find((e) => e.code === selCode);
    if (!el || !tp) {
      $("form").innerHTML = "<p class='muted'>Choisissez un élève et un TP.</p>";
      return;
    }
    const live = Engine.scoreTp(draft.scores);
    $("form").innerHTML = `
      <div class="kicker">${el.nom ? el.nom + " " : ""}${el.prenom} · ${el.code}</div>
      <h2>${tp.id} — ${tp.titre}</h2>
      <p class="lede">${tp.resume} Durée indicative : ${tp.duree}.</p>
      <div class="stats" style="margin-top:0.8rem">
        <div class="stat"><b>${Engine.fmtNote(live.note)}</b><span>note du TP</span></div>
        <div class="stat"><b>${Engine.fmtNiv(live.niveau)}</b><span>niveau moyen</span></div>
        <div class="stat ${live.veto ? "n0" : ""}"><b>${live.veto ? "Oui" : "Non"}</b><span>plafond sécurité</span></div>
      </div>
      <div class="toolbar">
        <label>Date <input id="ev-date" type="date" value="${draft.date || ""}"></label>
      </div>
      ${tp.indicateurs.map((id) => {
        const v = draft.scores[id];
        const cid = id.split("-")[0];
        return `<div class="ind">
          <div class="toprow">
            <div><strong>${id}</strong> · ${COMPETENCES[cid].titre}<br><small>${INDICATEURS[id]}</small></div>
          </div>
          <div class="pills" data-id="${id}">
            ${[0, 1, 2, 3].map((n) => `<button type="button" data-n="${n}" class="${v === n ? "on" + n : ""}">${n}</button>`).join("")}
            <button type="button" data-n="" class="skip ${v == null || v === "" ? "on1" : ""}">non obs.</button>
          </div>
        </div>`;
      }).join("")}
      <label>Commentaire pour l’élève
        <textarea id="ev-com" rows="3">${draft.commentaire || ""}</textarea>
      </label>
      <div class="toolbar" style="margin-top:0.8rem">
        <button class="btn" id="save">Enregistrer</button>
        <button class="btn ghost" id="copy">Dupliquer vers…</button>
      </div>
      <p class="muted">Enregistrement local, puis Google Sheet si l’URL /exec est configurée. Pour le site élève : Exporter promo.js.</p>
    `;
    $("form").querySelectorAll(".pills").forEach((p) => {
      p.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => {
          const id = p.dataset.id;
          const n = b.dataset.n;
          if (n === "") delete draft.scores[id];
          else draft.scores[id] = Number(n);
          draft.date = $("ev-date").value;
          draft.commentaire = $("ev-com").value;
          renderGrid();
        });
      });
    });
    $("save").addEventListener("click", () => {
      draft.date = $("ev-date").value;
      draft.commentaire = $("ev-com").value;
      Store.setEval({
        code: selCode, tp: selTp, date: draft.date,
        scores: draft.scores, commentaire: draft.commentaire
      });
      UI.toast(Sheets.configured() ? "Enregistré ici et envoyé vers Google Sheet." : "Enregistré sur cet ordinateur (Sheet non connecté).");
      renderList();
      renderTable();
      if (Sheets.configured()) Sheets.sync();
    });
  }

  function renderTable() {
    const p = promo();
    const ids = ["C11", "C12", "C13", "C21", "C22", "C23", "C24"];
    const list = filteredEleves();
    $("classe").innerHTML = `<tr><th>Élève</th>${ids.map((id) => `<th>${id}</th>`).join("")}<th>Moy.</th></tr>` +
      (list.map((e) => {
        const profil = Engine.profilEleve(p.evaluations.filter((x) => x.code === e.code), TPS);
        return `<tr>
          <td><strong>${e.nom ? e.nom + " " : ""}${e.prenom}</strong><div class="muted">${e.code}${e.groupe ? " · " + e.groupe : ""}</div></td>
          ${ids.map((id) => {
            const a = profil.actuel[id];
            return `<td class="${a.cls}">${a.niveau == null ? "—" : `<span class="tag">${a.label}</span>`}</td>`;
          }).join("")}
          <td class="note">${Engine.fmtNote(profil.moyenne)}</td>
        </tr>`;
      }).join("") || `<tr><td colspan="${ids.length + 2}" class="muted">Aucun élève dans les promos cochées.</td></tr>`);
  }

  function render() {
    renderList();
    renderTps();
    renderGrid();
    renderTable();
  }

  $("add").addEventListener("click", () => {
    const nom = prompt("Nom ?");
    if (nom == null) return;
    const prenom = prompt("Prénom ?");
    if (!prenom) return;
    const used = new Set(promo().eleves.map((e) => e.code));
    const suggest = Pronote.makeCode(nom, prenom, used);
    const code = (prompt("Code élève ?", suggest) || "").toUpperCase().replace(/\s+/g, "");
    if (!code) return;
    const groupe = (prompt("Classe / promo ?", allGroupes()[0] || "MS1") || "").trim();
    Store.upsertEleve({ code, nom: nom.toUpperCase(), prenom, groupe: groupe || "MS1" });
    if (groupe) {
      syncFiltres();
      selGroupes.add(groupe);
      saveFiltres();
    }
    selCode = code;
    loadDraft();
    render();
  });

  $("export").addEventListener("click", () => {
    const blob = new Blob(["window.PROMO = " + Store.exportJson() + ";\n"], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "promo.js";
    a.click();
    UI.toast("Fichier téléchargé. Remplacez js/promo.js puis publier.bat.");
  });

  $("import").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      Store.importJson(await f.text());
      UI.toast("Promo importée.");
      render();
    } catch (err) {
      UI.toast("Import impossible : " + err.message);
    }
  });

  $("reset").addEventListener("click", () => {
    if (confirm("Effacer les notes enregistrées sur cet ordinateur ? La démo publiée reste.")) {
      Store.resetLocal();
      render();
    }
  });

  $("logout").addEventListener("click", () => {
    Auth.lock();
    location.reload();
  });

  function setSheetStatus(text) {
    $("sheet-status").textContent = text;
  }

  function refreshSheetUi() {
    $("sheet-url").value = Sheets.url();
    if (Sheets.configured()) setSheetStatus("URL enregistrée. Cliquez sur Tester.");
    else setSheetStatus("Non connecté — les notes restent seulement dans ce navigateur.");
  }

  $("sheet-save-url").addEventListener("click", async () => {
    Sheets.setUrl($("sheet-url").value);
    if (!Sheets.configured()) {
      setSheetStatus("URL invalide : elle doit commencer par https://script.google.com/");
      return;
    }
    setSheetStatus("Test de connexion…");
    try {
      await Sheets.ping();
      setSheetStatus("Connecté. Les enregistrements partent vers le Google Sheet.");
      UI.toast("Google Sheet connecté.");
      await Sheets.sync();
    } catch (err) {
      setSheetStatus("URL enregistrée, mais le test a échoué : déployez le script (accès « Tout le monde ») puis réessayez. " + err.message);
    }
  });

  $("sheet-test").addEventListener("click", async () => {
    if (!Sheets.configured()) {
      setSheetStatus("Collez d’abord l’URL /exec.");
      return;
    }
    setSheetStatus("Test…");
    try {
      await Sheets.ping();
      setSheetStatus("Connexion OK.");
      UI.toast("Google Sheet joignable.");
    } catch (err) {
      setSheetStatus("Échec : " + err.message);
    }
  });

  $("sheet-load").addEventListener("click", async () => {
    if (!Sheets.configured()) {
      setSheetStatus("Collez d’abord l’URL /exec.");
      return;
    }
    setSheetStatus("Chargement…");
    try {
      const data = await Sheets.load();
      if (!data.eleves || !data.eleves.length) {
        setSheetStatus("Sheet vide. Les données de ce navigateur seront envoyées au prochain enregistrement.");
        await Sheets.sync();
        return;
      }
      Store.importJson(JSON.stringify({
        annee: data.annee,
        groupe: data.groupe,
        eleves: data.eleves,
        evaluations: data.evaluations || [],
        replaceEleves: true
      }));
      ensureSel();
      loadDraft();
      render();
      setSheetStatus(data.eleves.length + " élève(s) chargés depuis Google Sheet.");
      UI.toast("Données chargées depuis Google Sheet.");
    } catch (err) {
      setSheetStatus("Chargement impossible : " + err.message);
    }
  });

  let pending = [];

  function openPronote() {
    $("pronote-modal").hidden = false;
    $("pronote-msg").textContent = "";
  }
  function closePronote() {
    $("pronote-modal").hidden = true;
  }

  function showPreview(text) {
    const parsed = Pronote.rowsFromText(text);
    if (parsed.warning) {
      $("pronote-msg").textContent = parsed.warning;
      $("pronote-preview").hidden = true;
      pending = [];
      return;
    }
    pending = Pronote.assignCodes(parsed.rows, promo().eleves);
    $("pronote-msg").textContent = pending.length + " élève(s) détecté(s). Les codes déjà connus (même nom + prénom) sont conservés.";
    $("pronote-preview").hidden = false;
    $("pronote-rows").innerHTML = pending.map((e, i) =>
      `<tr>
        <td><input type="checkbox" data-i="${i}" checked></td>
        <td>${e.code}</td>
        <td>${e.nom}</td>
        <td>${e.prenom}</td>
        <td>${e.groupe || "—"}</td>
      </tr>`
    ).join("");
  }

  async function fromFile(file) {
    try {
      const text = await Pronote.fileToText(file);
      $("paste-box").value = text;
      showPreview(text);
    } catch (err) {
      $("pronote-msg").textContent = err.message;
    }
  }

  $("pronote").addEventListener("click", openPronote);
  $("pronote-close").addEventListener("click", closePronote);
  $("pronote-modal").addEventListener("click", (e) => {
    if (e.target === $("pronote-modal")) closePronote();
  });
  $("pronote-parse").addEventListener("click", () => showPreview($("paste-box").value));
  $("pronote-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) fromFile(f);
    e.target.value = "";
  });

  const drop = $("drop");
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    const f = e.dataTransfer.files[0];
    if (f) fromFile(f);
  });

  $("pronote-apply").addEventListener("click", () => {
    const chosen = [];
    $("pronote-rows").querySelectorAll("input[type=checkbox]").forEach((box) => {
      if (box.checked) chosen.push(pending[Number(box.dataset.i)]);
    });
    if (!chosen.length) {
      $("pronote-msg").textContent = "Aucun élève coché.";
      return;
    }
    const mode = document.querySelector("input[name=imode]:checked").value;
    const groupes = chosen.map((e) => e.groupe).filter(Boolean);
    const groupe = groupes.length ? groupes.sort((a, b) => groupes.filter((g) => g === b).length - groupes.filter((g) => g === a).length)[0] : "";
    Store.setEleves(chosen, { mode, groupe });
    selCode = chosen[0].code;
    loadDraft();
    render();
    closePronote();
    UI.toast(chosen.length + " élève(s) importé(s) depuis Pronote.");
  });

  $("eleve-sel").addEventListener("change", () => {
    selCode = $("eleve-sel").value || null;
    loadDraft();
    renderGrid();
  });

  refreshSheetUi();
  loadFiltres();
  ensureSel();
  if (!selCode) {
    const first = filteredEleves()[0] || promo().eleves[0];
    if (first) selCode = first.code;
  }
  loadDraft();
  render();

  if (Sheets.configured()) {
    Sheets.load().then((data) => {
      if (!data.eleves || !data.eleves.length) return;
      Store.importJson(JSON.stringify({
        annee: data.annee,
        groupe: data.groupe,
        eleves: data.eleves,
        evaluations: data.evaluations || [],
        replaceEleves: true
      }));
      ensureSel();
      loadDraft();
      render();
      setSheetStatus(data.eleves.length + " élève(s) chargés depuis Google Sheet.");
    }).catch((err) => {
      setSheetStatus("Sheet configuré mais injoignable : " + err.message);
    });
  }
})();
