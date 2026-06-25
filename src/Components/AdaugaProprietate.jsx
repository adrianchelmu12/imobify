import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAgenti } from "../data/agentiStorage";
import { proprietatiStore } from "../data/stores";
import { JUDETE_LIST, getOraseForJudet, getCartiereForOras } from "../data/orase";
import MapPicker from "./MapPicker";
import "leaflet/dist/leaflet.css";
const isMobile = typeof window !== "undefined" && window.innerWidth <= 900;

// ─── DATE INIȚIALE ────────────────────────────────────────────────────────────

const FORM_INITIAL = {
  titlu: "",
  tip_tranzactie: "vanzare",
  tip: "Apartament",
  pret: "",
  negociabil: false,
  badge_exclusivitate: false,
  badge_comision_zero: false,
  descriere: "",
  adresa: {
    judet: "Iași",
    oras: "Iași",
    orasCustom: "",
    cartier: "",
    cartierCustom: "",
    strada: "",
    numar: "",
    cod_postal: "",
  },
  caracteristici: {
    nr_camere: 2,
    nr_bai: 1,
    etaj: "2",
    nr_etaje_total: "",
    suprafata_utila: "",
    suprafata_totala: "",
    an_constructie: "",
    tip_imobil: "bloc_nou",
    deschidere_strada: "",
    tip_teren: "intravilan",
    nr_fronturi_stradale: "",
    tip_casa: "",
    suprafata_teren: "",
    lat: "",
    lng: "",
    compartimentare: "",
    risc_seismic: "",
    acoperis: "",
  },
  dotari: {},
  fotografii: [],
  imagine: "",
  status: "activ",
  status_proprietate: "disponibil",
  recomandata: true,
  disponibil_din: "",
  agent_id: "agent-1",
};

const JUDETE = JUDETE_LIST;

const DOTARI_CONFIG = [
  {
    categorie: "Dotări principale",
    items: [
      { cheie: "aer_conditionat", label: "Aer condiționat", icon: "❄️" },
      { cheie: "lift", label: "Lift", icon: "⬆️" },
      { cheie: "balcon", label: "Balcon / Terasă", icon: "🌿" },
      { cheie: "parcare", label: "Parcare", icon: "🚗" },
      { cheie: "pivnita", label: "Boxă / Pivniță", icon: "📦" },
      { cheie: "gradina", label: "Grădină", icon: "🌳" },
      { cheie: "piscina", label: "Piscină", icon: "🏊" },
    ],
  },
  {
    categorie: "Finisaje",
    items: [
      { cheie: "gresie", label: "Gresie", icon: "⬜" },
      { cheie: "faianta", label: "Faianță", icon: "⬜" },
      { cheie: "parchet", label: "Parchet", icon: "🪵" },
      { cheie: "vopsea_lavabila", label: "Vopsea lavabilă", icon: "🎨" },
      { cheie: "usa_metalica", label: "Ușă metalică", icon: "🚪" },
      {
        cheie: "usi_interioare_celulare",
        label: "Uși interior celulare",
        icon: "🚪",
      },
      { cheie: "tamplarie_pvc", label: "Tâmplărie PVC", icon: "🪟" },
      {
        cheie: "izolatie_exterioara",
        label: "Izolație exterioară",
        icon: "🏢",
      },
    ],
  },
  {
    categorie: "Baie",
    items: [
      { cheie: "cada", label: "Cadă", icon: "🛁" },
      { cheie: "dus", label: "Duș", icon: "🚿" },
      { cheie: "geam_baie", label: "Geam", icon: "🪟" },
      { cheie: "ventilatie", label: "Ventilație", icon: "💨" },
    ],
  },
  {
    categorie: "Mobilare & Bucătărie",
    items: [
      { cheie: "mobilat_complet", label: "Mobilat complet", icon: "🛋️" },
      { cheie: "mobilat_partial", label: "Mobilat parțial", icon: "🪑" },
      { cheie: "nemobilat", label: "Nemobilat", icon: "✗" },
      { cheie: "utilat", label: "Utilat", icon: "🍽️" },
      { cheie: "bucatarie_inchisa", label: "Bucătărie închisă", icon: "🍳" },
      { cheie: "bucatarie_deschisa", label: "Bucătărie deschisă", icon: "🍳" },
      { cheie: "bucatarie_utilata", label: "Bucătărie utilată", icon: "🍽️" },
      { cheie: "masina_spalat", label: "Mașină de spălat", icon: "🧺" },
      { cheie: "frigider", label: "Frigider", icon: "🧊" },
      { cheie: "aragaz", label: "Aragaz", icon: "🔥" },
      { cheie: "hota", label: "Hotă", icon: "💨" },
    ],
  },
  {
    categorie: "Utilități generale",
    items: [
      { cheie: "apa", label: "Apă", icon: "💧" },
      { cheie: "gaz", label: "Gaz", icon: "🔥" },
      { cheie: "canalizare", label: "Canalizare", icon: "🚰" },
      { cheie: "curent", label: "Curent", icon: "⚡" },
      { cheie: "internet", label: "Internet", icon: "🌐" },
      { cheie: "cablu_tv", label: "Cablu TV", icon: "📺" },
      { cheie: "telefon", label: "Telefon", icon: "☎️" },
    ],
  },
  {
    categorie: "Sistem încălzire",
    items: [
      { cheie: "calorifere", label: "Calorifere", icon: "🔥" },
      { cheie: "centrala_bloc", label: "Centrală bloc", icon: "🏢" },
      {
        cheie: "incalzire_pardoseala",
        label: "Încălzire în pardoseală",
        icon: "♨️",
      },
      { cheie: "termostat", label: "Termostat", icon: "🌡️" },
       { cheie: "termoficare", label: "Termoficare", icon: "🔥" },
       { cheie: "centrala_proprie", label: "Centrala proprie", icon: "🏢" },
       { cheie: "pompe_de_caldura", label: "Pompe de cǎldurǎ", icon: "🌡️" },
    ],
  },
  {
    categorie: "Stradă & Acces",
    items: [
      { cheie: "strada_asfaltata", label: "Stradă asfaltată", icon: "🛣️" },
      { cheie: "strada_betonata", label: "Stradă betonată", icon: "🛣️" },
      { cheie: "iluminat_public", label: "Iluminat public", icon: "💡" },
      { cheie: "transport_public", label: "Transport public", icon: "🚌" },
      { cheie: "acces_auto", label: "Acces auto", icon: "🚘" },
      {
        cheie: "mijloace_transport",
        label: "Mijloace transport în comun",
        icon: "🚋",
      },
    ],
  },
  {
    categorie: "Contorizare",
    items: [
      { cheie: "apometre", label: "Apometre", icon: "💧" },
      { cheie: "contor_gaz", label: "Contor gaz", icon: "🔥" },
      { cheie: "contor_electric", label: "Contor electric", icon: "⚡" },
    ],
  },
];

