import { useEffect, useMemo, useRef, useState } from "react";
import { proprietatiStore, clientiStore, programariStore, taskuriStore, comisioaneStore, campaniiStore } from "../data/stores";

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

function formatEuro(n) { return Number(n || 0).toLocaleString("ro-RO"); }

function formatData(d) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

function bar(percent, color) {
  const p = Math.min(Math.max(percent, 0), 100);
  return `[${"█".repeat(Math.round(p / 10))}${"░".repeat(10 - Math.round(p / 10))}] ${Math.round(p)}%`;
}

function detectIntent(q) {
  const lower = q.toLowerCase();
  const intents = [];

  if (/(propriet|imobil|apartament|cas[ăa]|teren|spa[iț]|portofoliu|disponibil)/.test(lower)) intents.push("proprietati");
  if (/(client|lead|persoan[ăa]|contact|interesat|discu[tț]ie)/.test(lower)) intents.push("clienti");
  if (/(programare|vizionare|calendar|ast[ăa]zi|azi|m[âa]ine|s[ăa]pt[ăa]m[âa]n|urm[ăa]toare)/.test(lower)) intents.push("programari");
  if (/(task|de f[ăa]cut|restant|rezolvat|reminder|to[- ]?do)/.test(lower)) intents.push("taskuri");
  if (/(comision|bani|pl[ăa]t|încasare|venit)/.test(lower)) intents.push("comisioane");
  if (/(campanie|marketing|promovare|anun[țt]|reclam[ăa])/.test(lower)) intents.push("campanii");
  if (/(rezumat|activitate|general|tot|overview|dashboard|sumar|pulse)/.test(lower)) intents.push("rezumat");
  if (/(pre[tț]|scump|ieftin|valoare|buget|cost)/.test(lower)) intents.push("preturi");
  if (/(zon[ăa]|cartier|ora[sș]|localitate|loca[tț]ie)/.test(lower)) intents.push("zone");
  if (/(recomand|sugest|ce s[ăa] fac|cum s[ăa]|strategie|urm[ăa]tor|priorit)/.test(lower)) intents.push("recomandari");
  if (/(alert[ăa]|problem[ăa]|urgent|aten[tț]ie|warning|verific)/.test(lower)) intents.push("alerte");
  if (/(top|cel mai|cea mai|cele mai|ranking|clasament)/.test(lower)) intents.push("top");
  if (/(conversie|rata|procent|transform|din|statistic[ăa])/.test(lower)) intents.push("conversie");

  return intents;
}

