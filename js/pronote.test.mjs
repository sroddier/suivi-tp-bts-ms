import fs from "fs";
import vm from "vm";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const dir = dirname(fileURLToPath(import.meta.url));
const ctx = { console, window: {} };
ctx.window = ctx;
vm.runInNewContext(fs.readFileSync(join(dir, "pronote.js"), "utf8"), ctx);
const P = ctx.Pronote;
let failed = 0;

function check(name, text, expect) {
  const r = P.rowsFromText(text);
  const got = r.rows.map((x) => x.nom + "|" + x.prenom + "|" + (x.groupe || ""));
  if (JSON.stringify(got) !== JSON.stringify(expect)) {
    console.log("FAIL", name, got, "expected", expect, r.warning);
    failed++;
  } else console.log("OK", name, got.length);
}

check("csv", fs.readFileSync(join(dir, "..", "exemple-pronote.csv"), "utf8"), [
  "DUPONT|Marie|1BTS MS SP",
  "MARTIN|Léa|1BTS MS SP",
  "BERNARD|Yanis|1BTS MS SP",
  "MOREAU|Inès|1BTS MS SP",
  "GARCIA|Karim|1BTS MS SP"
]);

check("tab extra", "Nom\tPrénom\tDate de naissance\tSexe\tClasse\nBERNARD\tInès\t12/03/2006\tF\tBTS1 MS", [
  "BERNARD|Inès|BTS1 MS"
]);

check("no header", "DUPONT\tMarie\nMARTIN\tLéa", [
  "DUPONT|Marie|",
  "MARTIN|Léa|"
]);

check("combined", "Nom Prénom\nDUPONT Marie\nMARTIN Léa", [
  "DUPONT|Marie|",
  "MARTIN|Léa|"
]);

check("title rows", "Liste des élèves\nClasse : 1BTS MS\n\nNom;Prénom;Classe\nDUPONT;Marie;1BTS MS", [
  "DUPONT|Marie|1BTS MS"
]);

check("nom de l eleve", "Nom de l'élève;Prénom élève;Division\nGARCIA;Karim;MS1", [
  "GARCIA|Karim|MS1"
]);

const rows = P.rowsFromText("Nom;Prénom\nMARTIN;Léa\nMARTIN;Léo").rows;
const coded = P.assignCodes(rows, []);
console.log("codes", coded.map((c) => c.code).join(","));
if (coded[0].code === coded[1].code) {
  console.log("FAIL homonym codes");
  failed++;
} else console.log("OK homonyms");

const again = P.assignCodes(rows, coded);
if (again[0].code !== coded[0].code || again[1].code !== coded[1].code) {
  console.log("FAIL preserve", again);
  failed++;
} else console.log("OK preserve codes");

if (failed) process.exit(1);
console.log("all passed");