const DOTARI_TEREN_CONFIG = [
  {
    categorie: "Caracteristici",
    items: [
      { cheie: "teren_constructii_existente", label: "Construcții existente", icon: "🏗️" },
      { cheie: "teren_acces_auto", label: "Acces auto", icon: "🚗" },
      { cheie: "teren_imprejmuit", label: "Teren împrejmuit", icon: "🧱" },
    ],
  },
  {
    categorie: "Utilități teren",
    items: [
      { cheie: "teren_apa", label: "Apă", icon: "💧" },
      { cheie: "teren_canalizare", label: "Canalizare", icon: "🚰" },
      { cheie: "teren_curent", label: "Curent", icon: "⚡" },
      { cheie: "teren_gaz", label: "Gaz", icon: "🔥" },
      { cheie: "teren_utilitati_zona", label: "Utilități în zonă", icon: "🏙️" },
    ],
  },
  {
    categorie: "Amenajări străzi",
    items: [
      { cheie: "teren_strazi_asfaltate", label: "Străzi asfaltate", icon: "🛣️" },
      { cheie: "teren_strazi_betonate", label: "Străzi betonate", icon: "🛣️" },
      { cheie: "teren_strazi_pamant", label: "Străzi de pământ", icon: "🛤️" },
      { cheie: "teren_strazi_pietruite", label: "Străzi pietruite", icon: "🛤️" },
      { cheie: "teren_iluminat_stradal", label: "Iluminat stradal", icon: "💡" },
      { cheie: "teren_transport_public", label: "Transport public", icon: "🚌" },
    ],
  },
];

const DOTARI_CASA_CONFIG = [
  {
    categorie: "Caracteristici casă",
    items: [
      { cheie: "casa_garaj", label: "Garaj", icon: "🚗" },
      { cheie: "casa_beci", label: "Beci / Pivniță", icon: "🏚️" },
      { cheie: "casa_pod", label: "Pod", icon: "🏠" },
      { cheie: "casa_mansarda", label: "Mansardă", icon: "🏡" },
      { cheie: "casa_curte", label: "Curte", icon: "🌳" },
      { cheie: "casa_terasa", label: "Terasă", icon: "🌿" },
      { cheie: "casa_gradina", label: "Grădină", icon: "🌸" },
      { cheie: "casa_intrare_separata", label: "Intrare separată", icon: "🚪" },
      { cheie: "casa_parcare", label: "Parcare", icon: "🅿️" },
    ],
  },
  {
    categorie: "Utilități",
    items: [
      { cheie: "casa_apa", label: "Apă", icon: "💧" },
      { cheie: "casa_canalizare", label: "Canalizare", icon: "🚰" },
      { cheie: "casa_gaz", label: "Gaz", icon: "🔥" },
      { cheie: "casa_curent", label: "Curent", icon: "⚡" },
      { cheie: "casa_internet", label: "Internet", icon: "🌐" },
      { cheie: "casa_cablu_tv", label: "Cablu TV", icon: "📺" },
    ],
  },
  {
    categorie: "Sistem încălzire",
    items: [
      { cheie: "casa_centrala_proprie", label: "Centrală proprie", icon: "🔥" },
      { cheie: "casa_calorifere", label: "Calorifere", icon: "🔥" },
      { cheie: "casa_incalzire_pardoseala", label: "Încălzire în pardoseală", icon: "♨️" },
      { cheie: "casa_termostat", label: "Termostat", icon: "🌡️" },
      { cheie: "casa_aer_conditionat", label: "Aer condiționat", icon: "❄️" },
    ],
  },
  {
    categorie: "Finisaje",
    items: [
      { cheie: "casa_gresie", label: "Gresie", icon: "⬜" },
      { cheie: "casa_faianta", label: "Faianță", icon: "⬜" },
      { cheie: "casa_parchet", label: "Parchet", icon: "🪵" },
      { cheie: "casa_vopsea_lavabila", label: "Vopsea lavabilă", icon: "🎨" },
      { cheie: "casa_usa_metalica", label: "Ușă metalică", icon: "🚪" },
      { cheie: "casa_tamplarie_pvc", label: "Tâmplărie PVC", icon: "🪟" },
      { cheie: "casa_izolatie_exterioara", label: "Izolație exterioară", icon: "🏢" },
    ],
  },
  {
    categorie: "Baie",
    items: [
      { cheie: "casa_cada", label: "Cadă", icon: "🛁" },
      { cheie: "casa_dus", label: "Duș", icon: "🚿" },
      { cheie: "casa_geam_baie", label: "Geam", icon: "🪟" },
      { cheie: "casa_ventilatie", label: "Ventilație", icon: "💨" },
    ],
  },
  {
    categorie: "Stradă & Acces",
    items: [
      { cheie: "casa_strada_asfaltata", label: "Stradă asfaltată", icon: "🛣️" },
      { cheie: "casa_strada_betonata", label: "Stradă betonată", icon: "🛣️" },
      { cheie: "casa_iluminat_public", label: "Iluminat public", icon: "💡" },
      { cheie: "casa_transport_public", label: "Transport public", icon: "🚌" },
      { cheie: "casa_acces_auto", label: "Acces auto", icon: "🚘" },
    ],
  },
];

const PASI = [
  { id: 1, label: "Informații de bază", desc: "Titlu, preț, adresă" },
  { id: 2, label: "Detalii & Dotări", desc: "Camere, suprafețe" },
  { id: 3, label: "Fotografii", desc: "Imagini proprietate" },
  { id: 4, label: "Publicare", desc: "Status și sumar" },
];

// ─── VALIDARE ─────────────────────────────────────────────────────────────────

function valideazaPas(pas, date) {
  const e = {};
  if (pas === 1) {
    if (!date.titlu || date.titlu.length < 10) e.titlu = "Minim 10 caractere";
    if (!date.pret || Number(date.pret) <= 0) e.pret = "Preț invalid";
    if (!date.adresa.oras && !date.adresa.orasCustom) e["adresa.oras"] = "Obligatoriu";
  }
  if (pas === 2) {
    if (
      !date.caracteristici.suprafata_utila ||
      Number(date.caracteristici.suprafata_utila) <= 0
    )
      e["caracteristici.suprafata_utila"] = "Obligatoriu";
  }
  return e;
}

