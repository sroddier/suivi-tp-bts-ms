(function () {
  const params = new URLSearchParams(location.search);
  const hash = (location.hash || "").replace("#", "").toUpperCase();
  const start = (params.get("code") || hash || "").toUpperCase();

  const $ = (id) => document.getElementById(id);
  const data = () => Store.merge();

  function findEleve(code) {
    const c = (code || "").trim().toUpperCase();
    return data().eleves.find((e) => e.code.toUpperCase() === c);
  }

  function renderLogin() {
    $("dash").hidden = true;
    $("gate").hidden = false;
  }

  function openEleve(code) {
    const el = findEleve(code);
    if (!el) {
      UI.toast("Code inconnu. Exemple : LEA24");
      return;
    }
    const promo = data();
    const evs = promo.evaluations.filter((e) => e.code === el.code);
    const profil = Engine.profilEleve(evs, TPS);
    $("gate").hidden = true;
    $("dash").hidden = false;
    $("who").textContent = el.prenom;
    $("who-meta").textContent = el.code + " · " + (el.groupe || promo.groupe);
    history.replaceState(null, "", "?code=" + encodeURIComponent(el.code));

    const glob = Engine.labelNiveau(profil.moyenne != null ? profil.moyenne / (20 / 3) : null);
    const moyNiv = Engine.mean(Object.values(profil.actuel).map((c) => c.niveau).filter((v) => v != null));
    const lab = Engine.labelNiveau(moyNiv);

    $("stat-note").textContent = Engine.fmtNote(profil.moyenne);
    $("stat-niv").textContent = lab.label;
    $("stat-niv").parentElement.className = "stat " + lab.cls;
    $("stat-ntp").textContent = String(profil.nTp);

    const order = ["C11", "C12", "C13", "C21", "C22", "C23", "C24", "C41", "C42"];
    $("comps").innerHTML = order.map((id) => {
      const c = COMPETENCES[id];
      const a = profil.actuel[id];
      const width = a.niveau == null ? 0 : (a.niveau / 3) * 100;
      return `<article class="comp ${a.cls}">
        <header>
          <h3>${id} · ${c.titre}</h3>
          <span class="tag">${a.label}</span>
        </header>
        <p>${POLES[c.pole]} · ${c.unite}</p>
        <div class="score-line"><span>${Engine.fmtNiv(a.niveau)}</span><span>${a.hist.length} obs.</span></div>
        <div class="bar"><i style="width:${width}%"></i></div>
        ${UI.spark(a.hist)}
      </article>`;
    }).join("");

    UI.radar($("radar"), profil.actuel, order);

    $("tps").innerHTML = profil.tpNotes.slice().reverse().map((t) => {
      const labN = Engine.labelNiveau(t.niveau);
      const comps = Object.keys(t.niveaux).join(" · ");
      return `<tr class="clickable" data-tp="${t.tp}">
        <td>${t.date || ""}</td>
        <td><strong>${t.tp}</strong><div class="muted">${t.titre}</div></td>
        <td>${comps}</td>
        <td class="${labN.cls}"><span class="tag">${labN.label}</span></td>
        <td class="note">${Engine.fmtNote(t.note)}${t.veto ? "<div class='muted'>plafond sécurité</div>" : ""}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="5" class="muted">Aucune évaluation publiée.</td></tr>`;

    $("tps").querySelectorAll("tr.clickable").forEach((row) => {
      row.addEventListener("click", () => showTp(el, row.dataset.tp, profil));
    });
  }

  function showTp(el, tpId, profil) {
    const t = profil.tpNotes.find((x) => x.tp === tpId);
    if (!t) return;
    const tp = TPS.find((x) => x.id === tpId);
    const box = $("detail");
    box.hidden = false;
    const rows = Object.entries(t.scores).map(([id, v]) => {
      const lab = Engine.labelNiveau(v);
      return `<tr>
        <td>${id}</td>
        <td>${INDICATEURS[id] || ""}</td>
        <td class="${lab.cls}"><span class="tag">${v} · ${lab.label}</span></td>
      </tr>`;
    }).join("");
    box.innerHTML = `
      <div class="kicker">${t.date} · pôle ${tp ? tp.pole : ""}</div>
      <h2>${t.tp} — ${t.titre}</h2>
      <p class="lede">Note tirée des compétences observées : <strong>${Engine.fmtNote(t.note)}</strong>
        ${t.veto ? " · <strong>plafond sécurité</strong> (indicateur QHSE à 0)" : ""}</p>
      ${t.commentaire ? `<p class="notice">${t.commentaire}</p>` : ""}
      <table style="margin-top:0.8rem">
        <thead><tr><th>Ind.</th><th>Attendu</th><th>Niveau</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("go").addEventListener("click", () => openEleve($("code").value));
  $("code").addEventListener("keydown", (e) => { if (e.key === "Enter") openEleve($("code").value); });
  document.querySelectorAll("[data-demo]").forEach((b) => {
    b.addEventListener("click", () => openEleve(b.dataset.demo));
  });
  $("out").addEventListener("click", () => {
    history.replaceState(null, "", location.pathname);
    renderLogin();
  });

  if (start) openEleve(start);
})();
