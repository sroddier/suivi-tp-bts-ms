(function (w) {
  const NOM = /^(nom|name|nomdeleleve|nomdusage|nompatronymique|nomdefamille|nomusage)$/;
  const PRENOM = /^(prenom|prenoms|firstname|prenomeleve)$/;
  const CLASSE = /^(classe|division|div|groupe|promotion|classegroupe|libelleclasse)$/;
  const IDENT = /^(identifiant|login|id|identifiantpronote|ine|identifiantnational)$/;
  const NOMPRE = /^(nomprenom|nomprénom|eleve|élève|eleves|élèves)$/;

  function fold(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "");
  }

  function letters(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase();
  }

  function titleCase(s) {
    const t = String(s || "").trim().replace(/\s+/g, " ");
    if (!t) return "";
    return t.toLowerCase().replace(/(^|[\s\-'])\S/g, (m) => m.toUpperCase());
  }

  function detectSep(line) {
    const counts = [
      { sep: "\t", n: (line.match(/\t/g) || []).length },
      { sep: ";", n: (line.match(/;/g) || []).length },
      { sep: ",", n: (line.match(/,/g) || []).length }
    ].sort((a, b) => b.n - a.n);
    return counts[0].n > 0 ? counts[0].sep : ";";
  }

  function splitLine(line, sep) {
    if (sep === "\t") return line.split("\t").map((c) => c.trim());
    const out = [];
    let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++; }
        else q = !q;
      } else if (ch === sep && !q) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  function mapHeader(cells) {
    const idx = { nom: -1, prenom: -1, classe: -1, ident: -1, nomprenom: -1 };
    cells.forEach((c, i) => {
      const k = fold(c);
      if (NOM.test(k) && idx.nom < 0) idx.nom = i;
      else if (PRENOM.test(k) && idx.prenom < 0) idx.prenom = i;
      else if (CLASSE.test(k) && idx.classe < 0) idx.classe = i;
      else if (IDENT.test(k) && idx.ident < 0) idx.ident = i;
      else if (NOMPRE.test(k) && idx.nomprenom < 0) idx.nomprenom = i;
    });
    if (idx.nomprenom < 0 && idx.nom < 0 && idx.prenom < 0) {
      const joined = cells.map(fold).join(" ");
      if (joined.includes("nom") && joined.includes("prenom") && cells.length === 1) {
        idx.nomprenom = 0;
      }
    }
    return idx;
  }

  function splitNomPrenom(value) {
    const t = String(value || "").trim().replace(/\s+/g, " ");
    if (!t) return { nom: "", prenom: "" };
    if (t.includes(",")) {
      const [a, b] = t.split(",").map((x) => x.trim());
      return { nom: a, prenom: b || "" };
    }
    const parts = t.split(" ");
    if (parts.length === 1) return { nom: parts[0], prenom: "" };
    return { nom: parts.slice(0, -1).join(" "), prenom: parts[parts.length - 1] };
  }

  function isHeaderLike(idx) {
    return idx.nom >= 0 || idx.prenom >= 0 || idx.nomprenom >= 0;
  }

  function rowsFromText(text) {
    const raw = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = raw.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) return { rows: [], warning: "Fichier vide." };

    let sep = detectSep(lines.find((l) => l.includes("\t") || l.includes(";") || l.includes(",")) || lines[0]);
    const parsed = lines.map((l) => splitLine(l, sep));

    let headerAt = -1;
    let idx = { nom: -1, prenom: -1, classe: -1, ident: -1, nomprenom: -1 };
    const scan = Math.min(parsed.length, 20);
    for (let i = 0; i < scan; i++) {
      const tryIdx = mapHeader(parsed[i]);
      if (isHeaderLike(tryIdx)) {
        headerAt = i;
        idx = tryIdx;
        break;
      }
    }

    const body = headerAt >= 0 ? parsed.slice(headerAt + 1) : parsed;
    if (headerAt < 0) {
      const width = Math.max(...parsed.map((r) => r.length));
      if (width >= 2) {
        idx = { nom: 0, prenom: 1, classe: width > 2 ? 2 : -1, ident: -1, nomprenom: -1 };
      } else {
        idx = { nom: -1, prenom: -1, classe: -1, ident: -1, nomprenom: 0 };
      }
    }

    const rows = [];
    body.forEach((cells) => {
      if (cells.every((c) => !c)) return;
      if (cells.length === 1 && fold(cells[0]).startsWith("liste")) return;
      let nom = idx.nom >= 0 ? cells[idx.nom] : "";
      let prenom = idx.prenom >= 0 ? cells[idx.prenom] : "";
      const classe = idx.classe >= 0 ? cells[idx.classe] : "";
      const ident = idx.ident >= 0 ? cells[idx.ident] : "";
      if ((!nom || !prenom) && idx.nomprenom >= 0) {
        const sp = splitNomPrenom(cells[idx.nomprenom]);
        nom = nom || sp.nom;
        prenom = prenom || sp.prenom;
      }
      if (!prenom && nom && nom.includes(" ")) {
        const sp = splitNomPrenom(nom);
        if (sp.prenom) { nom = sp.nom; prenom = sp.prenom; }
      }
      nom = String(nom || "").trim();
      prenom = String(prenom || "").trim();
      if (!nom && !prenom) return;
      if (fold(nom) === "nom" || fold(prenom) === "prenom") return;
      rows.push({
        nom: nom.toUpperCase(),
        prenom: titleCase(prenom),
        groupe: String(classe || "").trim(),
        identifiant: String(ident || "").trim()
      });
    });

    return { rows, warning: rows.length ? "" : "Aucun élève trouvé. Vérifiez que le fichier contient Nom et Prénom." };
  }

  function makeCode(nom, prenom, used) {
    const n = (letters(nom) + "XXX").slice(0, 3);
    const p = (letters(prenom) + "XX").slice(0, 2);
    let base = n + p;
    if (!used.has(base)) return base;
    for (let i = 2; i < 100; i++) {
      const c = n + p.slice(0, 1) + i;
      if (!used.has(c)) return c;
    }
    return base + Math.random().toString(36).slice(2, 4).toUpperCase();
  }

  function keyOf(el) {
    return fold(el.nom) + "|" + fold(el.prenom);
  }

  function assignCodes(rows, existing) {
    const used = new Set((existing || []).map((e) => e.code));
    const byKey = {};
    (existing || []).forEach((e) => { byKey[keyOf(e)] = e; });
    return rows.map((r) => {
      const prev = byKey[keyOf(r)];
      const code = prev ? prev.code : makeCode(r.nom, r.prenom, used);
      used.add(code);
      return {
        code,
        nom: r.nom,
        prenom: r.prenom,
        groupe: r.groupe || (prev && prev.groupe) || "",
        identifiant: r.identifiant || (prev && prev.identifiant) || ""
      };
    });
  }

  async function fileToText(file) {
    const name = (file.name || "").toLowerCase();
    const buf = await file.arrayBuffer();
    if (/\.xlsx?$/.test(name) || file.type.includes("spreadsheet") || file.type.includes("excel")) {
      if (!w.XLSX) throw new Error("Lecture Excel indisponible. Enregistrez en CSV, ou rechargez la page.");
      const wb = w.XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return w.XLSX.utils.sheet_to_csv(sheet, { FS: ";" });
    }
    let text = new TextDecoder("utf-8").decode(buf);
    if ((text.match(/\uFFFD/g) || []).length > 2) {
      text = new TextDecoder("windows-1252").decode(buf);
    }
    return text.replace(/^\uFEFF/, "");
  }

  w.Pronote = { fold, rowsFromText, assignCodes, fileToText, keyOf, makeCode };
})(window);
