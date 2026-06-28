import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { proprietatiStore } from "../data/stores";

const STATUS_OPTIONS = ["Toate", "Vânzare", "Închiriere"];

const DOTARI_CONFIG = [
  { categorie: "Dotări principale", items: [
    { cheie: "aer_conditionat", label: "Aer condiționat", icon: "❄️" }, { cheie: "centrala_proprie", label: "Centrală proprie", icon: "🔥" },
    { cheie: "lift", label: "Lift", icon: "⬆️" }, { cheie: "balcon", label: "Balcon / Terasă", icon: "🌿" },
    { cheie: "parcare", label: "Parcare", icon: "🚗" }, { cheie: "pivnita", label: "Boxă / Pivniță", icon: "📦" },
    { cheie: "gradina", label: "Grădină", icon: "🌳" }, { cheie: "piscina", label: "Piscină", icon: "🏊" },
  ]},
  { categorie: "Finisaje", items: [
    { cheie: "gresie", label: "Gresie", icon: "⬜" }, { cheie: "faianta", label: "Faianță", icon: "⬜" },
    { cheie: "parchet", label: "Parchet", icon: "🪵" }, { cheie: "vopsea_lavabila", label: "Vopsea lavabilă", icon: "🎨" },
    { cheie: "usa_metalica", label: "Ușă metalică", icon: "🚪" }, { cheie: "usi_interioare_celulare", label: "Uși interior celulare", icon: "🚪" },
    { cheie: "tamplarie_pvc", label: "Tâmplărie PVC", icon: "🪟" }, { cheie: "izolatie_exterioara", label: "Izolație exterioară", icon: "🏢" },
  ]},
  { categorie: "Baie", items: [
    { cheie: "cada", label: "Cadă", icon: "🛁" }, { cheie: "dus", label: "Duș", icon: "🚿" },
    { cheie: "geam_baie", label: "Geam", icon: "🪟" }, { cheie: "ventilatie", label: "Ventilație", icon: "💨" },
  ]},
  { categorie: "Mobilare & Bucătărie", items: [
    { cheie: "mobilat_complet", label: "Mobilat complet", icon: "🛋️" }, { cheie: "mobilat_partial", label: "Mobilat parțial", icon: "🪑" },
    { cheie: "utilat", label: "Utilat", icon: "🍽️" }, { cheie: "bucatarie_inchisa", label: "Bucătărie închisă", icon: "🍳" },
    { cheie: "bucatarie_deschisa", label: "Bucătărie deschisă", icon: "🍳" }, { cheie: "bucatarie_utilata", label: "Bucătărie utilată", icon: "🍽️" },
    { cheie: "masina_spalat", label: "Mașină de spălat", icon: "🧺" }, { cheie: "frigider", label: "Frigider", icon: "🧊" },
    { cheie: "aragaz", label: "Aragaz", icon: "🔥" }, { cheie: "hota", label: "Hotă", icon: "💨" },
  ]},
  { categorie: "Utilități generale", items: [
    { cheie: "apa", label: "Apă", icon: "💧" }, { cheie: "gaz", label: "Gaz", icon: "🔥" },
    { cheie: "canalizare", label: "Canalizare", icon: "🚰" }, { cheie: "curent", label: "Curent", icon: "⚡" },
    { cheie: "internet", label: "Internet", icon: "🌐" }, { cheie: "cablu_tv", label: "Cablu TV", icon: "📺" },
    { cheie: "telefon", label: "Telefon", icon: "☎️" },
  ]},
  { categorie: "Sistem încălzire", items: [
    { cheie: "calorifere", label: "Calorifere", icon: "🔥" }, { cheie: "centrala_bloc", label: "Centrală bloc", icon: "🏢" },
    { cheie: "incalzire_pardoseala", label: "Încălzire în pardoseală", icon: "♨️" }, { cheie: "termostat", label: "Termostat", icon: "🌡️" },
  ]},
  { categorie: "Stradă & Acces", items: [
    { cheie: "strada_asfaltata", label: "Stradă asfaltată", icon: "🛣️" }, { cheie: "strada_betonata", label: "Stradă betonată", icon: "🛣️" },
    { cheie: "iluminat_public", label: "Iluminat public", icon: "💡" }, { cheie: "transport_public", label: "Transport public", icon: "🚌" },
    { cheie: "acces_auto", label: "Acces auto", icon: "🚘" }, { cheie: "mijloace_transport", label: "Mijloace transport în comun", icon: "🚋" },
  ]},
  { categorie: "Contorizare", items: [
    { cheie: "apometre", label: "Apometre", icon: "💧" }, { cheie: "contor_gaz", label: "Contor gaz", icon: "🔥" },
    { cheie: "contor_electric", label: "Contor electric", icon: "⚡" },
  ]},
];

