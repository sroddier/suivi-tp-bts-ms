window.NIVEAUX = [
  { n: 0, label: "Subit", hint: "La tâche n’est pas menée, ou sans méthode." },
  { n: 1, label: "Exécute", hint: "Réalise avec aide, des manques importants." },
  { n: 2, label: "Maîtrise", hint: "Autonome, quelques écarts mineurs." },
  { n: 3, label: "Expert", hint: "Complet, cohérent, traçable." }
];

window.COMPETENCES = {
  C11: { id: "C11", pole: 1, titre: "Démarche d’investigation", unite: "U5" },
  C12: { id: "C12", pole: 1, titre: "Rétablir la fonction d’un bien", unite: "U5" },
  C13: { id: "C13", pole: 1, titre: "Mettre en service / à l’arrêt", unite: "U5" },
  C21: { id: "C21", pole: 2, titre: "Analyser les risques", unite: "U6" },
  C22: { id: "C22", pole: 2, titre: "Mesures de prévention", unite: "U6" },
  C23: { id: "C23", pole: 2, titre: "Opérations de préventif", unite: "U6" },
  C24: { id: "C24", pole: 2, titre: "Communiquer par l’écrit", unite: "U6" },
  C31: { id: "C31", pole: 3, titre: "Définir une amélioration", unite: "U7" },
  C32: { id: "C32", pole: 3, titre: "Réaliser les travaux", unite: "U7" },
  C33: { id: "C33", pole: 3, titre: "Communiquer oralement", unite: "U7" },
  C41: { id: "C41", pole: 4, titre: "Organisation fonctionnelle, structurelle, temporelle", unite: "U8" },
  C42: { id: "C42", pole: 4, titre: "Chaîne de puissance et d’information", unite: "U8" }
};

window.SECURITE = ["C12-1", "C12-4", "C13-3", "C21-1", "C22-1"];

window.INDICATEURS = {
  "C11-1": "Les informations collectées sont pertinentes, classifiées",
  "C11-2": "Les hypothèses émises sont pertinentes",
  "C11-3": "La hiérarchisation des hypothèses est logique",
  "C11-4": "Les points de test et de contrôle sont identifiés",
  "C11-5": "Les appareils de mesure sont correctement choisis et mis en œuvre",
  "C11-6": "La chronologie des tests, mesures, contrôles est pertinente",
  "C11-7": "La fonction défaillante est identifiée",
  "C11-8": "Les parties défaillantes de la chaîne d’info / puissance sont localisées",
  "C11-9": "Les composants potentiellement défaillants sont localisés",
  "C11-10": "La cause de défaillance est plausible",
  "C12-1": "La dépose / repose suit les règles QHSE",
  "C12-2": "La procédure ou règle associée est respectée",
  "C12-3": "L’adaptation est opérationnelle, le composant est adapté",
  "C12-4": "La réparation d’élément suit les règles QHSE",
  "C12-5": "La réparation du bien est effectuée dans un temps raisonnable",
  "C12-6": "Les paramétrages sont conformes aux attendus",
  "C12-7": "Les procédures de remise en service sont respectées",
  "C12-8": "Le bien est opérationnel",
  "C12-9": "Les conditions de démarrage sont vérifiées",
  "C13-1": "Les procédures de mise en service / arrêt sont suivies",
  "C13-2": "La mise en service ou l’arrêt du bien est établi",
  "C13-3": "Les règles de sécurité des biens et des personnes sont respectées",
  "C13-4": "L’information est consignée, la traçabilité est assurée",
  "C21-1": "Les phénomènes et situations dangereux sont identifiés",
  "C21-2": "Les mesures de prévention proposées sont adaptées",
  "C22-1": "La mise en œuvre des mesures de prévention est opérationnelle",
  "C23-1": "Les opérations effectuées respectent les procédures",
  "C23-2": "Le temps prescrit est respecté",
  "C23-3": "Le bien est fonctionnel à l’issue du préventif",
  "C23-4": "Les résultats de mesure sont cohérents et exploitables",
  "C24-1": "Les éléments techniques et organisationnels essentiels sont collectés",
  "C24-2": "Les informations sont correctement structurées et consignées",
  "C24-3": "GMAO / rapport de surveillance renseigné de manière exploitable",
  "C31-1": "Le besoin est analysé, les données technico-économiques sont repérées",
  "C31-2": "Les solutions proposées permettent de répondre à l’objectif",
  "C31-3": "Le choix de la solution est pertinent et argumenté",
  "C32-1": "La préparation des travaux est opérationnelle",
  "C32-2": "Les travaux respectent les procédures définies",
  "C33-1": "Les informations techniques permettent de comprendre l’activité",
  "C33-2": "L’expression est claire, fluide",
  "C41-1": "Les fonctions du bien sont identifiées à partir du dossier et du réel",
  "C41-2": "L’organisation structurelle (sous-ensembles, composants) est identifiée",
  "C41-3": "L’organisation temporelle (modes de marche, cycle) est identifiée",
  "C42-1": "La chaîne de puissance est caractérisée (énergie, préactionneurs, actionneurs)",
  "C42-2": "La chaîne d’information est caractérisée (capteurs, automate, IHM)"
};

window.POLES = {
  1: "Maintenance corrective",
  2: "Maintenance préventive",
  3: "Maintenance améliorative",
  4: "Intégration d’un bien"
};
