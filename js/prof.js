(function () {
  const $ = (id) => document.getElementById(id);
  let selCode = null;
  let selTp = "TP01";
  let draft = {};

  function promo() { return Store.merge(); }

  function renderList() {
    const p = promo();
    $("eleves").innerHTML = p.eleves.map((e) => {
      const evs = p.evaluations.filter((x) => x.code === e.code);
      const profil = Engine.profilEleve(evs, TPS);
      return `<button type="button" data-code="${e.code}" class="${e.code === selCode ? "on" : ""}">
        ${e.prenom} <small>${e.code} · ${Engine.fmtNote(profil.moyenne)} · ${evs.length} TP</small>
      </button>`;
    }).join("");
    $("eleves").querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => { selCode = b.dataset.code; loadDraft(); render(); });
    });
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
      <div class="kicker">${el.prenom} · ${el.code}</div>
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
      <p class="muted">Enregistrement local (navigateur). Pour le publier aux élèves : Exporter, coller dans js/promo.js, puis publier.bat.</p>
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
      UI.toast("Évaluation enregistrée sur cet ordinateur.");
      renderList();
    });
  }

  function renderTable() {
    const p = promo();
    const ids = ["C11", "C12", "C13", "C21", "C22", "C23", "C24"];
    $("classe").innerHTML = `<tr><th>Élève</th>${ids.map((id) => `<th>${id}</th>`).join("")}<th>Moy.</th></tr>` +
      p.eleves.map((e) => {
        const profil = Engine.profilEleve(p.evaluations.filter((x) => x.code === e.code), TPS);
        return `<tr>
          <td><strong>${e.prenom}</strong><div class="muted">${e.code}</div></td>
          ${ids.map((id) => {
            const a = profil.actuel[id];
            return `<td class="${a.cls}">${a.niveau == null ? "—" : `<span class="tag">${a.label}</span>`}</td>`;
          }).join("")}
          <td class="note">${Engine.fmtNote(profil.moyenne)}</td>
        </tr>`;
      }).join("");
  }

  function render() {
    renderList();
    renderTps();
    renderGrid();
    renderTable();
  }

  $("add").addEventListener("click", () => {
    const prenom = prompt("Prénom de l’élève ?");
    if (!prenom) return;
    const code = (prompt("Code élève (ex. LEA24) ?", prenom.slice(0, 3).toUpperCase() + "24") || "").toUpperCase();
    if (!code) return;
    Store.upsertEleve({ code, prenom, groupe: "MS1" });
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

  const first = promo().eleves[0];
  if (first) selCode = first.code;
  loadDraft();
  render();
})();