const DOTARI_TEREN_CONFIG = [
  { categorie: "Caracteristici", items: [
    { cheie: "teren_constructii_existente", label: "Construcții existente", icon: "🏗️" }, { cheie: "teren_acces_auto", label: "Acces auto", icon: "🚗" },
    { cheie: "teren_imprejmuit", label: "Teren împrejmuit", icon: "🧱" },
  ]},
  { categorie: "Utilități teren", items: [
    { cheie: "teren_apa", label: "Apă", icon: "💧" }, { cheie: "teren_canalizare", label: "Canalizare", icon: "🚰" },
    { cheie: "teren_curent", label: "Curent", icon: "⚡" }, { cheie: "teren_gaz", label: "Gaz", icon: "🔥" },
    { cheie: "teren_utilitati_zona", label: "Utilități în zonă", icon: "🏙️" },
  ]},
];

const DOTARI_CASA_CONFIG = [
  { categorie: "Caracteristici casă", items: [
    { cheie: "casa_garaj", label: "Garaj", icon: "🚗" }, { cheie: "casa_beci", label: "Beci / Pivniță", icon: "🏚️" },
    { cheie: "casa_pod", label: "Pod", icon: "🏠" }, { cheie: "casa_mansarda", label: "Mansardă", icon: "🏡" },
    { cheie: "casa_curte", label: "Curte", icon: "🌳" }, { cheie: "casa_terasa", label: "Terasă", icon: "🌿" },
    { cheie: "casa_gradina", label: "Grădină", icon: "🌸" }, { cheie: "casa_intrare_separata", label: "Intrare separată", icon: "🚪" },
    { cheie: "casa_parcare", label: "Parcare", icon: "🅿️" },
  ]},
];

const JUDETE = ["Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brașov","Brăila","București","Buzău","Caraș-Severin","Călărași","Cluj","Constanța","Covasna","Dâmbovița","Dolj","Galați","Giurgiu","Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov","Maramureș","Mehedinți","Mureș","Neamț","Olt","Prahova","Satu Mare","Sălaj","Sibiu","Suceava","Teleorman","Timiș","Tulcea","Vaslui","Vâlcea","Vrancea"];

function facilitatiArrayToDotariObj(arr) {
  const obj = {};
  const all = [...DOTARI_CONFIG, ...DOTARI_TEREN_CONFIG, ...DOTARI_CASA_CONFIG];
  all.forEach((cat) => cat.items.forEach(({ cheie, label }) => { obj[cheie] = (arr || []).includes(label); }));
  return obj;
}

function dotariObjToFacilitatiArray(obj) {
  const labels = [];
  const all = [...DOTARI_CONFIG, ...DOTARI_TEREN_CONFIG, ...DOTARI_CASA_CONFIG];
  all.forEach((cat) => cat.items.forEach(({ cheie, label }) => { if (obj[cheie]) labels.push(label); }));
  return labels;
}

const page = { padding: "22px 24px" };
const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setIsMobile(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return isMobile;
}

const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function StatCard({ label, value, hint }) {
  return <div style={{ ...card, padding: "20px 22px", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}><div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>{label}</div><div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div><div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{hint}</div></div>;
}

function EField({ label, required, error, children }) {
  return <div style={{ marginBottom: 14 }}>{label && <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: 4 }}>{label}{required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}</label>}{children}{error && <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 3 }}>{error}</div>}</div>;
}

