window.TACHES = {
  "T1-1": { id: "T1-1", pole: 1, titre: "Diagnostiquer les pannes" },
  "T1-3": { id: "T1-3", pole: 1, titre: "Effectuer les actions correctives" },
  "T1-4": { id: "T1-4", pole: 1, titre: "Remettre en service" },
  "T2-1": { id: "T2-1", pole: 2, titre: "Mettre en œuvre le plan de maintenance préventive" },
  "T2-2": { id: "T2-2", pole: 2, titre: "Exploiter les informations recueillies" },
  "T2-3": { id: "T2-3", pole: 2, titre: "Assurer la communication interne et externe" },
  "T4-1": { id: "T4-1", pole: 4, titre: "Prendre en compte les contraintes de maintenance" }
};

window.IND_DECOUVERTE = [
  "C13-1", "C13-2", "C13-3", "C13-4",
  "C21-1", "C21-2", "C22-1",
  "C41-1", "C41-2", "C41-3",
  "C42-1", "C42-2",
  "C24-1", "C24-2"
];

window.IND_DIAGNOSTIC = [
  "C11-1", "C11-2", "C11-3", "C11-4", "C11-5",
  "C11-6", "C11-7", "C11-8", "C11-9", "C11-10",
  "C12-1", "C12-2", "C12-6", "C12-7", "C12-8",
  "C13-1", "C13-2", "C13-3", "C13-4",
  "C21-1", "C22-1",
  "C24-1", "C24-2"
];

window.TPS = [
  {
    id: "DEC-PAL1",
    titre: "Découverte — Pallettic 1",
    type: "decouverte",
    machine: "pal1",
    pole: 1,
    duree: "2 h",
    taches: ["T1-4", "T4-1"],
    resume: "T1-4 mise en service / conduite. T4-1 : organisation fonctionnelle, structurelle, temporelle et chaînes de puissance / information. Pas de panne.",
    indicateurs: IND_DECOUVERTE
  },
  {
    id: "DEC-PAL2",
    titre: "Découverte — Pallettic 2",
    type: "decouverte",
    machine: "pal2",
    pole: 1,
    duree: "2 h",
    taches: ["T1-4", "T4-1"],
    resume: "T1-4 mise en service / conduite. T4-1 : organisation fonctionnelle, structurelle, temporelle et chaînes de puissance / information. Pas de panne.",
    indicateurs: IND_DECOUVERTE
  },
  {
    id: "DEC-RAV",
    titre: "Découverte — Ravoux",
    type: "decouverte",
    machine: "ravoux",
    pole: 1,
    duree: "2 h",
    taches: ["T1-4", "T4-1"],
    resume: "T1-4 mise en service / conduite. T4-1 : organisation fonctionnelle, structurelle, temporelle et chaînes de puissance / information. Pas de panne.",
    indicateurs: IND_DECOUVERTE
  },
  {
    id: "DEC-ERM",
    titre: "Découverte — Ermax",
    type: "decouverte",
    machine: "ermax",
    pole: 1,
    duree: "2 h",
    taches: ["T1-4", "T4-1"],
    resume: "T1-4 mise en service / conduite. T4-1 : organisation fonctionnelle, structurelle, temporelle et chaînes de puissance / information. Pas de panne.",
    indicateurs: IND_DECOUVERTE
  },
  {
    id: "DIA-PAL1",
    titre: "Diagnostic — Pallettic 1",
    type: "diagnostic",
    machine: "pal1",
    pole: 1,
    duree: "3 h",
    taches: ["T1-1", "T1-3", "T1-4"],
    resume: "Pôle 1 GAP : T1-1 diagnostiquer, T1-3 action corrective (dépannage / paramétrage / échange), T1-4 remettre en service. Panne posée à l’avance.",
    indicateurs: IND_DIAGNOSTIC
  },
  {
    id: "DIA-PAL2",
    titre: "Diagnostic — Pallettic 2",
    type: "diagnostic",
    machine: "pal2",
    pole: 1,
    duree: "3 h",
    taches: ["T1-1", "T1-3", "T1-4"],
    resume: "Pôle 1 GAP : T1-1 diagnostiquer, T1-3 action corrective (dépannage / paramétrage / échange), T1-4 remettre en service. Panne posée à l’avance.",
    indicateurs: IND_DIAGNOSTIC
  },
  {
    id: "DIA-RAV",
    titre: "Diagnostic — Ravoux",
    type: "diagnostic",
    machine: "ravoux",
    pole: 1,
    duree: "3 h",
    taches: ["T1-1", "T1-3", "T1-4"],
    resume: "Pôle 1 GAP : T1-1 diagnostiquer, T1-3 action corrective (dépannage / paramétrage / échange), T1-4 remettre en service. Panne posée à l’avance.",
    indicateurs: IND_DIAGNOSTIC
  },
  {
    id: "DIA-ERM",
    titre: "Diagnostic — Ermax",
    type: "diagnostic",
    machine: "ermax",
    pole: 1,
    duree: "3 h",
    taches: ["T1-1", "T1-3", "T1-4"],
    resume: "Pôle 1 GAP : T1-1 diagnostiquer, T1-3 action corrective (dépannage / paramétrage / échange), T1-4 remettre en service. Panne posée à l’avance.",
    indicateurs: IND_DIAGNOSTIC
  }
];