function calcCompletare(date) {
  const checks = [
    date.titlu.length > 10,
    Number(date.pret) > 0,
    date.adresa.oras.length > 0,
    Number(date.caracteristici.suprafata_utila) > 0,
    date.descriere.length > 80,
    date.fotografii.length >= 3,
    Object.values(date.dotari).some(Boolean),
    date.adresa.judet.length > 0,
    date.adresa.strada.length > 0,
    date.caracteristici.an_constructie > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ─── UI ATOMS ────────────────────────────────────────────────────────────────

const s = {
  input: {
    width: "100%",
    padding: "8px 11px",
    fontSize: 13,
    border: "0.5px solid var(--border-secondary)",
    borderRadius: 8,
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    outline: "none",
    boxSizing: "border-box",
  },
  label: {
    fontSize: 11,
    color: "var(--text-secondary)",
    fontWeight: 500,
    display: "block",
    marginBottom: 4,
  },
  error: { fontSize: 11, color: "var(--danger)", marginTop: 3 },
  card: {
    background: "var(--bg-primary)",
    border: "0.5px solid var(--border-tertiary)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardHeader: {
    padding: "12px 18px",
    borderBottom: "0.5px solid var(--border-tertiary)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardBody: { padding: "16px 18px" },
  field: { marginBottom: 14 },
  row2: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 12,
  },
  row3: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
    gap: 10,
  },
};

function Field({ label, required, error, children }) {
  return (
    <div style={s.field}>
      {label && (
        <label style={s.label}>
          {label}
          {required && (
            <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>
          )}
        </label>
      )}
      {children}
      {error && <div style={s.error}>{error}</div>}
    </div>
  );
}

function Input({ label, required, error, ...props }) {
  return (
    <Field label={label} required={required} error={error}>
      <input style={s.input} {...props} />
    </Field>
  );
}

function Select({ label, required, error, options, value, onChange }) {
  return (
    <Field label={label} required={required} error={error}>
      <select
        value={value}
        onChange={onChange}
        style={{
          ...s.input,
          appearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          paddingRight: 28,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Textarea({ label, required, error, hint, value, onChange, rows = 4 }) {
  return (
    <Field label={label} required={required} error={error}>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        style={{ ...s.input, resize: "vertical", lineHeight: 1.6 }}
      />
      {hint && !error && (
        <div
          style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}
        >
          {hint}
        </div>
      )}
    </Field>
  );
}

function Card({ title, children }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--primary)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </span>
      </div>
      <div style={s.cardBody}>{children}</div>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        border: "0.5px solid var(--border-secondary)",
        borderRadius: 8,
        background: value ? "var(--success-light)" : "var(--bg-primary)",
        color: value ? "var(--success-dark)" : "var(--text-secondary)",
        fontSize: 13,
        cursor: "pointer",
        width: "100%",
      }}
    >
      <span
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          background: value ? "var(--success)" : "var(--border-secondary)",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 16 : 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
          }}
        />
      </span>
      {label}
    </button>
  );
}

function DotareBtn({ label, icon, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        border: checked
          ? "0.5px solid var(--primary)"
          : "0.5px solid var(--border-tertiary)",
        borderRadius: 8,
        background: checked ? "var(--primary-light)" : "var(--bg-primary)",
        color: checked ? "var(--primary)" : "var(--text-secondary)",
        fontSize: 12,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: checked ? "none" : "1px solid var(--border-secondary)",
          background: checked ? "var(--primary)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <polyline points="1,5 4,8 9,2" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontWeight: checked ? 500 : 400 }}>{label}</span>
    </button>
  );
}

// ─── NAV SIDEBAR ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Prezentare generală", icon: "⊞", href: "#" },
  { label: "Adaugǎ proprietate", icon: "⌂", badge: "47", active: true },
  { label: "Clienți", icon: "◎", href: "#" },
  { label: "Programări", icon: "▦", badge: "3", href: "#" },
  { label: "Statistici", icon: "≡", href: "#" },
  { label: "Setări", icon: "◈", href: "#" },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: 210,
        flexShrink: 0,
        background: "var(--bg-primary)",
        borderRight: "0.5px solid var(--border-tertiary)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "18px 16px 14px",
          borderBottom: "0.5px solid var(--border-tertiary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              Abu Imobiliare
            </div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              Panou administrare
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              borderRadius: 8,
              marginBottom: 2,
              fontSize: 13,
              cursor: "pointer",
              background: item.active ? "var(--primary-light)" : "transparent",
              color: item.active ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: item.active ? 500 : 400,
            }}
          >
            <span style={{ fontSize: 14, width: 16, textAlign: "center" }}>
              {item.icon}
            </span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  fontSize: 10,
                  fontWeight: 500,
                  padding: "2px 6px",
                  borderRadius: 20,
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: "12px 14px",
          borderTop: "0.5px solid var(--border-tertiary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 500,
              color: "var(--primary)",
              flexShrink: 0,
            }}
          ></div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Alin Abunei
            </div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              Agent imobiliar
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── INDICATOR PAȘI ───────────────────────────────────────────────────────────