function genereazaRaspuns(q, date) {
  const intents = detectIntent(q);
  const azi = new Date().toISOString().slice(0, 10);
  const luna = new Date().toISOString().slice(0, 7);

  // --- PROPRIETĂȚI ---
  if (intents.includes("proprietati")) {
    const total = date.proprietati.length;
    const disp = date.proprietati.filter((p) => p.status === "disponibil").length;
    const rezervate = date.proprietati.filter((p) => p.status === "rezervat").length;
    const vandute = date.proprietati.filter((p) => p.status === "vandut").length;
    const inchiriate = date.proprietati.filter((p) => p.status === "inchiriat").length;

    const preturi = date.proprietati.filter((p) => p.pret && p.status === "disponibil").map((p) => Number(p.pret));
    const pretMin = preturi.length ? Math.min(...preturi) : 0;
    const pretMax = preturi.length ? Math.max(...preturi) : 0;
    const pretMediu = preturi.length ? Math.round(preturi.reduce((a, b) => a + b, 0) / preturi.length) : 0;

    const peTipuri = {};
    date.proprietati.forEach((p) => { const t = p.tip || "Necunoscut"; peTipuri[t] = (peTipuri[t] || 0) + 1; });
    const tipuriStr = Object.entries(peTipuri).sort(([, a], [, b]) => b - a).map(([t, n]) => `${t}: ${n}`).join(" · ");

    let raspuns = `🏠 **Portofoliu proprietăți**\n\n`;
    raspuns += `📊 **Total:** ${total} proprietăți\n`;
    raspuns += `${bar((disp / Math.max(total, 1)) * 100, "🟢")} Disponibile: **${disp}**\n`;
    raspuns += `${bar((rezervate / Math.max(total, 1)) * 100, "🔵")} Rezervate: **${rezervate}**\n`;
    raspuns += `${bar((inchiriate / Math.max(total, 1)) * 100, "🟡")} Închiriate: **${inchiriate}**\n`;
    raspuns += `${bar((vandute / Math.max(total, 1)) * 100, "🔴")} Vândute: **${vandute}**\n`;
    raspuns += `\n💶 **Prețuri disponibile:**\n`;
    raspuns += `  Minim: **${formatEuro(pretMin)} €**\n`;
    raspuns += `  Mediu: **${formatEuro(pretMediu)} €**\n`;
    raspuns += `  Maxim: **${formatEuro(pretMax)} €**\n`;
    raspuns += `\n📂 **Compoziție:** ${tipuriStr}`;

    if (disp === 0) raspuns += `\n\n⚠️ Nu ai nicio proprietate disponibilă. Ar trebui să adaugi proprietăți noi.`;
    else if (disp < 3) raspuns += `\n\n💡 Ai doar ${disp} proprietăți disponibile — un portofoliu mai mare atrage mai mulți clienți.`;

    return raspuns;
  }

  // --- CLIENȚI ---
  if (intents.includes("clienti")) {
    const total = date.clienti.length;
    const noi = date.clienti.filter((c) => c.status === "Nou").length;
    const contactati = date.clienti.filter((c) => c.status === "Contactat").length;
    const interesati = date.clienti.filter((c) => c.status === "Interesat").length;
    const inchisi = date.clienti.filter((c) => c.status === "Închis").length;
    const activi = total - inchisi;

    const peSurse = {};
    date.clienti.forEach((c) => { if (c.sursa) { peSurse[c.sursa] = (peSurse[c.sursa] || 0) + 1; } });
    const surseStr = Object.entries(peSurse).sort(([, a], [, b]) => b - a).slice(0, 5).map(([s, n]) => `${s}: ${n}`).join(" · ");

    const bugete = date.clienti.filter((c) => c.buget && c.buget !== "—").map((c) => Number(String(c.buget).replace(/[^0-9]/g, "")));
    const bugetTotal = bugete.reduce((a, b) => a + b, 0);

    let raspuns = `👥 **Baza de clienți**\n\n`;
    raspuns += `📊 **Total:** ${total} clienți (${activi} activi)\n`;
    raspuns += `🆕 Noi: **${noi}**\n`;
    raspuns += `📞 Contactați: **${contactati}**\n`;
    raspuns += `⭐ Interesați: **${interesati}**\n`;
    raspuns += `✅ Închiși: **${inchisi}**\n`;

    const rataConversie = total > 0 ? Math.round((inchisi / total) * 100) : 0;
    raspuns += `\n📈 **Rată de conversie:** ${bar(rataConversie, "🟢")}\n`;
    raspuns += `${inchisi} clienți finalizați din ${total} (${rataConversie}%)\n`;

    if (bugete.length > 0) raspuns += `\n💰 **Buget total clienți:** ${formatEuro(bugetTotal)} € (${bugete.length} cu buget declarat)`;
    if (surseStr) raspuns += `\n\n📡 **Top surse:** ${surseStr}`;

    if (noi > 0) raspuns += `\n\n⚠️ **Atenție:** Ai ${noi} clienți noi necontactați. Contactează-i cât mai curând.`;
    if (activi > 10) raspuns += `\n💪 Ai un pipeline sănătos cu ${activi} clienți activi.`;

    return raspuns;
  }

  // --- PROGRAMĂRI ---
  if (intents.includes("programari")) {
    const aziProg = date.programari.filter((p) => p.data === azi).sort((a, b) => (a.ora || "").localeCompare(b.ora || ""));
    const maine = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0, 10);
    const maineProg = date.programari.filter((p) => p.data === maine);
    const saptamana = date.programari.filter((p) => p.data >= azi && p.data <= new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10));
    const confirmate = date.programari.filter((p) => p.status === "Confirmată").length;
    const anulate = date.programari.filter((p) => p.status === "Anulată").length;

    let raspuns = `📅 **Programări**\n\n`;
    raspuns += `📌 **Astăzi (${new Date().toLocaleDateString("ro-RO", { day: "2-digit", month: "long" })}):** ${aziProg.length} programări\n`;

    if (aziProg.length > 0) {
      aziProg.forEach((p) => {
        raspuns += `  🕐 **${p.ora}** — ${p.titlu}\n     👤 ${p.client} · ${p.tip} · ${p.status}\n`;
      });
    } else {
      raspuns += `  Nicio programare pentru astăzi.\n`;
    }

    raspuns += `\n📆 **Mâine:** ${maineProg.length} programări`;
    raspuns += `\n📊 **Săptămâna aceasta:** ${saptamana.length} programări`;
    raspuns += `\n✅ **Confirmate:** ${confirmate} · ❌ **Anulate:** ${anulate}`;
    raspuns += `\n\n📋 Total programări în sistem: **${date.programari.length}**`;

    if (aziProg.length > 3) raspuns += `\n\n⚠️ Ai o zi încărcată — asigură-te că ai timp între programări.`;

    return raspuns;
  }

  // --- TASK-URI ---
  if (intents.includes("taskuri")) {
    const pending = date.taskuri.filter((t) => t.status === "pending");
    const done = date.taskuri.filter((t) => t.status === "done");
    const restante = pending.filter((t) => t.data && t.data < azi).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
    const today = pending.filter((t) => t.data === azi);
    const high = pending.filter((t) => t.prioritate === "high");
    const medium = pending.filter((t) => t.prioritate === "medium");

    let raspuns = `✅ **Task-uri & Productivitate**\n\n`;
    raspuns += `⏳ În așteptare: **${pending.length}**\n`;
    raspuns += `✔️ Rezolvate: **${done.length}**\n`;
    raspuns += `🔴 Prioritare: **${high.length}** · 🟡 Medii: **${medium.length}**\n`;

    const rataComp = date.taskuri.length > 0 ? Math.round((done.length / date.taskuri.length) * 100) : 0;
    raspuns += `\n📈 **Rată completare:** ${bar(rataComp, "🟢")}\n`;

    if (today.length > 0) {
      raspuns += `\n📌 **Task-uri pentru azi:**\n`;
      today.forEach((t) => { raspuns += `  ${t.prioritate === "high" ? "🔴" : t.prioritate === "medium" ? "🟡" : "🟢"} ${t.titlu}\n`; });
    }

    if (restante.length > 0) {
      raspuns += `\n🚨 **Task-uri restante (${restante.length}):**\n`;
      restante.slice(0, 5).forEach((t) => { raspuns += `  ❗ ${t.titlu} (scadent: ${formatData(t.data)})\n`; });
      if (restante.length > 5) raspuns += `  ... și încă ${restante.length - 5}\n`;
    }

    if (high.length > 3) raspuns += `\n⚠️ Ai ${high.length} task-uri prioritare — concentrează-te pe ele.`;
    if (restante.length === 0 && pending.length === 0) raspuns += `\n🎉 Felicitări! Nu ai task-uri restante.`;

    return raspuns;
  }

  // --- COMISIOANE ---
  if (intents.includes("comisioane")) {
    const total = date.comisioane.length;
    const platite = date.comisioane.filter((c) => c.status === "Plătit");
    const asteptare = date.comisioane.filter((c) => c.status === "În așteptare");
    const sumaPlatita = platite.reduce((s, c) => s + (Number(c.suma) || 0), 0);
    const sumaAsteptare = asteptare.reduce((s, c) => s + (Number(c.suma) || 0), 0);

    const peAgenti = {};
    date.comisioane.forEach((c) => { if (c.agent) { peAgenti[c.agent] = (peAgenti[c.agent] || 0) + (Number(c.suma) || 0); } });
    const topAgenti = Object.entries(peAgenti).sort(([, a], [, b]) => b - a).slice(0, 5);

    let raspuns = `💰 **Comisioane**\n\n`;
    raspuns += `💚 Plătite: **${formatEuro(sumaPlatita)} €** (${platite.length})\n`;
    raspuns += `⏳ În așteptare: **${formatEuro(sumaAsteptare)} €** (${asteptare.length})\n`;
    raspuns += `📊 Total comisioane: **${formatEuro(sumaPlatita + sumaAsteptare)} €**\n`;

    if (topAgenti.length > 0) {
      raspuns += `\n🏆 **Top agenți după comision:**\n`;
      topAgenti.forEach(([agent, suma], i) => {
        raspuns += `  ${i + 1}. ${agent} — ${formatEuro(suma)} €\n`;
      });
    }

    if (asteptare.length > 0) {
      raspuns += `\n⚠️ Ai **${formatEuro(sumaAsteptare)} €** de încasat de la ${asteptare.length} comisioane.`;
      asteptare.slice(0, 3).forEach((c) => { raspuns += `\n  • ${c.agent} — ${formatEuro(c.suma)} €`; });
    }

    return raspuns;
  }

  // --- CAMPANII ---
  if (intents.includes("campanii")) {
    const total = date.campanii.length;
    const active = date.campanii.filter((c) => c.status === "Activă").length;
    const bugetTotal = date.campanii.reduce((s, c) => s + (Number(c.buget) || 0), 0);
    const leaduriGenerate = date.campanii.reduce((s, c) => s + (Number(c.leaduriGenerate) || 0), 0);
    const leaduriTotale = date.clienti.length;
    const costPerLead = leaduriGenerate > 0 ? Math.round(bugetTotal / leaduriGenerate) : 0;

    let raspuns = `📢 **Campanii de marketing**\n\n`;
    raspuns += `📊 Total campanii: **${total}** (${active} active)\n`;
    raspuns += `💰 Buget investit: **${formatEuro(bugetTotal)} €**\n`;
    raspuns += `🎯 Lead-uri generate: **${leaduriGenerate}**\n`;

    if (leaduriGenerate > 0) {
      const taxaConversie = leaduriTotale > 0 ? Math.round((leaduriGenerate / leaduriTotale) * 100) : 0;
      raspuns += `💸 Cost per lead: **${costPerLead} €**\n`;
      raspuns += `📈 Contribuție la total clienți: ${taxaConversie}%\n`;
    }

    if (total === 0) raspuns += `\n💡 Nu ai campanii active. Creează o campanie pentru a atrage lead-uri noi.`;
    if (active === 0 && total > 0) raspuns += `\n⚠️ Nicio campanie nu este activă — reactivează-le pentru a genera lead-uri.`;

    return raspuns;
  }

  // --- PREȚURI ȘI ANALIZĂ ---
  if (intents.includes("preturi")) {
    const disponibile = date.proprietati.filter((p) => p.status === "disponibil" && p.pret);
    if (disponibile.length === 0) return `📊 Nu există proprietăți disponibile cu preț pentru analiză.`;

    const preturi = disponibile.map((p) => ({ nume: p.titlu || p.adresa || "—", pret: Number(p.pret), tip: p.tip, zona: p.zona }));
    const sortate = [...preturi].sort((a, b) => a.pret - b.pret);
    const mediana = sortate[Math.floor(sortate.length / 2)];
    const avg = Math.round(sortate.reduce((s, p) => s + p.pret, 0) / sortate.length);

    let raspuns = `💶 **Analiză prețuri**\n\n`;
    raspuns += `📊 **${disponibile.length}** proprietăți cu preț\n`;
    raspuns += `⬇️ Minim: **${formatEuro(sortate[0].pret)} €** — ${sortate[0].nume}\n`;
    raspuns += `📐 Median: **${formatEuro(mediana.pret)} €** — ${mediana.nume}\n`;
    raspuns += `⬆️ Maxim: **${formatEuro(sortate[sortate.length - 1].pret)} €** — ${sortate[sortate.length - 1].nume}\n`;
    raspuns += `📈 Mediu: **${formatEuro(avg)} €**\n`;

    const peZone = {};
    disponibile.forEach((p) => { if (p.zona) { if (!peZone[p.zona]) peZone[p.zona] = []; peZone[p.zona].push(p.pret); } });
    if (Object.keys(peZone).length > 0) {
      raspuns += `\n📍 **Preț mediu pe zone:**\n`;
      Object.entries(peZone).sort(([, a], [, b]) => b.length - a.length).slice(0, 5).forEach(([zona, preturi]) => {
        raspuns += `  ${zona}: **${formatEuro(Math.round(preturi.reduce((a, b) => a + b, 0) / preturi.length))} €** (${preturi.length} proprietăți)\n`;
      });
    }

    return raspuns;
  }

  // --- ZONE ---
  if (intents.includes("zone")) {
    const peZone = {};
    date.proprietati.forEach((p) => {
      const z = p.zona || p.adresa?.split(",")[0]?.trim() || "Necunoscut";
      if (!peZone[z]) peZone[z] = { total: 0, disponibile: 0 };
      peZone[z].total++;
      if (p.status === "disponibil") peZone[z].disponibile++;
    });

    const zoneSortate = Object.entries(peZone).sort(([, a], [, b]) => b.total - a.total);
    let raspuns = `📍 **Distribuție pe zone**\n\n`;

    zoneSortate.slice(0, 8).forEach(([zona, stats]) => {
      const maxTotal = zoneSortate[0][1].total;
      raspuns += `${bar((stats.total / maxTotal) * 100, "🔵")} ${zona}: **${stats.total}** (${stats.disponibile} disponibile)\n`;
    });

    if (zoneSortate.length === 0) raspuns += `Nicio proprietate cu zonă definită.`;
    if (zoneSortate.length > 8) raspuns += `\n... și încă ${zoneSortate.length - 8} zone.`;

    return raspuns;
  }

  // --- TOP ---
  if (intents.includes("top")) {
    let raspuns = `🏆 **Topuri & Clasamente**\n\n`;

    const topAgenti = {};
    date.comisioane.forEach((c) => { if (c.agent) { topAgenti[c.agent] = (topAgenti[c.agent] || 0) + (Number(c.suma) || 0); } });
    const agSort = Object.entries(topAgenti).sort(([, a], [, b]) => b - a).slice(0, 3);

    if (agSort.length > 0) {
      raspuns += "👑 **Top agenți (comisioane):**\n";
      agSort.forEach(([a, s], i) => {
        const medalie = ["🥇", "🥈", "🥉"][i];
        raspuns += "  " + medalie + " " + a + " — " + formatEuro(s) + " €\n";
      });
    }

    const topSurse = {};
    date.clienti.forEach((c) => { if (c.sursa) { topSurse[c.sursa] = (topSurse[c.sursa] || 0) + 1; } });
    const surseSort = Object.entries(topSurse).sort(([, a], [, b]) => b - a).slice(0, 3);
    if (surseSort.length > 0) {
      raspuns += "\n📡 **Top surse clienți:**\n";
      surseSort.forEach(([s, n], i) => {
        const medalie = ["🥇", "🥈", "🥉"][i];
        raspuns += "  " + medalie + " " + s + " — " + n + " clienți\n";
      });
    }

    const celeMaiScumpe = date.proprietati.filter((p) => p.pret && p.status === "disponibil").sort((a, b) => Number(b.pret) - Number(a.pret)).slice(0, 3);
    if (celeMaiScumpe.length > 0) {
      raspuns += "\n🏠 **Cele mai scumpe proprietăți:**\n";
      celeMaiScumpe.forEach((p, i) => {
        const medalie = ["🥇", "🥈", "🥉"][i];
        raspuns += "  " + medalie + " " + (p.titlu || p.adresa || "—") + " — " + formatEuro(p.pret) + " €\n";
      });
    }

    if (agSort.length === 0 && surseSort.length === 0) raspuns += `Adaugă date (comisioane, clienți cu surse) pentru a vedea topurile.`;
    return raspuns;
  }

  // --- CONVERSIE ---
  if (intents.includes("conversie")) {
    const total = date.clienti.length;
    const inchisi = date.clienti.filter((c) => c.status === "Închis").length;
    const rata = total > 0 ? Math.round((inchisi / total) * 100) : 0;
    const noiNecontactati = date.clienti.filter((c) => c.status === "Nou").length;

    let raspuns = `📊 **Statistici conversie**\n\n`;
    raspuns += `📈 Rată conversie generală: **${rata}%**\n`;
    raspuns += `${bar(rata, "🟢")}\n`;
    raspuns += `\n✅ Clienți închiși: **${inchisi}** din ${total}\n`;
    raspuns += `🆕 Necontactați: **${noiNecontactati}**\n`;

    if (rata < 20 && total > 0) raspuns += `\n⚠️ Rata de conversie este sub 20%. Încearcă să contactezi clienții noi mai rapid.`;
    if (rata >= 50 && total > 0) raspuns += `\n🎉 Rată de conversie excelentă! Continuă strategia actuală.`;
    if (noiNecontactati > 5) raspuns += `\n💡 Ai ${noiNecontactati} clienți necontactați — contactându-i poți crește rata de conversie.`;

    return raspuns;
  }

  // --- ALERTE ---
  if (intents.includes("alerte")) {
    const alerte = [];
    const restante = date.taskuri.filter((t) => t.data && t.data < azi && t.status === "pending");
    const noiNecontactati = date.clienti.filter((c) => c.status === "Nou");
    const faraPret = date.proprietati.filter((p) => p.status === "disponibil" && !p.pret);
    const faraCoordonate = date.proprietati.filter((p) => !p.lat || !p.lng);
    const comisioaneNeplatite = date.comisioane.filter((c) => c.status === "În așteptare");

    if (restante.length > 0) alerte.push({ icon: "🚨", text: `${restante.length} task-uri restante necesită atenție imediată` });
    if (noiNecontactati.length > 0) alerte.push({ icon: "📞", text: `${noiNecontactati.length} clienți noi necontactați` });
    if (faraPret.length > 0) alerte.push({ icon: "💶", text: `${faraPret.length} proprietăți disponibile fără preț setat` });
    if (faraCoordonate.length > 0) alerte.push({ icon: "📍", text: `${faraCoordonate.length} proprietăți fără coordonate pe hartă` });
    if (comisioaneNeplatite.length > 0) alerte.push({ icon: "💰", text: `${formatEuro(comisioaneNeplatite.reduce((s, c) => s + (Number(c.suma) || 0), 0))} € comisioane neîncasate` });

    if (alerte.length === 0) return `✅ **Nicio alertă.** Totul arată bine.`;

    let raspuns = `🚨 **Verificare — ${alerte.length} alerte găsite**\n\n`;
    alerte.forEach((a) => { raspuns += `${a.icon} ${a.text}\n`; });
    raspuns += `\n💡 Rezolvă aceste probleme pentru a optimiza activitatea.`;

    return raspuns;
  }

  // --- RECOMANDĂRI ---
  if (intents.includes("recomandari")) {
    const recomandari = [];
    const noi = date.clienti.filter((c) => c.status === "Nou").length;
    const restante = date.taskuri.filter((t) => t.data && t.data < azi && t.status === "pending").length;
    const disp = date.proprietati.filter((p) => p.status === "disponibil").length;
    const activeCamp = date.campanii.filter((c) => c.status === "Activă").length;
    const faraCoordonate = date.proprietati.filter((p) => !p.lat || !p.lng).length;
    const inchisi = date.clienti.filter((c) => c.status === "Închis").length;

    if (noi > 0) recomandari.push({ p: "ridicată", text: `Contactează cei ${noi} clienți noi în următoarele 24h pentru a nu pierde oportunități` });
    if (restante > 0) recomandari.push({ p: "ridicată", text: `Rezolvă cele ${restante} task-uri restante înainte de orice altceva` });
    if (disp < 3) recomandari.push({ p: "medie", text: "Extinde portofoliul — ai prea puține proprietăți disponibile" });
    if (activeCamp === 0) recomandari.push({ p: "medie", text: "Lansează o campanie de marketing pentru a atrage lead-uri noi" });
    if (faraCoordonate > 5) recomandari.push({ p: "scăzută", text: `Setează coordonatele pentru cele ${faraCoordonate} proprietăți ca să apară pe hartă` });
    if (inchisi === 0) recomandari.push({ p: "medie", text: "Concentrează-te pe închiderea primului client — pipeline-ul trebuie să producă rezultate" });

    if (recomandari.length === 0) return `💡 **Totul merge bine!** Nu am recomandări urgente momentan. Continuă strategia actuală.`;

    let raspuns = `💡 **Recomandări personalizate**\n\n`;
    recomandari.forEach((r) => {
      const badge = r.p === "ridicată" ? "🔴" : r.p === "medie" ? "🟡" : "🟢";
      raspuns += `${badge} [${r.p}] ${r.text}\n\n`;
    });

    return raspuns;
  }

  // --- REZUMAT (default fallback) ---
  const clientiActivi = date.clienti.filter((c) => c.status !== "Închis").length;
  const programariAzi = date.programari.filter((p) => p.data === azi).length;
  const taskuriPending = date.taskuri.filter((t) => t.status === "pending").length;
  const propDisponibile = date.proprietati.filter((p) => p.status === "disponibil").length;
  const restante = date.taskuri.filter((t) => t.data && t.data < azi && t.status === "pending").length;
  const comisioaneAsteptare = date.comisioane.filter((c) => c.status === "În așteptare").reduce((s, c) => s + (Number(c.suma) || 0), 0);

  let raspuns = `📋 **Rezumat general**\n\n`;
  raspuns += `🏠 Proprietăți: **${propDisponibile}** disponibile din **${date.proprietati.length}**\n`;
  raspuns += `👥 Clienți: **${date.clienti.length}** (${clientiActivi} activi)\n`;
  raspuns += `📅 Programări azi: **${programariAzi}**\n`;
  raspuns += `✅ Task-uri: **${taskuriPending}** în așteptare`;

  if (restante > 0) raspuns += ` (⚠️ ${restante} restante)`;
  raspuns += `\n💰 Comisioane: **${formatEuro(comisioaneAsteptare)} €** de încasat\n`;

  raspuns += `\n💡 **Ce poți întreba:**\n`;
  raspuns += `• "analiză prețuri" — prețuri minime, medii, maxime\n`;
  raspuns += `• "top agenți" — clasament performanță\n`;
  raspuns += `• "verifică alerte" — probleme care necesită atenție\n`;
  raspuns += `• "recomandări" — sugestii personalizate\n`;
  raspuns += `• "rata de conversie" — statistici performanță\n`;
  raspuns += `• "distribuție pe zone" — analiză geografică`;

  return raspuns;
}

