(function () {
  const id = new URLSearchParams(location.search).get("id");
  const tp = (window.TPS || []).find((t) => t.id === id);
  const machine = tp ? MACHINES[tp.machine] : null;
  const err = document.getElementById("err");
  const app = document.getElementById("app");

  if (!tp || !machine) {
    err.hidden = false;
    err.textContent = "TP introuvable. Revenez au catalogue.";
    return;
  }

  document.title = tp.titre + " — BTS MS";
  document.getElementById("brand-sub").textContent = tp.titre;

  const key = "fiche-" + tp.id;
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); }
    catch { return {}; }
  })();

  function chips() {
    const taches = (tp.taches || []).map((id) => {
      const t = TACHES[id];
      return `<span class="chip">${id} · ${t ? t.titre : id}</span>`;
    }).join("");
    const by = {};
    (tp.indicateurs || []).forEach((ind) => {
      const c = ind.split("-")[0];
      (by[c] ||= []).push(ind);
    });
    const comps = Object.keys(by).map((c) => {
      const t = COMPETENCES[c] ? COMPETENCES[c].titre : c;
      return `<span class="chip">${c} · ${t}</span>`;
    }).join("");
    return taches + comps;
  }

  function val(name) {
    return (saved[name] || "").replace(/"/g, "&quot;");
  }

  function field(name, label, rows) {
    if (rows) {
      return `<label>${label}<textarea name="${name}" rows="${rows}">${saved[name] || ""}</textarea></label>`;
    }
    return `<label>${label}<input name="${name}" type="text" value="${val(name)}" /></label>`;
  }

  function header() {
    return `<section class="hero">
      <div class="kicker">${tp.id} · ${tp.duree} · ${machine.atelier}</div>
      <h1>${tp.titre}</h1>
      <p class="lede">${tp.resume}</p>
      <p class="lede" style="margin-top:0.6rem"><strong>${machine.nom}</strong> — ${machine.type} (${machine.marque}). ${machine.fonction}</p>
      <div class="chips">${chips()}</div>
      <div class="toolbar noprint">
        <a class="btn ghost small" href="tps.html">← Catalogue</a>
        <button class="btn ghost small" type="button" id="print">Imprimer</button>
        <button class="btn small" type="button" id="save">Enregistrer la fiche</button>
      </div>
    </section>
    <div class="card" style="margin-bottom:1rem">
      <div class="grid2">
        ${field("eleve", "Nom / prénom / code")}
        ${field("date", "Date")}
      </div>
    </div>`;
  }

  function decouverte() {
    const rows = machine.composants.map((c, i) => `<tr>
      <td>${c.fam}</td>
      <td>${c.nom}</td>
      <td>${c.role}</td>
      <td><input name="rep-${i}" value="${val("rep-" + i)}" placeholder="Repère / localisation" /></td>
      <td><input name="vu-${i}" value="${val("vu-" + i)}" placeholder="Vu / non vu" /></td>
    </tr>`).join("");
    return `${header()}
    <form class="fiche" id="fiche">
      <div class="card">
        <h2>1. Sécurité avant toute mise en service</h2>
        <p class="muted">GAP pôle 2 : C21/C22 sont transversales et s’appliquent aussi au pôle 1. Avant toute conduite de <strong>${machine.nom}</strong>.</p>
        ${field("dangers", "Dangers spécifiques de cette machine (personnes, bien, environnement)", 4)}
        ${field("epi", "EPI et mesures de prévention que vous mettez en œuvre", 3)}
        <div class="checks">
          <label><input type="checkbox" name="au" ${saved.au ? "checked" : ""} /> Arrêts d’urgence localisés et testés (sans forcer le cycle)</label>
          <label><input type="checkbox" name="prot" ${saved.prot ? "checked" : ""} /> Protecteurs en place, capteurs de porte / barrière compris</label>
          <label><input type="checkbox" name="nrj" ${saved.nrj ? "checked" : ""} /> Énergies identifiées : ${machine.energies.join(" · ")}</label>
        </div>
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>2. Conduite du bien — T1-4</h2>
        <p class="muted">C13 — mise en service, cycle, mise à l’arrêt. Vérifications avant marche. Modes : ${machine.modes.join(" · ")}.</p>
        ${field("mes", "Procédure de mise en service que vous avez suivie", 4)}
        ${field("manuel", "Ce que vous avez fait en mode manuel (actionneurs essayés)", 3)}
        ${field("auto", "Observation d’un cycle automatique (étapes vues)", 4)}
        ${field("arret", "Procédure de mise à l’arrêt / consignation légère en fin de séance", 3)}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>3. Identifier le bien — C41 / C42</h2>
        <p class="muted">GAP pôle 4, travaillé sur le plateau (pôle 1) : organisation fonctionnelle / structurelle / temporelle, puis chaînes de puissance et d’information. Localiser, noter le repère.</p>
        <div style="overflow:auto">
          <table>
            <thead><tr><th>Famille</th><th>Composant</th><th>Rôle</th><th>Repère / où</th><th>Vu</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${field("manquant", "Composants vus sur la machine mais absents du tableau", 3)}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>4. Compte rendu — C24</h2>
        <p class="muted">GAP 1re année : compte rendu d’activité pratique. C41-1 fonctions, C41-3 cycle, C42 chaînes.</p>
        ${field("global", "Organisation fonctionnelle : à quoi sert le bien, flux des pièces (C41-1)", 4)}
        ${field("temporel", "Organisation temporelle : modes de marche et déroulement d’un cycle (C41-3)", 4)}
        ${field("detail", "Un sous-ensemble : capteur → automate → préactionneur → actionneur (C42)", 5)}
      </div>
    </form>`;
  }

  function diagnostic() {
    const io = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<tr>
      <td><input name="io-n-${i}" value="${val("io-n-" + i)}" placeholder="I0.2" /></td>
      <td><input name="io-nom-${i}" value="${val("io-nom-" + i)}" placeholder="Nom du signal" /></td>
      <td><input name="io-att-${i}" value="${val("io-att-" + i)}" /></td>
      <td><input name="io-act-${i}" value="${val("io-act-" + i)}" /></td>
      <td><input name="io-c-${i}" value="${val("io-c-" + i)}" /></td>
    </tr>`).join("");
    const mes = [0, 1, 2, 3].map((i) => `<tr>
      <td><input name="m-pt-${i}" value="${val("m-pt-" + i)}" placeholder="Point de test" /></td>
      <td><input name="m-app-${i}" value="${val("m-app-" + i)}" placeholder="Appareil" /></td>
      <td><input name="m-att-${i}" value="${val("m-att-" + i)}" /></td>
      <td><input name="m-mes-${i}" value="${val("m-mes-" + i)}" /></td>
      <td><input name="m-c-${i}" value="${val("m-c-" + i)}" /></td>
    </tr>`).join("");
    return `${header()}
    <form class="fiche" id="fiche">
      <div class="card">
        <h2>T1-1 — Diagnostiquer les pannes</h2>
        <p class="muted">GAP pôle 1, C11. Panne posée à l’avance sur <strong>${machine.nom}</strong>. Collecter, hypothèses, tests, localisation.</p>
        <div class="grid2">
          ${field("di", "DI n°")}
          ${field("demandeur", "Nom du demandeur")}
        </div>
        <div class="grid2">
          <p><strong>Équipement</strong><br>${machine.nom}</p>
          <p><strong>Marque</strong><br>${machine.marque}</p>
        </div>
        ${field("motif", "Motif d’appel, constat opérateur", 4)}
        ${field("obs", "Observations technicien (état général, tous les modes de marche)", 6)}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>État du système au moment du défaut</h2>
        <div class="grid2">
          ${field("we", "Énergie électrique (OK / NOK + précision)")}
          ${field("wp", "Énergie pneumatique (OK / NOK + précision)")}
        </div>
        ${field("wh", "Énergie hydraulique / vide si concerné")}
        ${field("au", "Arrêts d’urgence — position, OK / NOK")}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>Entrées / sorties automate</h2>
        <p class="muted">Lister les E/S utiles, états attendu / actuel, conclusion. C11-2 à C11-10.</p>
        <div style="overflow:auto">
          <table>
            <thead><tr><th>N°</th><th>Nom du signal</th><th>État attendu</th><th>État actuel</th><th>Conclusion</th></tr></thead>
            <tbody>${io}</tbody>
          </table>
        </div>
        ${field("chaine", "Chaîne fonctionnelle mise en cause (info et/ou puissance) et raisonnement", 6)}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>Mesures</h2>
        <p class="muted">Dessiner le schéma sur papier, placer l’appareil, mesurer en présence du professeur. C11-4, C11-5, C11-6.</p>
        <div style="overflow:auto">
          <table>
            <thead><tr><th>Point de test</th><th>Appareil</th><th>Valeur attendue</th><th>Valeur mesurée</th><th>Conclusion</th></tr></thead>
            <tbody>${mes}</tbody>
          </table>
        </div>
        ${field("cause", "Cause de défaillance retenue (plausible, localisée) — C11-10", 4)}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>Prévention — C21 / C22 (avant T1-3)</h2>
        <p class="muted">GAP : C21 et C22 sont transversales, aussi au pôle 1. Analyse de risques avant l’action corrective.</p>
        <div class="checks">
          <label><input type="checkbox" name="c-el" ${saved["c-el"] ? "checked" : ""} /> Consignation électrique (partielle / totale)</label>
          <label><input type="checkbox" name="c-pn" ${saved["c-pn"] ? "checked" : ""} /> Consignation pneumatique</label>
          <label><input type="checkbox" name="c-hy" ${saved["c-hy"] ? "checked" : ""} /> Consignation hydraulique / mécanique / vide</label>
          <label><input type="checkbox" name="c-epi" ${saved["c-epi"] ? "checked" : ""} /> EPI UTE 18-510 (gants 1000 V, VAT, chaussures, tenue)</label>
          <label><input type="checkbox" name="c-ecs" ${saved["c-ecs"] ? "checked" : ""} /> Cadenas, macaron, balisage, nappe si besoin</label>
        </div>
        ${field("c-raison", "Raison de la consignation + composant visé", 3)}
        ${field("c-qui", "Consignation effectuée par / date-heure")}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>T1-3 — Effectuer les actions correctives</h2>
        <p class="muted">GAP C12 : dépannage et/ou réparation. Le paramétrage peut être tout ou partie de la solution.</p>
        ${field("action", "Action réalisée (paramétrage, échange, réparation, réglage) et justification", 4)}
        ${field("qhse", "Règles QHSE respectées lors de l’intervention (C12-1)", 3)}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>T1-4 — Remettre en service</h2>
        <p class="muted">C13 + C12-7 / C12-8. Vérifications avant marche, bien opérationnel, traçabilité.</p>
        ${field("remservice", "Procédure de remise en service suivie et résultats des vérifications", 4)}
        ${field("c-qui2", "Déconsignation / traçabilité (qui, quand)")}
      </div>
      <div class="card" style="margin-top:0.8rem">
        <h2>Étude sécurité sur ce système</h2>
        ${field("s-danger", "Un danger potentiel spécifique à l’opération de maintenance", 3)}
        ${field("s-signes", "Signes ou indicateurs que ce danger est présent", 3)}
        ${field("s-epi", "EPI spécifiques contre ce danger", 2)}
        ${field("s-risque", "Évaluation du risque (faible / moyen / élevé) et critères", 3)}
        ${field("s-proba", "Probabilité d’accident si les mesures ne sont pas suivies", 3)}
      </div>
    </form>`;
  }

  app.innerHTML = tp.type === "decouverte" ? decouverte() : diagnostic();

  function collect() {
    const form = document.getElementById("fiche");
    const data = {};
    form.querySelectorAll("input, textarea").forEach((el) => {
      if (!el.name) return;
      data[el.name] = el.type === "checkbox" ? el.checked : el.value;
    });
    return data;
  }

  function persist() {
    localStorage.setItem(key, JSON.stringify(collect()));
  }

  document.getElementById("fiche").addEventListener("input", persist);
  document.getElementById("fiche").addEventListener("change", persist);
  document.getElementById("save").addEventListener("click", () => {
    persist();
    const t = document.createElement("div");
    t.id = "toast";
    t.textContent = "Fiche enregistrée dans ce navigateur.";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  });
  document.getElementById("print").addEventListener("click", () => window.print());
})();