function IndicatorPasi({ pasActiv }) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: "0.5px solid var(--border-tertiary)",
        borderRadius: 12,
        padding: "14px 20px",
        marginBottom: isMobile ? 14 : 18,
        display: "flex",
        alignItems: "flex-start",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 16 : 0,
      }}
    >
      {PASI.map((pas, idx) => {
        const done = pas.id < pasActiv;
        const active = pas.id === pasActiv;
        return (
          <div
            key={pas.id}
            style={{
              display: "flex",
              alignItems: "center",
              flex: idx < PASI.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 500,
                  background: done
                    ? "var(--primary)"
                    : active
                      ? "var(--primary-light)"
                      : "var(--bg-secondary)",
                  color: done
                    ? "white"
                    : active
                      ? "var(--primary)"
                      : "var(--text-tertiary)",
                  outline: active ? "2px solid var(--primary)" : "none",
                  outlineOffset: 2,
                }}
              >
                {done ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <polyline points="2,7 5,10 12,3" />
                  </svg>
                ) : (
                  pas.id
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: active ? 500 : 400,
                    color: active
                      ? "var(--primary)"
                      : done
                        ? "var(--text-primary)"
                        : "var(--text-tertiary)",
                    lineHeight: 1.3,
                  }}
                >
                  {pas.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-tertiary)",
                    lineHeight: 1.3,
                  }}
                >
                  {pas.desc}
                </span>
              </div>
            </div>
            {idx < PASI.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: done
                    ? "var(--primary)"
                    : "var(--border-tertiary)",
                  margin: "0 12px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAS 1: Informații de bază ────────────────────────────────────────────────

function Pas1({ date, erori, onChange }) {
  const isOrasKnown = date.adresa.oras && !date.adresa.orasCustom;
  const isCartierKnown = date.adresa.cartier && !date.adresa.cartierCustom;
  const upd = (k, v) => onChange({ [k]: v });
  const updAdr = (k, v) => onChange({ adresa: { ...date.adresa, [k]: v } });
  const updAdrBatch = (updates) => onChange({ adresa: { ...date.adresa, ...updates } });
  const updMap = (lat, lng) => onChange({ caracteristici: { ...date.caracteristici, lat: String(lat), lng: String(lng) } });

  const handleOrasChange = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      updAdrBatch({ oras: "", orasCustom: "" });
    } else {
      updAdrBatch({ oras: val, orasCustom: "", cartier: "" });
    }
  };

  const handleCartierChange = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      updAdr("cartierCustom", "");
    } else {
      updAdrBatch({ cartier: val, cartierCustom: "" });
    }
  };

  return (
    <div style={s.row2}>
      <div>
        <Card title="Informații principale">
          <Input
            label="Titlu anunț"
            required
            placeholder="ex. Apartament 3 camere, Copou, vedere panoramică"
            value={date.titlu}
            onChange={(e) => upd("titlu", e.target.value)}
            error={erori.titlu}
          />

          <Field label="Tip tranzacție" required>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                ["vanzare", "Vânzare"],
                ["inchiriere", "Închiriere"],
              ].map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => upd("tip_tranzactie", val)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border:
                      date.tip_tranzactie === val
                        ? "none"
                        : "0.5px solid var(--border-secondary)",
                    background:
                      date.tip_tranzactie === val
                        ? val === "vanzare"
                          ? "var(--primary)"
                          : "var(--secondary)"
                        : "var(--bg-primary)",
                    color:
                      date.tip_tranzactie === val
                        ? "white"
                        : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </Field>

          <Select
            label="Tip proprietate"
            value={date.tip}
            onChange={(e) => upd("tip", e.target.value)}
            options={[
              { value: "Apartament", label: "Apartament" },
              { value: "Garsonieră", label: "Garsonieră" },
              { value: "Casă", label: "Casă" },
              { value: "Terenuri", label: "Terenuri" },
              { value: "Spațiu comercial", label: "Spațiu comercial" },
              { value: "Spațiu industrial", label: "Spațiu industrial" },
              { value: "Birouri", label: "Birouri" },
            ]}
          />

          <div style={s.row2}>
            <Input
              label={
                date.tip_tranzactie === "vanzare"
                  ? "Preț (€)"
                  : "Chirie lunară (€)"
              }
              required
              type="number"
              placeholder={date.tip_tranzactie === "vanzare" ? "85000" : "450"}
              value={date.pret}
              onChange={(e) => upd("pret", e.target.value)}
              error={erori.pret}
            />
            <Field label="Negociabil">
              <Toggle
                label={date.negociabil ? "Da" : "Nu"}
                value={date.negociabil}
                onChange={(v) => upd("negociabil", v)}
              />
            </Field>
          </div>

          <Select
            label="Status proprietate"
            value={date.status_proprietate || "disponibil"}
            onChange={(e) => upd("status_proprietate", e.target.value)}
            options={[
              { value: "disponibil", label: "Disponibil" },
              { value: "vandut", label: "Vândut" },
              { value: "inchiriat", label: "Închiriat" },
            ]}
          />

          <Select
            label="Afișare pe pagina principală"
            value={date.recomandata ? "da" : "nu"}
            onChange={(e) => upd("recomandata", e.target.value === "da")}
            options={[
              { value: "da", label: "Da — apare la recomandate" },
              { value: "nu", label: "Nu — nu apare la recomandate" },
            ]}
          />

          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 10,
                color: "var(--text-primary)",
              }}
            >
              Badge-uri speciale
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 10,
              }}
            >
              <Toggle
                label="⭐ Exclusivitate"
                value={date.badge_exclusivitate}
                onChange={(v) => upd("badge_exclusivitate", v)}
              />

              <Toggle
                label="💸 Comision 0%"
                value={date.badge_comision_zero}
                onChange={(v) => upd("badge_comision_zero", v)}
              />
            </div>
          </div>

          <Textarea
            label="Descriere proprietate"
            rows={5}
            placeholder="Descrie apartamentul: finisaje, avantaje ale zonei, transport..."
            value={date.descriere}
            onChange={(e) => upd("descriere", e.target.value)}
            hint={`${date.descriere.length} caractere — minim recomandat: 100`}
          />
        </Card>
      </div>

      <div>
        <Card title="Localizare">
          <Select
            label="Județ"
            required
            value={date.adresa.judet}
            onChange={(e) => {
              updAdrBatch({ judet: e.target.value, oras: "", cartier: "" });
            }}
            options={[
              { value: "", label: "Selectează județul" },
              ...JUDETE.map((j) => ({ value: j, label: j })),
            ]}
          />

          <div style={s.row2}>
            <div>
              <Select
                label="Oraș"
                required
                value={isOrasKnown ? date.adresa.oras : "__custom__"}
                onChange={handleOrasChange}
                options={[
                  { value: "", label: "Selectează orașul" },
                  ...getOraseForJudet(date.adresa.judet).map((o) => ({ value: o, label: o })),
                  { value: "__custom__", label: "✏️ Altă localitate..." },
                ]}
                error={erori["adresa.oras"]}
              />
              {!isOrasKnown && date.adresa.judet && (
                <Input
                  placeholder="Scrie numele localității"
                  value={date.adresa.orasCustom || ""}
                  onChange={(e) => updAdr("orasCustom", e.target.value)}
                />
              )}
            </div>
            <div>
              <Select
                label="Cartier / Zonă"
                value={isCartierKnown ? date.adresa.cartier : (date.adresa.cartierCustom ? "__custom__" : "")}
                onChange={handleCartierChange}
                options={[
                  { value: "", label: "Selectează zona" },
                  ...getCartiereForOras(date.adresa.judet, date.adresa.oras).map((c) => ({ value: c, label: c })),
                  { value: "__custom__", label: "✏️ Altă zonă..." },
                ]}
              />
              {!isCartierKnown && date.adresa.cartierCustom !== undefined && !isOrasKnown && (
                <Input
                  placeholder="Scrie numele zonei"
                  value={date.adresa.cartierCustom || ""}
                  onChange={(e) => updAdr("cartierCustom", e.target.value)}
                />
              )}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}
          >
            <Input
              label="Stradă"
              placeholder="ex. Str. Vasile Lupu"
              value={date.adresa.strada}
              onChange={(e) => updAdr("strada", e.target.value)}
            />
            <Input
              label="Nr."
              placeholder="12"
              value={date.adresa.numar}
              onChange={(e) => updAdr("numar", e.target.value)}
            />
          </div>

          <Input
            label="Cod poștal"
            placeholder="700000"
            value={date.adresa.cod_postal}
            onChange={(e) => updAdr("cod_postal", e.target.value)}
          />

          <div style={{ marginTop: 4 }}>
            <MapPicker
              lat={Number(date.caracteristici.lat) || null}
              lng={Number(date.caracteristici.lng) || null}
              address={[
                date.adresa.strada,
                date.adresa.numar,
                date.adresa.cartierCustom || date.adresa.cartier,
                date.adresa.orasCustom || date.adresa.oras,
                date.adresa.judet,
              ].filter(Boolean).join(", ")}
              onChange={updMap}
              height={240}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── PAS 2: Detalii & Dotări ──────────────────────────────────────────────────

