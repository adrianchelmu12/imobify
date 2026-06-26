function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

const IMG = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
  "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
  "https://images.unsplash.com/photo-1558036117-15d41225cdb4?w=800",
];

const AGENTI = ["Marius Tudor", "Andreea Popa", "Cristian Nistor", "Diana Covaci"];

const PROPRIETATI = [
  { titlu: "Apartament 3 camere decomandat, Central Park, Copou, Iași", tip: "Apartament", tranzactie: "Vânzare", status: "disponibil", oras: "Iași", zona: "Copou", judet: "Iași", camere: 3, bai: 2, suprafata: 78, etaj: "3", an: 2021, pret: 125000, descriere: "Apartament decomandat ultracentral, situat la etajul 3 dintr-un bloc nou construit în 2021. Finisaje premium: parchet stratificat, faianță italiană, uși interior MDF. Bucătărie complet utilată cu electrocasnice Bosch. Centrală termică proprie, balcon generos de 8 mp, loc de parcare subteran inclus.", facilitati: ["Aer condiționat", "Centrală proprie", "Balcon", "Parcare", "Lift"], negociabil: true, recomandata: true, badge_exclusivitate: true },
  { titlu: "Garsonieră modernă ultracentral, Piața Unirii, Iași", tip: "Garsonieră", tranzactie: "Vânzare", status: "disponibil", oras: "Iași", zona: "Centru", judet: "Iași", camere: 1, bai: 1, suprafata: 36, etaj: "2", an: 2023, pret: 68000, descriere: "Garsonieră nouă, finalizată în 2023, la 200m de Piața Unirii. Finisaje de calitate, centrală termică, aer condiționat. Ideală pentru investiție sau tânăr cuplu.", facilitati: ["Aer condiționat", "Centrală proprie", "Lift"], negociabil: false, recomandata: false },
  { titlu: "Apartament 2 camere, zonă liniștită, Canta, Iași", tip: "Apartament", tranzactie: "Vânzare", status: "disponibil", oras: "Iași", zona: "Canta", judet: "Iași", camere: 2, bai: 1, suprafata: 52, etaj: "1", an: 1985, pret: 59000, descriere: "Apartament 2 camere semidecomandat. Bucătărie spațioasă, balcon de 4 mp. Cartier cu toate facilitățile: școli, Lidl, farmacii. Transport la 2 minute.", facilitati: ["Apometre", "Transport public"], negociabil: true, recomandata: false },
  { titlu: "Casă 4 camere cu grădină, Valea Lupului, Iași", tip: "Casă", tranzactie: "Vânzare", status: "disponibil", oras: "Iași", zona: "Valea Lupului", judet: "Iași", camere: 4, bai: 2, suprafata: 145, etaj: "—", an: 2018, pret: 185000, descriere: "Casă familială construită în 2018 pe 500 mp. Living open space, 3 dormitoare, garaj 2 mașini, grădină cu livadă. Încălzire centrală pe gaz, geamuri tripan.", facilitati: ["Centrală proprie", "Garaj", "Grădină", "Aer condiționat"], negociabil: true, recomandata: true },
  { titlu: "Apartament 3 camere lux, Palas, Centru Civic, Iași", tip: "Apartament", tranzactie: "Vânzare", status: "disponibil", oras: "Iași", zona: "Centru Civic", judet: "Iași", camere: 3, bai: 2, suprafata: 95, etaj: "7", an: 2022, pret: 210000, descriere: "Apartament de lux vis-à-vis de Palas Mall. Living generos, bucătărie cu insulă, 2 dormitoare, 2 băi premium. Smart home, parcare subterană dublu, concierge.", facilitati: ["Aer condiționat", "Centrală proprie", "Lift", "Parcare", "Balcon"], negociabil: false, recomandata: true, badge_exclusivitate: true, badge_comision_zero: true },
  { titlu: "Teren intravilan 800 mp, deschidere la DN, Miroslava, Iași", tip: "Terenuri", tranzactie: "Vânzare", status: "disponibil", oras: "Iași", zona: "Miroslava", judet: "Iași", camere: 0, bai: 0, suprafata: 800, etaj: "—", an: "—", pret: 95000, descriere: "Teren intravilan cu deschidere de 30m la DN. Utilități disponibile la poartă. Zonă în dezvoltare, potențial mare.", facilitati: ["Apă", "Gaz", "Curent", "Canalizare"], negociabil: true },
  { titlu: "Închiriez apartament 2 camere mobiliat, Tătărași, Iași", tip: "Apartament", tranzactie: "Închiriere", status: "disponibil", oras: "Iași", zona: "Tătărași", judet: "Iași", camere: 2, bai: 1, suprafata: 55, etaj: "4", an: 2005, pret: 400, descriere: "Apartament decomandat complet mobilat lângă Iulius Mall. Bucătărie echipată, dormitor cu pat dublu, living cu canapea. Balcon, centrală proprie. Ideal tineri.", facilitati: ["Centrală proprie", "Balcon", "Mobilat", "Utilat"], negociabil: false },
  { titlu: "Spațiu comercial 60 mp, centru, Iași", tip: "Spațiu comercial", tranzactie: "Închiriere", status: "disponibil", oras: "Iași", zona: "Centru", judet: "Iași", camere: 0, bai: 1, suprafata: 60, etaj: "parter", an: 2000, pret: 950, descriere: "Spațiu comercial la parter pe Bd. Ștefan cel Mare. Vitrină de 5m, aer condiționat, trafic pietonal intens.", facilitati: ["Aer condiționat"], negociabil: true, recomandata: true },
  { titlu: "Apartament 4 camere penthouse, Zorilor, Cluj-Napoca", tip: "Apartament", tranzactie: "Vânzare", status: "disponibil", oras: "Cluj-Napoca", zona: "Zorilor", judet: "Cluj", camere: 4, bai: 3, suprafata: 135, etaj: "10", an: 2023, pret: 285000, descriere: "Penthouse exclusivist cu terasă de 60 mp. Living cu înălțime dublă, bucătărie italiană, dressing, 3 băi de lux. Încălzire pardoseală, smart home.", facilitati: ["Aer condiționat", "Centrală proprie", "Lift", "Parcare", "Balcon", "Încălzire pardoseală"], negociabil: false, recomandata: true, badge_exclusivitate: true },
  { titlu: "Casă de vacanță 3 camere, Bună Ziua, Cluj-Napoca", tip: "Casă", tranzactie: "Vânzare", status: "vandut", oras: "Cluj-Napoca", zona: "Bună Ziua", judet: "Cluj", camere: 3, bai: 2, suprafata: 120, etaj: "—", an: 2015, pret: 170000, descriere: "Casă cochetă pe teren de 450 mp cu grădină. Parter: living, bucătărie. Etaj: 2 dormitoare. Garaj, centrală gaz.", facilitati: ["Centrală proprie", "Garaj", "Grădină"] },
  { titlu: "Apartament 3 camere, Elisabetin, Timișoara", tip: "Apartament", tranzactie: "Vânzare", status: "disponibil", oras: "Timișoara", zona: "Elisabetin", judet: "Timiș", camere: 3, bai: 1, suprafata: 72, etaj: "2", an: 2010, pret: 115000, descriere: "Apartament 3 camere în Elisabetin. Finisaje bune, centrală termică, balcon. Aproape de Parcul Copiilor. Ideal pentru familie.", facilitati: ["Centrală proprie", "Balcon"] },
  { titlu: "Birou 45 mp, Cetate, Timișoara", tip: "Birouri", tranzactie: "Închiriere", status: "disponibil", oras: "Timișoara", zona: "Cetate", judet: "Timiș", camere: 0, bai: 1, suprafata: 45, etaj: "1", an: 2008, pret: 650, descriere: "Birou modern în clădire istorică din Piața Victoriei. Aer condiționat, internet, mobilier modern. Ideal startup sau birou de avocatură.", facilitati: ["Aer condiționat", "Internet"], negociabil: true },
  { titlu: "Apartament 3 camere, Primăverii, București", tip: "Apartament", tranzactie: "Vânzare", status: "disponibil", oras: "București", zona: "Primăverii", judet: "București", camere: 3, bai: 2, suprafata: 110, etaj: "3", an: 2020, pret: 320000, descriere: "Apartament premium în complex rezidențial cu pază. Parchet masiv, bucătărie italiană Scavolini, smart home, terasă. Loc de parcare subteran.", facilitati: ["Aer condiționat", "Centrală proprie", "Lift", "Parcare", "Balcon"], negociabil: false, recomandata: true, badge_exclusivitate: true },
  { titlu: "Garsonieră decomandată, Cotroceni, București", tip: "Garsonieră", tranzactie: "Închiriere", status: "inchiriat", oras: "București", zona: "Cotroceni", judet: "București", camere: 1, bai: 1, suprafata: 40, etaj: "2", an: 2015, pret: 550, descriere: "Garsonieră decomandată aproape de Grădina Botanică. Centrală proprie, aer condiționat, complet mobilat. Cartier liniștit.", facilitati: ["Aer condiționat", "Centrală proprie", "Balcon", "Mobilat"] },
  { titlu: "Teren construcție 500 mp, Astra, Brașov", tip: "Terenuri", tranzactie: "Vânzare", status: "disponibil", oras: "Brașov", zona: "Astra", judet: "Brașov", camere: 0, bai: 0, suprafata: 500, etaj: "—", an: "—", pret: 75000, descriere: "Teren intravilan 500 mp cu toate utilitățile. Vedere spre Tâmpa. Ideal pentru casă unifamilială sau duplex.", facilitati: ["Apă", "Curent", "Gaz", "Canalizare"], negociabil: true },
  { titlu: "Apartament 2 camere, Centru, Sibiu", tip: "Apartament", tranzactie: "Vânzare", status: "vandut", oras: "Sibiu", zona: "Centru", judet: "Sibiu", camere: 2, bai: 1, suprafata: 62, etaj: "1", an: 2012, pret: 98000, descriere: "Apartament 2 camere în centrul Sibiului. Ferestre mari, tavane înalte. La 5 min de Piața Mare, potrivit și pentru închiriere turistică.", facilitati: ["Centrală proprie", "Aer condiționat"] },
  { titlu: "Închiriez apartament 2 camere, Tomis Nord, Constanța", tip: "Apartament", tranzactie: "Închiriere", status: "disponibil", oras: "Constanța", zona: "Tomis Nord", judet: "Constanța", camere: 2, bai: 1, suprafata: 58, etaj: "5", an: 2018, pret: 480, descriere: "Apartament 2 camere mobilat modern cu vedere la mare. Centrală proprie, aer condiționat. Complex cu parcare și loc de joacă.", facilitati: ["Aer condiționat", "Centrală proprie", "Balcon", "Lift", "Parcare"] },
  { titlu: "Spațiu industrial 300 mp, Zona Metropolitană, Cluj", tip: "Spațiu industrial", tranzactie: "Închiriere", status: "disponibil", oras: "Cluj-Napoca", zona: "Zona Metropolitană", judet: "Cluj", camere: 0, bai: 2, suprafata: 300, etaj: "parter", an: 2010, pret: 1200, descriere: "Hală industrială 300 mp, înălțime 6m. Acces TIR, rampă descărcare, platformă 150 mp. Birou 20 mp, 2 băi. Branșament trifazic.", facilitati: ["Curent trifazic", "Gaz", "Apă"], negociabil: true },
  { titlu: "Casă duplex 4 camere, Bartolomeu, Brașov", tip: "Casă", tranzactie: "Vânzare", status: "disponibil", oras: "Brașov", zona: "Bartolomeu", judet: "Brașov", camere: 4, bai: 2, suprafata: 130, etaj: "—", an: 2022, pret: 155000, descriere: "Casă duplex nouă 2022. Living cu bucătărie open space, 3 dormitoare. Curte de 180 mp, izolație EPS 15cm, geam tripan.", facilitati: ["Centrală proprie", "Grădină", "Parcare"], negociabil: true },
  { titlu: "Închiriez garsonieră renovată, Păcurari, Iași", tip: "Garsonieră", tranzactie: "Închiriere", status: "disponibil", oras: "Iași", zona: "Păcurari", judet: "Iași", camere: 1, bai: 1, suprafata: 32, etaj: "1", an: 1990, pret: 280, descriere: "Garsonieră recent renovată. Finisaje noi, centrală proprie, geamuri termopan. Ideal pentru o persoană. Transport la 50m, Lidl la 100m.", facilitati: ["Centrală proprie", "Aer condiționat"] },
];