const einp = { width: "100%", padding: "8px 11px", fontSize: 13, border: "0.5px solid var(--border-secondary)", borderRadius: 8, background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };

function EInput({ label, required, error, ...props }) {
  return <EField label={label} required={required} error={error}><input style={einp} {...props} /></EField>;
}

function ESelect({ label, required, error, options, value, onChange }) {
  return <EField label={label} required={required} error={error}><select value={value} onChange={onChange} style={{ ...einp, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 }}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></EField>;
}

function EToggle({ label, value, onChange }) {
  return <button type="button" onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "0.5px solid var(--border-secondary)", borderRadius: 8, background: value ? "var(--success-light)" : "var(--bg-primary)", color: value ? "var(--success-dark)" : "var(--text-secondary)", fontSize: 13, cursor: "pointer", width: "100%" }}><span style={{ width: 32, height: 18, borderRadius: 9, background: value ? "var(--success)" : "var(--border-secondary)", position: "relative", flexShrink: 0 }}><span style={{ position: "absolute", top: 2, left: value ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s" }} /></span>{label}</button>;
}

function EDotareBtn({ label, icon, checked, onChange }) {
  return <button type="button" onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: checked ? "0.5px solid var(--primary)" : "0.5px solid var(--border-tertiary)", borderRadius: 8, background: checked ? "var(--primary-light)" : "var(--bg-primary)", color: checked ? "var(--primary)" : "var(--text-secondary)", fontSize: 12, cursor: "pointer", textAlign: "left" }}><span style={{ width: 16, height: 16, borderRadius: 4, border: checked ? "none" : "1px solid var(--border-secondary)", background: checked ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5"><polyline points="1,5 4,8 9,2" /></svg>}</span><span style={{ fontSize: 14 }}>{icon}</span><span style={{ fontWeight: checked ? 500 : 400 }}>{label}</span></button>;
}

function ECard({ title, children }) {
  return <div style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}><div style={{ padding: "12px 18px", borderBottom: "0.5px solid var(--border-tertiary)", display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{title}</span></div><div style={{ padding: "16px 18px" }}>{children}</div></div>;
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function EditForm({ proprietate, onSave, onCancel }) {
  const isMobile = useIsMobile();
  const locatieParts = (proprietate.locatie || "").split(", ");
  const cartierInit = locatieParts.length > 1 ? locatieParts[0] : "";
  const orasInit = locatieParts.length > 1 ? locatieParts[1] : locatieParts[0] || "";
  const pretRaw = String(proprietate.pret || "").replace(/[^\d]/g, "");

  const [form, setForm] = useState({
    titlu: proprietate.titlu || "",
    tip_tranzactie: proprietate.tranzactie === "Închiriere" ? "inchiriere" : "vanzare",
    status: proprietate.status || "disponibil",
    tip: proprietate.tip || "Apartament",
    pret: pretRaw,
    negociabil: Boolean(proprietate.negociabil),
    badge_exclusivitate: Boolean(proprietate.badge_exclusivitate),
    badge_comision_zero: Boolean(proprietate.badge_comision_zero),
    descriere: proprietate.descriere || "",
    adresa: { judet: proprietate.judet || "Iași", oras: orasInit || "Iași", cartier: cartierInit, strada: proprietate.strada || "", numar: proprietate.numar || "", cod_postal: proprietate.cod_postal || "" },
    caracteristici: { nr_camere: proprietate.camere || 2, nr_bai: proprietate.bai || 1, etaj: String(proprietate.etaj || "2"), nr_etaje_total: String(proprietate.etaje_bloc || ""), suprafata_utila: String(proprietate.suprafata || ""), suprafata_totala: String(proprietate.suprafata_totala || ""), an_constructie: String(proprietate.an || ""), tip_imobil: proprietate.tip === "Casă" ? "casa" : "bloc_nou", deschidere_strada: String(proprietate.deschidere_strada || ""), tip_teren: proprietate.tip_teren || "intravilan", nr_fronturi_stradale: String(proprietate.nr_fronturi_stradale || ""), tip_casa: proprietate.tip_casa || "", suprafata_teren: String(proprietate.suprafata_teren || ""), risc_seismic: proprietate.risc_seismic || "", acoperis: proprietate.acoperis || "" },
    dotari: facilitatiArrayToDotariObj(proprietate.dotari || proprietate.facilitati),
    imagini: proprietate.imagini || [],
    recomandata: Boolean(proprietate.recomandata),
  });

  const upd = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updAdr = (k, v) => setForm((prev) => ({ ...prev, adresa: { ...prev.adresa, [k]: v } }));
  const updCar = (k, v) => setForm((prev) => ({ ...prev, caracteristici: { ...prev.caracteristici, [k]: v } }));
  const updDot = (k, v) => setForm((prev) => ({ ...prev, dotari: { ...prev.dotari, [k]: v } }));
  const nrDotari = Object.values(form.dotari).filter(Boolean).length;

  const submit = (event) => {
    event.preventDefault();
    if (!form.titlu.trim()) { alert("Completează titlul proprietății."); return; }
    if (!form.pret) { alert("Completează prețul."); return; }
    const pretNumeric = Number(form.pret) || 0;
    const tranzactie = form.tip_tranzactie === "inchiriere" ? "Închiriere" : "Vânzare";
    const pretFormatat = form.tip_tranzactie === "inchiriere" ? `${pretNumeric.toLocaleString("ro-RO")} €/lună` : `${pretNumeric.toLocaleString("ro-RO")} €`;
    const locatie = [form.adresa.cartier, form.adresa.oras].filter(Boolean).join(", ");
    onSave({ ...proprietate, status: "activ", status_proprietate: form.status, titlu: form.titlu, pret: pretFormatat, pretNumeric, locatie, oras: form.adresa.oras, zona: form.adresa.cartier || form.adresa.oras, judet: form.adresa.judet, strada: form.adresa.strada, numar: form.adresa.numar, cod_postal: form.adresa.cod_postal, tranzactie, tip: form.tip, camere: Number(form.caracteristici.nr_camere) || 1, bai: Number(form.caracteristici.nr_bai) || 1, suprafata: Number(form.caracteristici.suprafata_utila) || 0, suprafata_totala: Number(form.caracteristici.suprafata_totala) || 0, etaj: form.caracteristici.etaj || "—", etaje_bloc: Number(form.caracteristici.nr_etaje_total) || 0, an: Number(form.caracteristici.an_constructie) || "—", descriere: form.descriere, negociabil: form.negociabil, badge_exclusivitate: form.badge_exclusivitate, badge_comision_zero: form.badge_comision_zero, recomandata: form.recomandata, facilitati: dotariObjToFacilitatiArray(form.dotari), dotari: dotariObjToFacilitatiArray(form.dotari), imagini: form.imagini, imagine: form.imagini?.[0] || "" });
  };

  const row2 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 18, marginBottom: 18 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Editează proprietate</div>
      <ECard title="Informații principale">
        <EInput label="Titlu anunț" required placeholder="ex. Apartament 3 camere, Copou, vedere panoramică" value={form.titlu} onChange={(e) => upd("titlu", e.target.value)} />
        <EField label="Tip tranzacție" required>
          <div style={{ display: "flex", gap: 8 }}>
            {[["vanzare","Vânzare"],["inchiriere","Închiriere"]].map(([val, lbl]) => (
              <button key={val} type="button" onClick={() => upd("tip_tranzactie", val)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: form.tip_tranzactie === val ? "none" : "0.5px solid var(--border-secondary)", background: form.tip_tranzactie === val ? "var(--primary)" : "var(--bg-primary)", color: form.tip_tranzactie === val ? "white" : "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{lbl}</button>
            ))}
          </div>
        </EField>
        <ESelect label="Tip proprietate" value={form.tip} onChange={(e) => upd("tip", e.target.value)} options={[{value:"Apartament",label:"Apartament"},{value:"Garsonieră",label:"Garsonieră"},{value:"Casă",label:"Casă"},{value:"Terenuri",label:"Terenuri"},{value:"Spațiu comercial",label:"Spațiu comercial"},{value:"Spațiu industrial",label:"Spațiu industrial"},{value:"Birouri",label:"Birouri"}]} />
        <ESelect label="Status proprietate" value={form.status} onChange={(e) => upd("status", e.target.value)} options={[{value:"disponibil",label:"Disponibil"},{value:"vandut",label:"Vândut"},{value:"inchiriat",label:"Închiriat"}]} />
        <div style={row2}>
          <EInput label={form.tip_tranzactie === "vanzare" ? "Preț (€)" : "Chirie lunară (€)"} required type="number" placeholder={form.tip_tranzactie === "vanzare" ? "85000" : "450"} value={form.pret} onChange={(e) => upd("pret", e.target.value)} />
          <EField label="Negociabil"><EToggle label={form.negociabil ? "Da" : "Nu"} value={form.negociabil} onChange={(v) => upd("negociabil", v)} /></EField>
        </div>
        <div style={{ marginTop: 4, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>Badge-uri speciale</div>
          <div style={row2}>
            <EToggle label="⭐ Exclusivitate" value={form.badge_exclusivitate} onChange={(v) => upd("badge_exclusivitate", v)} />
            <EToggle label="💸 Comision 0%" value={form.badge_comision_zero} onChange={(v) => upd("badge_comision_zero", v)} />
          </div>
        </div>
        <EField label="Proprietate recomandată"><EToggle label={form.recomandata ? "Afișează la recomandate" : "Nu afișa la recomandate"} value={form.recomandata} onChange={(v) => upd("recomandata", v)} /></EField>
        <EField label="Descriere proprietate">
          <textarea rows={5} placeholder="Descrie apartamentul: finisaje, avantaje ale zonei, transport..." value={form.descriere} onChange={(e) => upd("descriere", e.target.value)} style={{ width: "100%", padding: "8px 11px", fontSize: 13, border: "0.5px solid var(--border-secondary)", borderRadius: 8, background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }} />
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{form.descriere.length} caractere</div>
        </EField>
      </ECard>
      <ECard title="Localizare">
        <ESelect label="Județ" required value={form.adresa.judet} onChange={(e) => updAdr("judet", e.target.value)} options={JUDETE.map((j) => ({ value: j, label: j }))} />
        <div style={row2}>
          <EInput label="Oraș" required placeholder="ex. Iași" value={form.adresa.oras} onChange={(e) => updAdr("oras", e.target.value)} />
          <EInput label="Cartier / Zonă" placeholder="ex. Copou" value={form.adresa.cartier} onChange={(e) => updAdr("cartier", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
          <EInput label="Stradă" placeholder="ex. Str. Vasile Lupu" value={form.adresa.strada} onChange={(e) => updAdr("strada", e.target.value)} />
          <EInput label="Nr." placeholder="12" value={form.adresa.numar} onChange={(e) => updAdr("numar", e.target.value)} />
        </div>
        <EInput label="Cod poștal" placeholder="700000" value={form.adresa.cod_postal} onChange={(e) => updAdr("cod_postal", e.target.value)} />
      </ECard>
      <ECard title="Caracteristici proprietate">
        {form.tip !== "Terenuri" && <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          <ESelect label="Camere" required value={String(form.caracteristici.nr_camere)} onChange={(e) => updCar("nr_camere", Number(e.target.value))} options={[1,2,3,4,5].map((n)=>({value:String(n),label:n===5?"5+":String(n)}))} />
          <ESelect label="Băi" required value={String(form.caracteristici.nr_bai)} onChange={(e) => updCar("nr_bai", Number(e.target.value))} options={[1,2,3].map((n)=>({value:String(n),label:n===3?"3+":String(n)}))} />
          <ESelect label="Etaj" value={form.caracteristici.etaj} onChange={(e) => updCar("etaj", e.target.value)} options={["parter","1","2","3","4","5","6+","mansarda"].map((v)=>({value:v,label:v==="parter"?"Parter":v==="mansarda"?"Mansardă":"Etaj "+v}))} />
        </div>}
        <div style={row2}>
          <EInput label="Suprafață utilă (m²)" required type="number" placeholder="65" value={form.caracteristici.suprafata_utila} onChange={(e) => updCar("suprafata_utila", e.target.value)} />
          <EInput label="Suprafață totală (m²)" type="number" placeholder="75" value={form.caracteristici.suprafata_totala} onChange={(e) => updCar("suprafata_totala", e.target.value)} />
        </div>
        <div style={row2}>
          <EInput label="Etaje clădire (total)" type="number" placeholder="8" value={form.caracteristici.nr_etaje_total} onChange={(e) => updCar("nr_etaje_total", e.target.value)} />
          <EInput label="An construcție" type="number" placeholder="2018" min={1900} max={2030} value={form.caracteristici.an_constructie} onChange={(e) => updCar("an_constructie", e.target.value)} />
        </div>
        <ESelect label="Tip imobil" value={form.caracteristici.tip_imobil} onChange={(e) => updCar("tip_imobil", e.target.value)} options={[{value:"bloc_nou",label:"Bloc nou (după 2000)"},{value:"bloc_vechi",label:"Bloc vechi (înainte de 2000)"},{value:"vila",label:"Vilă"},{value:"casa",label:"Casă individuală"}]} />
      </ECard>
      <ECard title={`Dotări & facilități (${nrDotari} selectate)`}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          {DOTARI_CONFIG.map((cat) => (
            <div key={cat.categorie} style={{ background: "var(--bg-secondary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>{cat.categorie}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                {cat.items.map(({ cheie, label, icon }) => <EDotareBtn key={cheie} label={label} icon={icon} checked={!!form.dotari[cheie]} onChange={(v) => updDot(cheie, v)} />)}
              </div>
            </div>
          ))}
        </div>
      </ECard>
      <ECard title="Galerie imagini">
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Upload imagini noi</div>
          <input type="file" multiple accept="image/*" onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            const uploaded = [];
            for (const file of files) {
              const base64 = await convertFileToBase64(file);
              uploaded.push(base64);
            }
            upd("imagini", [...form.imagini, ...uploaded]);
          }} />
        </div>
        {form.imagini.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
            {form.imagini.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={img} loading="lazy" alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 12 }} />
                <button type="button" onClick={() => upd("imagini", form.imagini.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: 6, right: 6, border: "none", width: 24, height: 24, borderRadius: 999, background: "rgba(0,0,0,0.75)", color: "white", cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
        )}
      </ECard>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button type="submit" style={{ border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "white", fontWeight: 700, cursor: "pointer", padding: "11px 18px", fontSize: 13, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Salvează modificările</button>
        <button type="button" onClick={onCancel} style={{ border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", padding: "11px 18px", fontSize: 13 }}>Anulează</button>
      </div>
    </form>
  );
}

export default function AdminProprietati() {
  const isMobile = useIsMobile();
  const [proprietati, setProprietati] = useState([]);
  const [search, setSearch] = useState("");
  const [tranzactie, setTranzactie] = useState("Toate");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { setProprietati(proprietatiStore.getAll()); }, []);

  const refresh = () => setProprietati(proprietatiStore.getAll());

  const stergeProprietate = (id) => {
    if (!confirm("Sigur vrei să ștergi această proprietate?")) return;
    proprietatiStore.delete(id);
    refresh();
  };

  const salveazaEditare = (proprietateEditata) => {
    proprietatiStore.update(proprietateEditata.id, proprietateEditata);
    refresh();
    setEditingId(null);
  };

  const toggleRecomandata = (id) => {
    const p = proprietati.find((item) => String(item.id) === String(id));
    if (!p) return;
    proprietatiStore.update(id, { recomandata: !p.recomandata });
    refresh();
  };

  const proprietatiFiltrate = useMemo(() => {
    return proprietati.filter((item) => {
      const text = `${item.titlu} ${item.locatie} ${item.tip} ${item.tranzactie}`.toLowerCase();
      return text.includes(search.toLowerCase()) && (tranzactie === "Toate" || item.tranzactie === tranzactie);
    });
  }, [proprietati, search, tranzactie]);

  const stats = { total: proprietati.length, vanzare: proprietati.filter((p) => p.tranzactie === "Vânzare").length, inchiriere: proprietati.filter((p) => p.tranzactie === "Închiriere").length, recomandate: proprietati.filter((p) => p.recomandata).length };
  const proprietateEditata = proprietati.find((p) => String(p.id) === String(editingId));

  return (
    <div style={{ ...page, padding: isMobile ? "18px 14px 28px" : "22px 24px" }}>
      <header style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>Proprietăți</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Vezi, modifică și șterge proprietățile afișate pe site.</div>
        </div>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <StatCard label="Total proprietăți" value={stats.total} hint="salvate local" />
        <StatCard label="De vânzare" value={stats.vanzare} hint="afișate pe site" />
        <StatCard label="Închiriere" value={stats.inchiriere} hint="afișate pe site" />
        <StatCard label="Recomandate" value={stats.recomandate} hint="pe landing page" />
      </section>
      {proprietateEditata && <EditForm proprietate={proprietateEditata} onSave={salveazaEditare} onCancel={() => setEditingId(null)} />}
      <section style={card}>
        <div style={{ padding: 16, borderBottom: "0.5px solid var(--border-tertiary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 180px auto", gap: 10 }}>
            <input style={input} placeholder="Caută după titlu, locație, tip..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={input} value={tranzactie} onChange={(e) => setTranzactie(e.target.value)}>{STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select>
            <Link to="/admin/adauga-proprietate" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 13, padding: isMobile ? "12px 14px" : "0 18px", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>+ Adaugă proprietate</Link>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontSize: 11, textAlign: "left" }}>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Proprietate</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Locație</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Preț</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Detalii</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Status</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Recomandată</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {proprietatiFiltrate.map((item) => (
                <tr key={item.id} style={{ borderTop: "0.5px solid var(--border-tertiary)" }}>
                  <td style={{ padding: "13px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img loading="lazy" src={item.imagini?.[0] || item.imagine || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"} alt={item.titlu} style={{ width: 58, height: 42, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                      <div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.titlu}</div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{item.tip} · {item.tranzactie}</div><div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Adăugat de {item.createdByName || "—"}{item.updatedByName && item.updatedByName !== item.createdByName ? ` · Modificat de ${item.updatedByName}` : ""}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{item.locatie}</td>
                  <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.pret}</td>
                  <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{item.camere} camere · {item.suprafata} m²</td>
                  <td style={{ padding: "13px 14px" }}>
                    <span style={{ padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: item.status === "disponibil" ? "var(--success-light)" : item.status === "vandut" ? "var(--danger-light)" : "var(--bg-secondary)",
                      color: item.status === "disponibil" ? "var(--success-dark)" : item.status === "vandut" ? "var(--danger)" : "var(--text-secondary)" }}>
                      {item.status === "disponibil" ? "Disponibil" : item.status === "vandut" ? "Vândut" : "Închiriat"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 14px" }}>
                    <button type="button" onClick={() => toggleRecomandata(item.id)} style={{ border: "none", borderRadius: 8, background: item.recomandata ? "var(--primary-light)" : "var(--bg-secondary)", color: item.recomandata ? "var(--primary)" : "var(--text-tertiary)", padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{item.recomandata ? "⭐ Da" : "Nu"}</button>
                  </td>
                  <td style={{ padding: "13px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" onClick={() => setEditingId(item.id)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✎</button>
                      <button type="button" onClick={() => stergeProprietate(item.id)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {proprietatiFiltrate.length === 0 && <tr><td colSpan={7} style={{ padding: 30, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există proprietăți.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