function Pas2({ date, erori, onChange }) {
  const updCar = (k, v) =>
    onChange({ caracteristici: { ...date.caracteristici, [k]: v } });
  const updDot = (k, v) => onChange({ dotari: { ...date.dotari, [k]: v } });
  const nrDotari = Object.values(date.dotari).filter(Boolean).length;
  const isTeren = date.tip === "Terenuri";
  const isCasa = date.tip === "Casă";
  const isBirou = date.tip === "Birouri";
  const isComercial = date.tip === "Spațiu comercial";
  const isIndustrial = date.tip === "Spațiu industrial";
  const pretPm2 =
    date.pret && date.caracteristici.suprafata_utila
      ? Math.round(
          Number(date.pret) / Number(date.caracteristici.suprafata_utila),
        )
      : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <Card
          title={
            date.tip === "Terenuri"
              ? "Caracteristici teren"
              : date.tip === "Spațiu comercial"
                ? "Caracteristici spațiu comercial"
                : date.tip === "Spațiu industrial"
                  ? "Caracteristici spațiu industrial"
                  : date.tip === "Birouri"
                    ? "Caracteristici birou"
                    : "Caracteristici proprietate"
          }
        >
          {!isTeren && (
            <div style={s.row3}>
              <Select
                label={
                  isBirou
                    ? "Încăperi"
                    : isComercial || isIndustrial
                      ? "Compartimentări"
                      : "Camere"
                }
                required
                value={String(date.caracteristici.nr_camere)}
                onChange={(e) => updCar("nr_camere", Number(e.target.value))}
                options={[1, 2, 3, 4, 5].map((n) => ({
                  value: String(n),
                  label: n === 5 ? "5+" : String(n),
                }))}
              />

              <Select
                label="Băi"
                required
                value={String(date.caracteristici.nr_bai)}
                onChange={(e) => updCar("nr_bai", Number(e.target.value))}
                options={[1, 2, 3].map((n) => ({
                  value: String(n),
                  label: n === 3 ? "3+" : String(n),
                }))}
              />

              {!isCasa && !isIndustrial && (
                <Select
                  label="Etaj"
                  value={date.caracteristici.etaj}
                  onChange={(e) => updCar("etaj", e.target.value)}
                  options={[
                    "parter",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "mansarda",
                  ].map((v) => ({
                    value: v,
                    label:
                      v === "parter"
                        ? "Parter"
                        : v === "mansarda"
                          ? "Mansardă"
                          : `Etaj ${v}`,
                  }))}
                />
              )}
            </div>
          )}

          {!isTeren && (
            <Select
              label="Risc seismic"
              value={date.caracteristici.risc_seismic || ""}
              onChange={(e) => updCar("risc_seismic", e.target.value)}
              options={[
                { value: "", label: "Neselectat" },
                { value: "fara_risc", label: "Fără risc seismic" },
                { value: "R1", label: "R1" },
                { value: "R2", label: "R2" },
                { value: "R3", label: "R3" },
                { value: "R4", label: "R4" },
                { value: "U1", label: "U1" },
                { value: "U2", label: "U2" },
                { value: "U3", label: "U3" },
              ]}
            />
          )}

          {!isTeren && (
            <Select
              label="Compartimentare"
              value={date.caracteristici.compartimentare || ""}
              onChange={(e) => updCar("compartimentare", e.target.value)}
              options={[
                { value: "", label: "Neselectat" },
                { value: "decomandat", label: "Decomandat" },
                { value: "semidecomandat", label: "Semidecomandat" },
                { value: "nedecomandat", label: "Nedecomandat" },
                { value: "open_space", label: "Open space" },
              ]}
            />
          )}

          <div style={s.row2}>
            <Input
              label={
                isTeren
                  ? "Suprafață teren (m²)"
                  : isIndustrial
                    ? "Suprafață hală (m²)"
                    : "Suprafață utilă (m²)"
              }
              required
              type="number"
              placeholder="65"
              value={date.caracteristici.suprafata_utila}
              onChange={(e) => updCar("suprafata_utila", e.target.value)}
              error={erori["caracteristici.suprafata_utila"]}
            />
            {!isTeren && (
              <Input
                label="Suprafață totală (m²)"
                type="number"
                placeholder="75"
                value={date.caracteristici.suprafata_totala}
                onChange={(e) => updCar("suprafata_totala", e.target.value)}
              />
            )}
          </div>

          {isTeren && (
            <>
              <div style={s.row2}>
                <Input
                  label="Nr. fronturi stradale"
                  type="number"
                  placeholder="1"
                  value={date.caracteristici.nr_fronturi_stradale || ""}
                  onChange={(e) => updCar("nr_fronturi_stradale", e.target.value)}
                />
                <Input
                  label="Front stradal (ml)"
                  type="number"
                  placeholder="25"
                  value={date.caracteristici.deschidere_strada || ""}
                  onChange={(e) => updCar("deschidere_strada", e.target.value)}
                />
              </div>
              <div style={s.row2}>
                <Select
                  label="Tip teren"
                  value={date.caracteristici.tip_teren || "intravilan"}
                  onChange={(e) => updCar("tip_teren", e.target.value)}
                  options={[
                    { value: "intravilan", label: "Intravilan" },
                    { value: "extravilan", label: "Extravilan" },
                  ]}
                />
              </div>
            </>
          )}

          {isCasa && (
            <>
              <div style={s.row2}>
                <Select
                  label="Tip casă"
                  value={date.caracteristici.tip_casa || ""}
                  onChange={(e) => updCar("tip_casa", e.target.value)}
                  options={[
                    { value: "individuala", label: "Individuală" },
                    { value: "duplex", label: "Duplex" },
                    { value: "triplex", label: "Triplex" },
                  ]}
                />
                <Input
                  label="Suprafață teren (m²)"
                  type="number"
                  placeholder="300"
                  value={date.caracteristici.suprafata_teren || ""}
                  onChange={(e) => updCar("suprafata_teren", e.target.value)}
                />
              </div>
            </>
          )}

          <div style={s.row2}>
            {!isTeren && !isIndustrial && !isCasa && (
              <>
                <Input
                  label="Etaje clădire (total)"
                  type="number"
                  placeholder="8"
                  value={date.caracteristici.nr_etaje_total}
                  onChange={(e) => updCar("nr_etaje_total", e.target.value)}
                />
                <Select
                  label="Acoperiș"
                  value={date.caracteristici.acoperis || ""}
                  onChange={(e) => updCar("acoperis", e.target.value)}
                  options={[
                    { value: "", label: "Neselectat" },
                    { value: "sarpanta", label: "Șarpantă" },
                    { value: "terasa", label: "Terasă" },
                  ]}
                />
              </>
            )}

            {!isTeren && (
              <Input
                label="An construcție"
                type="number"
                placeholder="2018"
                min={1900}
                max={2026}
                value={date.caracteristici.an_constructie}
                onChange={(e) => updCar("an_constructie", e.target.value)}
              />
            )}
          </div>

          {!isTeren && !isCasa && !isIndustrial && (
            <Select
              label="Tip imobil"
              value={date.caracteristici.tip_imobil}
              onChange={(e) => updCar("tip_imobil", e.target.value)}
              options={[
                { value: "bloc_nou", label: "Bloc nou (după 2000)" },
                { value: "bloc_vechi", label: "Bloc vechi (înainte de 2000)" },
                { value: "vila", label: "Vilă" },
                { value: "casa", label: "Casă individuală" },
              ]}
            />
          )}
        </Card>

        {pretPm2 && (
          <div
            style={{
              background: "var(--primary-light)",
              border: "0.5px solid var(--primary-border)",
              borderRadius: 12,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--primary)",
                marginBottom: 10,
              }}
            >
              Sumar calculat automat
            </div>
            <div style={s.row2}>
              <div>
                <div style={{ fontSize: 11, color: "var(--primary-muted)" }}>
                  Preț / m²
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: "var(--primary-dark)",
                  }}
                >
                  {pretPm2.toLocaleString("ro-RO")} €
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--primary-muted)" }}>
                  Dotări bifate
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: "var(--primary-dark)",
                  }}
                >
                  {nrDotari}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <Card title={`Dotări & facilități (${nrDotari} selectate)`}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
            }}
          >
            {(isTeren ? DOTARI_TEREN_CONFIG : isCasa ? DOTARI_CASA_CONFIG : DOTARI_CONFIG).map((categorie) => (
              <div
                key={categorie.categorie}
                style={{
                  background: "var(--bg-secondary)",
                  border: "0.5px solid var(--border-tertiary)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: 12,
                  }}
                >
                  {categorie.categorie}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 6,
                  }}
                >
                  {categorie.items.map(({ cheie, label, icon }) => (
                    <DotareBtn
                      key={cheie}
                      label={label}
                      icon={icon}
                      checked={!!date.dotari[cheie]}
                      onChange={(v) => updDot(cheie, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const convertToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

// ─── PAS 3: Fotografii ────────────────────────────────────────────────────────

function Pas3({ date, onChange, imaginiExistente = [], onStergeImagine }) {
  const inputRef = useRef();

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));

    const noiFotos = await Promise.all(
      arr.map(async (file, index) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        preview: await convertToBase64(file),
        name: file.name,
        isPrimara: date.fotografii.length === 0 && index === 0,
      })),
    );

    onChange({ fotografii: [...date.fotografii, ...noiFotos] });

    if (inputRef.current) inputRef.current.value = "";
  };

  const sterge = (id) => {
    const ramase = date.fotografii.filter((f) => f.id !== id);
    if (ramase.length > 0 && !ramase.some((f) => f.isPrimara))
      ramase[0].isPrimara = true;
    onChange({ fotografii: ramase });
  };

  const setPrimara = (id) =>
    onChange({
      fotografii: date.fotografii.map((f) => ({
        ...f,
        isPrimara: f.id === id,
      })),
    });

  const muta = (idx, dir) => {
    const arr = [...date.fotografii];
    const target = dir === "stanga" ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange({ fotografii: arr });
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <Card title="Fotografii proprietate">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: "1.5px dashed var(--border-secondary)",
            borderRadius: 10,
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: "var(--bg-secondary)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "var(--bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Click sau trage imaginile aici
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
            PNG, JPG, WEBP — max 10MB per fișier
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            gap: 8,
            marginTop: 16,
          }}
        >
          {[
            { icon: "☀", text: "Fotografiază pe lumină naturală" },
            { icon: "⊞", text: "Include toate camerele" },
            { icon: "★", text: "Prima poză = imaginea principală" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                background: "var(--bg-secondary)",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {imaginiExistente.length > 0 && (
        <Card title={`${imaginiExistente.length} imagini existente`}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {imaginiExistente.map((url, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "0.5px solid var(--border-tertiary)",
                  aspectRatio: "16/9",
                }}
              >
                <img
                  src={url}
                  alt={`Imagine ${idx + 1}`}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <button
                  onClick={() => onStergeImagine(idx)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Șterge
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {date.fotografii.length > 0 && (
        <Card title={`${date.fotografii.length} fotografii adăugate`}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {date.fotografii.map((foto, idx) => (
              <FotoCard
                key={foto.id}
                foto={foto}
                idx={idx}
                total={date.fotografii.length}
                onDelete={() => sterge(foto.id)}
                onSetPrimara={() => setPrimara(foto.id)}
                onMoveLeft={() => muta(idx, "stanga")}
                onMoveRight={() => muta(idx, "dreapta")}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function FotoCard({
  foto,
  idx,
  total,
  onDelete,
  onSetPrimara,
  onMoveLeft,
  onMoveRight,
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        border: "0.5px solid var(--border-tertiary)",
        aspectRatio: "16/9",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={foto.preview}
        loading="lazy"
        alt={foto.name}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {hover && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: 8,
          }}
        >
          <button
            onClick={onDelete}
            style={{
              width: "100%",
              padding: "5px 0",
              background: "rgba(226,75,74,0.9)",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Șterge
          </button>
          {!foto.isPrimara && (
            <button
              onClick={onSetPrimara}
              style={{
                width: "100%",
                padding: "5px 0",
                background: "rgba(255,255,255,0.9)",
                color: "var(--primary)",
                border: "none",
                borderRadius: 6,
                fontSize: 11,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Setează principală
            </button>
          )}
          <div style={{ display: "flex", gap: 5, width: "100%" }}>
            <button
              onClick={onMoveLeft}
              disabled={idx === 0}
              style={{
                flex: 1,
                padding: "4px 0",
                background: "rgba(255,255,255,0.7)",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                opacity: idx === 0 ? 0.4 : 1,
              }}
            >
              ←
            </button>
            <button
              onClick={onMoveRight}
              disabled={idx === total - 1}
              style={{
                flex: 1,
                padding: "4px 0",
                background: "rgba(255,255,255,0.7)",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                opacity: idx === total - 1 ? 0.4 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {foto.isPrimara && (
        <span
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            background: "var(--primary)",
            color: "white",
            fontSize: 9,
            fontWeight: 500,
            padding: "2px 7px",
            borderRadius: 20,
          }}
        >
          Principală
        </span>
      )}
      <span
        style={{
          position: "absolute",
          bottom: 5,
          right: 6,
          background: "rgba(0,0,0,0.5)",
          color: "white",
          fontSize: 10,
          width: 18,
          height: 18,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {idx + 1}
      </span>
    </div>
  );
}

function labelsToDotariObj(labelsArr) {
  const arr = labelsArr || [];
  const obj = {};
  const allConfigs = [...DOTARI_CONFIG, ...DOTARI_TEREN_CONFIG, ...DOTARI_CASA_CONFIG];
  allConfigs.forEach((cat) =>
    cat.items.forEach(({ cheie, label }) => {
      obj[cheie] = arr.includes(label);
    }),
  );
  return obj;
}

function getDotariLabels(dotari) {
  const labels = [];
  const allConfigs = [...DOTARI_CONFIG, ...DOTARI_TEREN_CONFIG, ...DOTARI_CASA_CONFIG];

  allConfigs.forEach((categorie) => {
    categorie.items.forEach((item) => {
      if (dotari[item.cheie]) {
        labels.push(item.label);
      }
    });
  });

  return labels;
}

// ─── PAS 4: Publicare ─────────────────────────────────────────────────────────

function Pas4({ date, onChange, isSubmitting, onPublish, agenti }) {
  const completare = calcCompletare(date);
  const nrDotari = Object.values(date.dotari).filter(Boolean).length;
  const isTeren = date.tip === "Terenuri";
  const isCasa = date.tip === "Casă";
  const isBirou = date.tip === "Birouri";
  const isComercial = date.tip === "Spațiu comercial";
  const isIndustrial = date.tip === "Spațiu industrial";

  const checks = [
    { label: "Titlu", ok: date.titlu.length > 10 },
    { label: "Preț", ok: Number(date.pret) > 0 },
    { label: "Suprafață", ok: Number(date.caracteristici.suprafata_utila) > 0 },
    { label: "Adresă", ok: date.adresa.oras.length > 0 },
    { label: "Descriere", ok: date.descriere.length > 80 },
    { label: "Fotografii (min. 3)", ok: date.fotografii.length >= 3 },
    { label: "Dotări selectate", ok: nrDotari > 0 },
  ];

  return (
    <div style={s.row2}>
      <div>
        <Card title="Setări publicare">
          <Select
            label="Status anunț"
            value={date.status}
            onChange={(e) => onChange({ status: e.target.value })}
            options={[
              { value: "activ", label: "Activ — vizibil pe site imediat" },
              { value: "inactiv", label: "Inactiv — ascuns, salvat" },
              { value: "ciorna", label: "Ciornă — de finalizat" },
            ]}
          />
          <Input
            label="Disponibil din"
            type="date"
            value={date.disponibil_din}
            onChange={(e) => onChange({ disponibil_din: e.target.value })}
          />
          <Select
            label="Agent responsabil"
            value={date.agent_id}
            onChange={(e) => onChange({ agent_id: e.target.value })}
            options={(agenti || []).map((a) => ({
              value: String(a.id),
              label: a.nume,
            }))}
          />
        </Card>

        <Card title="Scor completare anunț">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {completare}%
            </span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {completare >= 80
                ? "Excelent!"
                : completare >= 60
                  ? "Bun, mai poți adăuga"
                  : "Completează mai multe câmpuri"}
            </span>
          </div>
          <div
            style={{
              background: "var(--bg-secondary)",
              borderRadius: 20,
              height: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                height: 8,
                borderRadius: 20,
                background:
                  completare >= 80
                    ? "var(--success)"
                    : completare >= 50
                      ? "var(--warning)"
                      : "var(--danger)",
                width: `${completare}%`,
                transition: "width 0.4s",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {checks.map(({ label, ok }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: ok
                      ? "var(--success-light)"
                      : "var(--bg-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {ok ? (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="var(--success-dark)"
                      strokeWidth="2.5"
                    >
                      <polyline points="1,5 4,8 9,2" />
                    </svg>
                  ) : (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--border-secondary)",
                        display: "block",
                      }}
                    />
                  )}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: ok ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card title="Sumar anunț">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Titlu", date.titlu || "—"],
              [
                "Tip",
                date.tip_tranzactie === "vanzare" ? "Vânzare" : "Închiriere",
              ],
              [
                "Preț",
                date.pret
                  ? `${Number(date.pret).toLocaleString("ro-RO")} €${date.negociabil ? " (negociabil)" : ""}`
                  : "—",
              ],
              ["Exclusivitate", date.badge_exclusivitate ? "Da" : "Nu"],
              ["Comision 0%", date.badge_comision_zero ? "Da" : "Nu"],
              null,
              [
                "Locație",
                [date.adresa.cartier, date.adresa.oras, date.adresa.judet]
                  .filter(Boolean)
                  .join(", ") || "—",
              ],
              [
                "Camere / Băi",
                `${date.caracteristici.nr_camere} camere, ${date.caracteristici.nr_bai} băi`,
              ],
              [
                "Suprafață",
                date.caracteristici.suprafata_utila
                  ? `${date.caracteristici.suprafata_utila} m² utili`
                  : "—",
              ],
              ["Etaj", date.caracteristici.etaj || "—"],
              null,
              ["Fotografii", `${date.fotografii.length} imagini`],
              ["Dotări", `${nrDotari} facilități`],
            ].map((row, i) =>
              row === null ? (
                <hr
                  key={i}
                  style={{
                    border: "none",
                    borderTop: "0.5px solid var(--border-tertiary)",
                    margin: "2px 0",
                  }}
                />
              ) : (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                      flexShrink: 0,
                    }}
                  >
                    {row[0]}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      textAlign: "right",
                    }}
                  >
                    {row[1]}
                  </span>
                </div>
              ),
            )}
          </div>
        </Card>

        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 10,
            border: "none",
            background: isSubmitting ? "var(--bg-secondary)" : "var(--primary)",
            color: isSubmitting ? "var(--text-tertiary)" : "white",
            fontSize: 14,
            fontWeight: 500,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {isSubmitting ? (
            <>
              <svg
                style={{ animation: "spin 1s linear infinite" }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  opacity="0.25"
                />
                <path
                  d="M4 12a8 8 0 018-8v8z"
                  fill="currentColor"
                  opacity="0.75"
                />
              </svg>
              Se publică...
            </>
          ) : (
            "Publică anunțul"
          )}
        </button>

        {date.status === "activ" && (
          <div
            style={{
              fontSize: 11,
              color: "var(--text-tertiary)",
              textAlign: "center",
            }}
          >
            Anunțul va fi vizibil pe site imediat după publicare.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function AdaugaProprietate() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [pasActiv, setPasActiv] = useState(1);
  const [date, setDate] = useState(FORM_INITIAL);
  const [erori, setErori] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [agenti, setAgenti] = useState([]);

  useEffect(() => {
    getAgenti().then(setAgenti);
  }, []);

  useEffect(() => {
    if (!editId) return;
    const data = proprietatiStore.getById(editId);
    if (!data) {
      alert("Proprietatea nu a fost găsită.");
      setLoadingEdit(false);
      return;
    }
    const locatieParts = (data.locatie || "").split(", ");
    const cartierInit = locatieParts.length > 1 ? locatieParts[0] : "";
    const orasInit = locatieParts.length > 1 ? locatieParts[1] : locatieParts[0] || "";
    const pretRaw = String(data.pret || "").replace(/[^\d]/g, "");
    setDate({
      titlu: data.titlu || "",
      tip_tranzactie: data.tranzactie === "Închiriere" ? "inchiriere" : "vanzare",
      tip: data.tip || "Apartament",
      pret: pretRaw,
      negociabil: Boolean(data.negociabil),
      badge_exclusivitate: Boolean(data.badge_exclusivitate),
      badge_comision_zero: Boolean(data.badge_comision_zero),
      descriere: data.descriere || "",
      adresa: {
        judet: data.judet || "Iași",
        oras: orasInit || "Iași",
        cartier: cartierInit,
        strada: data.strada || "",
        numar: data.numar || "",
        cod_postal: data.cod_postal || "",
      },
      caracteristici: {
        nr_camere: data.camere || 2,
        nr_bai: data.bai || 1,
        etaj: String(data.etaj || "2"),
        nr_etaje_total: String(data.etaje_bloc || ""),
        suprafata_utila: String(data.suprafata || ""),
        suprafata_totala: String(data.suprafata_totala || ""),
        an_constructie: String(data.an || ""),
        tip_imobil: data.tip === "Casă" ? "casa" : "bloc_nou",
        deschidere_strada: String(data.deschidere_strada || ""),
        tip_teren: data.tip_teren || "intravilan",
        nr_fronturi_stradale: String(data.nr_fronturi_stradale || ""),
        tip_casa: data.tip_casa || "",
        suprafata_teren: String(data.suprafata_teren || ""),
        lat: String(data.lat || ""),
        lng: String(data.lng || ""),
        compartimentare: data.compartimentare || "",
        risc_seismic: data.risc_seismic || "",
        acoperis: data.acoperis || "",
      },
      dotari: labelsToDotariObj(data.dotari || data.facilitati),
      fotografii: [],
      imagine: data.imagini?.[0] || "",
      status: data.status === "vandut" || data.status === "inchiriat" ? data.status : "activ",
      status_proprietate: data.status || "disponibil",
      recomandata: data.recomandata !== false,
      agent_id: String(data.agent_id || ""),
      disponibil_din: "",
    });
    if (data.imagini?.length) {
      setImaginiExistente(data.imagini);
    }
    setLoadingEdit(false);
  }, [editId]);

  const [imaginiExistente, setImaginiExistente] = useState([]);

  const updateDate = useCallback((nou) => {
    setDate((prev) => ({ ...prev, ...nou }));
    setErori((prev) => {
      const c = { ...prev };
      Object.keys(nou).forEach((k) => delete c[k]);
      return c;
    });
  }, []);

  const mergeInainte = () => {
    const e = valideazaPas(pasActiv, date);
    if (Object.keys(e).length > 0) {
      setErori(e);
      return;
    }
    setErori({});
    setPasActiv((p) => Math.min(p + 1, 4));
  };

  const mergeInapoi = () => {
    setErori({});
    setPasActiv((p) => Math.max(p - 1, 1));
  };

  const salveazaCiorna = () => {
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 3000);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);

    const imaginiNoi = date.fotografii.map((foto) => foto.preview);
    const imaginiFinale = [...imaginiExistente, ...imaginiNoi];
    if (imaginiFinale.length === 0) {
      imaginiFinale.push("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80");
    }

    const pretNumeric = Number(date.pret) || 0;
    const tranzactie = date.tip_tranzactie === "vanzare" ? "Vânzare" : "Închiriere";
    const proprietateData = {
      titlu: date.titlu,
      pret: date.tip_tranzactie === "vanzare"
        ? `${pretNumeric.toLocaleString("ro-RO")} €`
        : `${pretNumeric.toLocaleString("ro-RO")} €/lună`,
      pretNumeric,
      locatie: [date.adresa.cartierCustom || date.adresa.cartier, date.adresa.orasCustom || date.adresa.oras].filter(Boolean).join(", "),
      oras: date.adresa.orasCustom || date.adresa.oras,
      zona: (date.adresa.cartierCustom || date.adresa.cartier) || (date.adresa.orasCustom || date.adresa.oras),
      tip: date.tip,
      tranzactie,
      camere: date.tip === "Terenuri" ? null : Number(date.caracteristici.nr_camere) || 1,
      bai: date.tip === "Terenuri" ? null : Number(date.caracteristici.nr_bai) || 1,
      suprafata: Number(date.caracteristici.suprafata_utila) || 0,
      deschidere_strada: date.caracteristici.deschidere_strada,
      tip_teren: date.caracteristici.tip_teren || "intravilan",
      nr_fronturi_stradale: date.caracteristici.nr_fronturi_stradale,
      tip_casa: date.caracteristici.tip_casa || "",
      suprafata_teren: date.caracteristici.suprafata_teren || "",
      etaj: date.caracteristici.etaj || "—",
      an: Number(date.caracteristici.an_constructie) || "—",
      descriere: date.descriere || "Descriere indisponibilă.",
      dotari: getDotariLabels(date.dotari),
      imagini: imaginiFinale,
      imagine: imaginiFinale[0] || "",
      recomandata: date.recomandata,
      negociabil: date.negociabil,
      badge_exclusivitate: date.badge_exclusivitate,
      badge_comision_zero: date.badge_comision_zero,
      judet: date.adresa.judet,
      strada: date.adresa.strada,
      numar: date.adresa.numar,
      cod_postal: date.adresa.cod_postal,
      suprafata_totala: date.caracteristici.suprafata_totala || null,
      etaje_bloc: date.caracteristici.nr_etaje_total || null,
      lat: date.caracteristici.lat || null,
      lng: date.caracteristici.lng || null,
      status: date.status_proprietate || "disponibil",
      compartimentare: date.caracteristici.compartimentare || null,
      risc_seismic: date.caracteristici.risc_seismic || null,
      acoperis: date.caracteristici.acoperis || null,
      agent_id: date.agent_id || null,
    };

    if (isEdit) {
      proprietatiStore.update(Number(editId), proprietateData);
    } else {
      proprietatiStore.add(proprietateData);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    alert(isEdit ? "Proprietatea a fost actualizată!" : "Proprietatea a fost publicată și apare acum pe site!");
    setIsSubmitting(false);
  };

  if (loadingEdit) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-tertiary)", color: "var(--text-secondary)", fontSize: 15 }}>
        Se încarcă...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg-tertiary)",
        fontFamily: "var(--font-sans)",
        overflowX: "hidden",
      }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* Header */}
      <header
        style={{
          background: "var(--bg-primary)",
          borderBottom: "0.5px solid var(--border-tertiary)",
          padding: isMobile ? "12px 14px" : "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            {isEdit ? "Editează proprietate" : "Adaugă proprietate nouă"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-tertiary)",
              marginTop: 2,
            }}
          >
            Pasul {pasActiv} din 4 — {PASI[pasActiv - 1].label}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--primary)",
            }}
          >
            MA
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? "16px 14px 90px" : "20px 24px",
        }}
      >
        <IndicatorPasi pasActiv={pasActiv} />

        {pasActiv === 1 && (
          <Pas1 date={date} erori={erori} onChange={updateDate} />
        )}
        {pasActiv === 2 && (
          <Pas2 date={date} erori={erori} onChange={updateDate} />
        )}
        {pasActiv === 3 && <Pas3 date={date} onChange={updateDate} imaginiExistente={imaginiExistente} onStergeImagine={(idx) => setImaginiExistente((p) => p.filter((_, i) => i !== idx))} />}
        {pasActiv === 4 && (
          <Pas4
            date={date}
            onChange={updateDate}
            isSubmitting={isSubmitting}
            onPublish={handlePublish}
            agenti={agenti}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "var(--bg-primary)",
          borderTop: "0.5px solid var(--border-tertiary)",
          padding: "12px 24px",
          display: "flex",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 0,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--danger)" }}>
          {Object.keys(erori).length > 0
            ? "Corectează erorile înainte de a continua"
            : ""}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {pasActiv > 1 && (
            <button
              onClick={mergeInapoi}
              style={{
                padding: "7px 18px",
                fontSize: 13,
                border: "0.5px solid var(--border-secondary)",
                borderRadius: 8,
                background: "var(--bg-primary)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                width: isMobile ? "100%" : "auto",
              }}
            >
              ← Înapoi
            </button>
          )}
          {pasActiv < 4 && (
            <button
              onClick={mergeInainte}
              style={{
                padding: "7px 18px",
                fontSize: 13,
                border: "none",
                borderRadius: 8,
                background: "var(--primary)",
                color: "white",
                cursor: "pointer",
                fontWeight: 500,
                width: isMobile ? "100%" : "auto",
              }}
            >
              Continuă →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