const NUME_CLIENTI = ["Ion Popescu", "Maria Ionescu", "Andrei Georgescu", "Elena Vasilescu", "Cristian Dumitrescu", "Ana Marin", "Vasile Stan", "Ioana Petrescu", "Mihai Rusu", "Gabriela Florea", "Radu Toader", "Corina Sandu", "Bogdan Călin", "Monica Barbu", "Costin Lazăr", "Teodora Iacob", "Sorin Neagu", "Laura Diaconu", "Florin Ardelean", "Diana Moise", "Răzvan Butnaru", "Alina Crețu", "Dan Munteanu", "Oana Paraschiv", "Cătălin Rotaru", "Simona Bălan", "Nicolae Toma", "Adriana Filip"];
const INTERESE = ["Apartament 3 camere, Iași", "Garsonieră", "Casă cu grădină", "Apartament 2 camere decomandat", "Teren intravilan", "Spațiu comercial centru", "Vilă Cluj-Napoca", "Penthouse București", "Apartament 4 camere", "Apartament de închiriat", "Teren lângă oraș", "Duplex", "Apartament ultracentral"];
const SURSE = ["Site agenție", "Facebook Ads", "OLX", "Recomandare client", "Google Ads", "Storia"];

function pretToStr(pret, tranzactie) {
  return tranzactie === "Închiriere" ? `${pret.toLocaleString("ro-RO")} €/lună` : `${pret.toLocaleString("ro-RO")} €`;
}