const SUGESTII_INITIALE = [
  "Rezumatul activității",
  "Care este situația proprietăților?",
  "Arată-mi task-urile restante",
  "Analiză prețuri",
  "Top agenți",
  "Verifică alerte",
  "Recomandări",
  "Rata de conversie",
  "Distribuție pe zone",
  "Care este situația clienților?",
];

export default function AiAssistant() {
  const m = useIsMobile();
  const [mesaje, setMesaje] = useState([]);
  const [inputText, setInputText] = useState("");
  const [seIncarca, setSeIncarca] = useState(false);
  const bottomRef = useRef(null);

  const loadDate = () => ({
    proprietati: proprietatiStore.getAll(),
    clienti: clientiStore.getAll(),
    programari: programariStore.getAll(),
    taskuri: taskuriStore.getAll(),
    comisioane: comisioaneStore.getAll(),
    campanii: campaniiStore.getAll(),
  });

  const [date, setDate] = useState(loadDate);

  useEffect(() => { setDate(loadDate()); }, []);

  const azi = new Date().toISOString().slice(0, 10);

  const insights = useMemo(() => {
    const d = date;
    const alerte = [];
    const restante = d.taskuri.filter((t) => t.data && t.data < azi && t.status === "pending");
    const noi = d.clienti.filter((c) => c.status === "Nou");
    const disp = d.proprietati.filter((p) => p.status === "disponibil").length;
    if (restante.length > 0) alerte.push(`🚨 **${restante.length}** task-uri restante`);
    if (noi.length > 0) alerte.push(`📞 **${noi.length}** clienți noi necontactați`);
    if (disp === 0) alerte.push(`⚠️ Nicio proprietate disponibilă`);
    if (d.comisioane.filter((c) => c.status === "În așteptare").length > 0) {
      const sum = d.comisioane.filter((c) => c.status === "În așteptare").reduce((s, c) => s + (Number(c.suma) || 0), 0);
      alerte.push(`💰 **${formatEuro(sum)} €** comisioane de încasat`);
    }
    return alerte;
  }, [date]);

  useEffect(() => {
    const intro = `Bună! Sunt asistentul tău imobiliar inteligent. Pot să te ajut cu:\n\n🏠 **Proprietăți** — situație, prețuri, zone\n👥 **Clienți** — status, conversie, recomandări\n📅 **Programări** — astăzi, mâine, săptămâna\n✅ **Task-uri** — priorități, restanțe\n💰 **Comisioane** — sume, top agenți\n📢 **Campanii** — performanță marketing\n\nScrie o întrebare sau alege o sugestie mai jos ↓`;
    const extra = [];
    if (insights.length > 0) {
      extra.push({ rol: "asistent", text: `🔍 **Observații rapide:**\n${insights.join("\n")}`, tip: "alerte" });
    }
    setMesaje([{ rol: "asistent", text: intro }, ...extra]);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mesaje, seIncarca]);

  const trimite = (text) => {
    const t = text || inputText.trim();
    if (!t || seIncarca) return;

    const fresh = loadDate();
    setDate(fresh);

    setMesaje((prev) => [...prev, { rol: "user", text: t }]);
    setInputText("");
    setSeIncarca(true);

    setTimeout(() => {
      const raspuns = genereazaRaspuns(t, fresh);
      setMesaje((prev) => [...prev, { rol: "asistent", text: raspuns }]);
      setSeIncarca(false);
    }, 500);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); trimite(); } };

  return (
    <div style={{ padding: m ? "14px" : "28px 32px", maxWidth: 860 }}>
      <header style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>AI Assistant</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Analize inteligente, recomandări și răspunsuri bazate pe datele tale</div>
      </header>

      <div style={{ ...card, overflow: "hidden", display: "flex", flexDirection: "column", height: m ? "calc(100vh - 180px)" : 560 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {mesaje.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.rol === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "88%",
                padding: "14px 18px",
                borderRadius: 16,
                background: msg.rol === "user"
                  ? "var(--primary)"
                  : msg.tip === "alerte" ? "#fef3c7"
                  : "var(--bg-secondary)",
                color: msg.rol === "user"
                  ? "#fff"
                  : msg.tip === "alerte" ? "var(--warning-dark)"
                  : "var(--text-primary)",
                fontSize: 13,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                borderBottomRightRadius: msg.rol === "user" ? 4 : 16,
                borderBottomLeftRadius: msg.rol === "asistent" ? 4 : 16,
                border: msg.tip === "alerte" ? "1px solid #fde68a" : "none",
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {seIncarca && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "12px 18px", borderRadius: 16, background: "var(--bg-secondary)",
                borderBottomLeftRadius: 4, display: "flex", gap: 4, alignItems: "center",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text-tertiary)", animation: "pulse 1.4s infinite" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text-tertiary)", animation: "pulse 1.4s infinite 0.2s" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text-tertiary)", animation: "pulse 1.4s infinite 0.4s" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--border-tertiary)", background: "var(--bg-primary)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {SUGESTII_INITIALE.slice(0, m ? 4 : 8).map((s) => (
              <button key={s} onClick={() => trimite(s)}
                style={{
                  border: "1px solid var(--border-tertiary)", background: "var(--bg-secondary)", color: "var(--text-secondary)",
                  borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 500,
                  whiteSpace: "nowrap",
                }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={input}
              placeholder="Întreabă-mă orice — analizez datele tale în timp real..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={seIncarca}
            />
            <button onClick={() => trimite()} disabled={seIncarca}
              style={{
                border: "none", borderRadius: 12, background: seIncarca ? "var(--border-tertiary)" : "var(--primary)", color: "#fff",
                padding: "10px 20px", fontWeight: 600, cursor: seIncarca ? "default" : "pointer", fontSize: 13, whiteSpace: "nowrap",
              }}>
              Trimite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