export function seedAllData() {
  const proprietati = PROPRIETATI.map((p, i) => ({
    id: 1000 + i, ...p,
    pret: pretToStr(p.pret, p.tranzactie),
    pretNumeric: p.pret,
    locatie: `${p.zona}, ${p.oras}`,
    imagine: pick(IMG),
    imagini: [pick(IMG), pick(IMG), pick(IMG)],
    dotari: p.facilitati || [],
    negociabil: p.negociabil ?? false,
    recomandata: p.recomandata ?? false,
    badge_exclusivitate: p.badge_exclusivitate ?? false,
    badge_comision_zero: p.badge_comision_zero ?? false,
    suprafata_totala: p.suprafata + rand(5, 15),
    etaje_bloc: p.tip === "Apartament" || p.tip === "Garsonieră" ? rand(4, 12) : 0,
    createdByName: pick(AGENTI),
  }));

  const clienti = [];
  const used = new Set();
  for (let i = 0; i < 28; i++) {
    let n; do { n = pick(NUME_CLIENTI); } while (used.has(n) && used.size < NUME_CLIENTI.length);
    used.add(n);
    clienti.push({
      id: 2000 + i, nume: n,
      telefon: `07${rand(10, 99)}${rand(100000, 999999)}`,
      email: `${n.toLowerCase().split(" ").join(".")}@gmail.com`,
      interes: pick(INTERESE),
      buget: `${rand(35000, 350000).toLocaleString("ro-RO")} €`,
      zona: pick(["Copou, Iași", "Centru, Cluj", "Cetate, Timișoara", "Primăverii, București", "Centru, Brașov", "Tătărași, Iași"]),
      status: i < 8 ? "Nou" : i < 16 ? "Contactat" : i < 22 ? "Interesat" : "Închis",
      sursa: pick(SURSE),
      ultimaInteractiune: "Acum",
      createdByName: pick(AGENTI),
    });
  }

  const today = new Date();
  const programari = [];
  for (let i = 0; i < 22; i++) {
    const d = new Date(today); d.setDate(today.getDate() + rand(-3, 14));
    const c = clienti[i % clienti.length];
    programari.push({
      id: 3000 + i, data: d.toISOString().slice(0, 10),
      ora: `${rand(9, 18)}:${pick(["00", "15", "30", "45"])}`,
      titlu: `${pick(["Vizionare", "Apel", "Întâlnire", "Contract"])} - ${c.nume}`,
      client: c.nume, telefon: c.telefon, locatie: c.zona,
      tip: pick(["Vizionare", "Apel", "Întâlnire"]),
      status: pick(["Confirmată", "În așteptare", "Finalizată"]),
      observatii: pick(["Confirmat telefonic", "Aștept confirmare", "Adus acte", "Semnare"]),
      ultimaActualizare: "Acum", client_id: String(c.id), createdByName: pick(AGENTI),
    });
  }
  programari.sort((a, b) => a.data.localeCompare(b.data));

  const taskuri = [
    "Sună client Andrei — ofertă apartament Copou",
    "Pregătește contract vânzare Penthouse Zorilor",
    "Actualizează anunțuri OLX",
    "Verifică documentație cadastrală",
    "Programează vizionare Tătărași",
    "Răspunde la emailurile de pe site",
    "Pregătește ofertă pentru București",
    "Confirmă programarea cu doamna Ionescu",
    "Trimite broșură Green Park",
    "Actualizează CRM cu lead-uri noi",
    "Verifică lead-uri Facebook Ads",
    "Sună clienți feedback post-vizionare",
    "Pregătește raport săptămânal",
    "Verifică stadiu Urban Vista",
    "Actualizează prețurile în baza de date",
  ].map((t, i) => {
    const d = new Date(); d.setDate(d.getDate() + rand(-2, 5));
    return { id: 4000 + i, titlu: t, status: i < 7 ? "done" : "pending", prioritate: i < 5 ? "high" : i < 10 ? "medium" : "low", data: d.toISOString().slice(0, 10), createdByName: pick(AGENTI) };
  });

  const proiecte = [
    { nume: "Green Park Residence", zona: "Copou, Iași", totalUnitati: 120, disponibile: 35, stadii: "construction", pretDeLa: 85000, pretPanaLa: 160000, descriere: "Ansamblu rezidențial premium în cea mai căutată zonă a Iașului. 120 apartamente 2-4 camere, finisaje de lux, parcare subterană inclusă.", dotari: "Parcare subterană, Loc de joacă, Fitness, Grădină" },
    { nume: "Skyline Towers", zona: "Centru, Cluj-Napoca", totalUnitati: 90, disponibile: 12, stadii: "completed", pretDeLa: 110000, pretPanaLa: 250000, descriere: "Turn rezidențial de 18 etaje în inima Clujului. Apartamente de lux cu vedere panoramică, facilități de 5 stele.", dotari: "Piscină, Concierge 24/7, Parcare dublă, Lobby" },
    { nume: "Parcului Rezidence", zona: "Bună Ziua, Cluj-Napoca", totalUnitati: 75, disponibile: 45, stadii: "planned", pretDeLa: 72000, pretPanaLa: 130000, descriere: "Viitor ansamblu rezidențial eficient energetic. Materiale ecologice, grădini verticale.", dotari: "Loc de joacă, Pistă alergare, Stații electrice" },
    { nume: "Riverside Gardens", zona: "Fabric, Timișoara", totalUnitati: 60, disponibile: 4, stadii: "delivered", pretDeLa: 95000, pretPanaLa: 180000, descriere: "Vile urbane pe malul Begăi. Arhitectură contemporană, curți private, vedere la apă.", dotari: "River view, Terasă privată, Parcare subterană" },
    { nume: "Urban Vista", zona: "Aviației, București", totalUnitati: 200, disponibile: 80, stadii: "construction", pretDeLa: 120000, pretPanaLa: 300000, descriere: "Cel mai mare proiect rezidențial din nordul Bucureștiului. Apartamente smart home, grădină privată de 3000 mp.", dotari: "Spa business, Cinema privat, Coworking, Valet parking" },
    { nume: "Casa Soarelui", zona: "Valea Adâncă, Iași", totalUnitati: 45, disponibile: 22, stadii: "construction", pretDeLa: 65000, pretPanaLa: 110000, descriere: "Ansamblu de apartamente accesibile pentru familii tinere. Program Prima Casă disponibil.", dotari: "Loc de joacă, Spațiu verde, Parcare la sol" },
  ].map((p, i) => ({ id: 5000 + i, ...p }));

  const comisioane = [];
  const vandute = proprietati.filter(p => p.status === "vandut" || p.status === "inchiriat");
  for (let i = 0; i < 14; i++) {
    const prop = vandute[i] || pick(proprietati);
    const val = prop.pretNumeric || rand(50000, 250000);
    const pct = pick([2, 2.5, 3, 3.5]);
    const d = new Date(); d.setDate(d.getDate() - rand(1, 150));
    comisioane.push({ id: 6000 + i, agent: pick(AGENTI), proprietate: prop.titlu, valoareTranzactie: val, procent: pct, suma: Math.round(val * pct / 100), data: d.toISOString().slice(0, 10), status: i < 9 ? "Plătit" : "În așteptare" });
  }

  const campanii = [
    { nume: "Facebook Ads - Green Park", tip: "Social Media", dataStart: "2026-05-15", dataEnd: "2026-08-15", buget: 3500, leaduriGenerate: 62, status: "Activă", descriere: "Targetare Iași, 25-55 ani, interesați imobiliare." },
    { nume: "Google Ads - Apartamente Iași", tip: "Google Ads", dataStart: "2026-06-01", dataEnd: "2026-12-01", buget: 5000, leaduriGenerate: 124, status: "Activă", descriere: "Google Search + Display pentru căutări imobiliare." },
    { nume: "Newsletter - Iulie 2026", tip: "Email", dataStart: "2026-07-01", dataEnd: "2026-07-31", buget: 500, leaduriGenerate: 18, status: "Activă", descriere: "Newsletter cu oferte și reduceri." },
    { nume: "OLX - Promovare VIP", tip: "Anunț", dataStart: "2026-06-10", dataEnd: "2026-09-10", buget: 1200, leaduriGenerate: 45, status: "Activă", descriere: "Top poziționare, badge Promovat." },
    { nume: "Open House - Skyline Towers", tip: "Eveniment", dataStart: "2026-07-20", dataEnd: "2026-07-21", buget: 2000, leaduriGenerate: 28, status: "Pauză", descriere: "Vizitatori, catering, consiliere creditare." },
    { nume: "Google Ads - Cluj", tip: "Google Ads", dataStart: "2026-04-01", dataEnd: "2026-06-30", buget: 4000, leaduriGenerate: 156, status: "Finalizată", descriere: "Lead gen Cluj metropolitan, cost per lead 25€." },
    { nume: "Instagram Stories - Portofoliu", tip: "Social Media", dataStart: "2026-05-01", dataEnd: "2026-11-01", buget: 1500, leaduriGenerate: 34, status: "Activă", descriere: "Stories profesionale, swipe-up către site." },
    { nume: "Recomandări - Bonus 200€", tip: "Altul", dataStart: "2026-03-01", dataEnd: "2026-12-31", buget: 5000, leaduriGenerate: 22, status: "Activă", descriere: "Program recomandări clienți." },
  ].map((c, i) => ({ id: 7000 + i, ...c }));

  localStorage.setItem("imob-proprietati-v2", JSON.stringify(proprietati));
  localStorage.setItem("imob-clienti-v2", JSON.stringify(clienti));
  localStorage.setItem("imob-programari-v2", JSON.stringify(programari));
  localStorage.setItem("imob-taskuri-v2", JSON.stringify(taskuri));
  localStorage.setItem("imob-proiecte-v2", JSON.stringify(proiecte));
  localStorage.setItem("imob-comisioane-v2", JSON.stringify(comisioane));
  localStorage.setItem("imob-campanii-v2", JSON.stringify(campanii));
  localStorage.setItem("imob-agenti-v2", JSON.stringify([
    { id: 1, nume: "Marius Tudor", telefon: "0745123456", email: "marius@imobify.ro", zone: "Iași, Copou" },
    { id: 2, nume: "Andreea Popa", telefon: "0723987654", email: "andreea@imobify.ro", zone: "Cluj-Napoca" },
    { id: 3, nume: "Cristian Nistor", telefon: "0766111222", email: "cristian@imobify.ro", zone: "Iași, Păcurari" },
    { id: 4, nume: "Diana Covaci", telefon: "0733444555", email: "diana@imobify.ro", zone: "Timișoara" },
  ]));
  localStorage.setItem("imob-documente-v2", JSON.stringify([
    { id: 8001, titlu: "Contract vânzare Penthouse Zorilor", tip: "Contract", data: "2026-06-15", client: "Andrei Georgescu", proprietate: "Penthouse Zorilor, Cluj" },
    { id: 8002, titlu: "Antecontract Casă Valea Lupului", tip: "Antecontract", data: "2026-07-02", client: "Elena Vasilescu", proprietate: "Casă Valea Lupului, Iași" },
    { id: 8003, titlu: "Factură comision Copou", tip: "Factură", data: "2026-06-28", client: "Ion Popescu", proprietate: "Apartament Copou, Iași" },
  ]));

  console.log("✅ Date fictive populate în localStorage");
}
