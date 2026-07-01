import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { programariStore, clientiStore } from "../data/stores";

const STATUS = ["Toate", "Confirmată", "În așteptare", "Importantă", "Finalizată", "Anulată"];
const TIPURI = ["Vizionare", "Întâlnire", "Contract", "Apel", "Altele"];
const LUNI = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
const ZILE = ["L","M","M","J","V","S","D"];

const statusStyle = {
  Confirmată: { background: "var(--success-light)", color: "var(--success-dark)" },
  "În așteptare": { background: "var(--warning-light)", color: "var(--warning-dark)" },
  Importantă: { background: "var(--danger-light)", color: "var(--danger)" },
  Finalizată: { background: "var(--primary-light)", color: "var(--primary)" },
  Anulată: { background: "var(--bg-secondary)", color: "var(--text-secondary)" },
};

const DOT_COLORS = {
  Confirmată: "#10b981",
  "În așteptare": "#f59e0b",
  Importantă: "#ef4444",
  Finalizată: "#6366f1",
  Anulată: "#94a3b8",
};

const page = { padding: "22px 24px" };
const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

function formatData(data) {
  if (!data) return "—";
  return new Date(`${data}T12:00:00`).toLocaleDateString("ro-RO", { weekday: "short", day: "2-digit", month: "short" });
}

function StatCard({ label, value, hint }) {
  return (
    <div style={{ ...card, padding: "20px 22px", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{hint}</div>
    </div>
  );
}

function ProgramareForm({ clienti, onAdd }) {
  const m = useIsMobile();
  const [eroare, setEroare] = useState("");
  const [form, setForm] = useState({ data: new Date().toISOString().slice(0, 10), ora: "10:00", titlu: "", client: "", telefon: "", locatie: "", tip: "Vizionare", status: "Confirmată", observatii: "", client_id: "" });

  const update = (key, value) => { setForm((p) => ({ ...p, [key]: value })); if (eroare) setEroare(""); };

  const alegeClient = (clientId) => {
    if (!clientId) return;
    const client = clienti.find((c) => String(c.id) === clientId);
    if (!client) return;
    setForm((p) => ({ ...p, client_id: clientId, client: client.nume, telefon: client.telefon || p.telefon, locatie: client.zona || p.locatie }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.titlu.trim()) { setEroare("Completează titlul."); return; }
    if (!form.client.trim()) { setEroare("Completează numele clientului."); return; }
    if (!form.data || !form.ora) { setEroare("Alege data și ora."); return; }
    onAdd({ ...form, telefon: form.telefon || "—", locatie: form.locatie || "—", observatii: form.observatii || "—", ultimaActualizare: "Acum" });
    setForm({ data: new Date().toISOString().slice(0, 10), ora: "10:00", titlu: "", client: "", telefon: "", locatie: "", tip: "Vizionare", status: "Confirmată", observatii: "", client_id: "" });
  };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Adaugă programare nouă</div>
      {eroare && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "#FEE2E2", color: "#B91C1C", fontSize: 12 }}>{eroare}</div>}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 10 }}>
        <input style={input} type="date" value={form.data} onChange={(e) => update("data", e.target.value)} />
        <input style={input} type="time" value={form.ora} onChange={(e) => update("ora", e.target.value)} />
        <select style={{ ...input, gridColumn: "1 / -1" }} value={form.client_id} onChange={(e) => alegeClient(e.target.value)}>
          <option value="">Selectează client existent...</option>
          {clienti.map((c) => <option key={c.id} value={String(c.id)}>{c.nume} — {c.telefon}</option>)}
        </select>
        <input style={{ ...input, gridColumn: "1 / -1" }} placeholder="Titlu programare *" value={form.titlu} onChange={(e) => update("titlu", e.target.value)} />
        <input style={input} placeholder="Client *" value={form.client} onChange={(e) => { update("client", e.target.value); update("client_id", ""); }} />
        <input style={input} placeholder="Telefon" value={form.telefon} onChange={(e) => update("telefon", e.target.value)} />
        <input style={{ ...input, gridColumn: "1 / -1" }} placeholder="Locație" value={form.locatie} onChange={(e) => update("locatie", e.target.value)} />
        <select style={input} value={form.tip} onChange={(e) => update("tip", e.target.value)}>{TIPURI.map((t) => <option key={t}>{t}</option>)}</select>
        <select style={input} value={form.status} onChange={(e) => update("status", e.target.value)}>{STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}</select>
        <textarea style={{ ...input, gridColumn: "1 / -1", resize: "vertical", minHeight: 74 }} placeholder="Observații" value={form.observatii} onChange={(e) => update("observatii", e.target.value)} />
        <button type="submit" style={{ gridColumn: "1 / -1", border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Adaugă programare</button>
      </div>
    </form>
  );
}

function CalendarView({ programari, schimbaStatus, stergeProgramare }) {
  const now = new Date();
  const [luna, setLuna] = useState(now.getMonth());
  const [an, setAn] = useState(now.getFullYear());
  const [ziSel, setZiSel] = useState(null);

  const zileInLuna = new Date(an, luna + 1, 0).getDate();
  const primaZi = new Date(an, luna, 1).getDay();
  const offset = primaZi === 0 ? 6 : primaZi - 1;
  const aziStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

  const progPeZi = {};
  programari.forEach((p) => {
    if (!p.data) return;
    const [a, l, z] = p.data.split("-").map(Number);
    if (a === an && l === luna + 1) {
      if (!progPeZi[z]) progPeZi[z] = [];
      progPeZi[z].push(p);
    }
  });

  const prev = () => { if (luna === 0) { setLuna(11); setAn(an-1); } else setLuna(luna-1); setZiSel(null); };
  const next = () => { if (luna === 11) { setLuna(0); setAn(an+1); } else setLuna(luna+1); setZiSel(null); };
  const today = () => { setLuna(now.getMonth()); setAn(now.getFullYear()); setZiSel(null); };

  const ziSelData = ziSel ? progPeZi[ziSel] || [] : [];
  const btn = { border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={prev} style={btn}>←</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{LUNI[luna]} {an}</span>
          <button onClick={today} style={{ ...btn, fontSize: 11, padding: "4px 8px" }}>Azi</button>
        </div>
        <button onClick={next} style={btn}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {ZILE.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, padding: "6px 0" }}>{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: zileInLuna }).map((_, i) => {
          const zi = i + 1;
          const ev = progPeZi[zi] || [];
          const isToday = aziStr === `${an}-${String(luna+1).padStart(2,"0")}-${String(zi).padStart(2,"0")}`;
          const isSel = ziSel === zi;
          return (
            <div key={zi} onClick={() => setZiSel(isSel ? null : zi)} style={{
              padding: "5px 3px", minHeight: 48, cursor: "pointer", borderRadius: 8, textAlign: "center",
              background: isSel ? "rgba(99,102,241,0.1)" : isToday ? "rgba(99,102,241,0.06)" : "transparent",
              border: isSel ? "2px solid var(--primary)" : isToday ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
            }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? "var(--primary)" : "var(--text-primary)", marginBottom: 3 }}>{zi}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                {ev.slice(0, 4).map((e, j) => (
                  <span key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: DOT_COLORS[e.status] || "#6366f1", display: "inline-block" }} />
                ))}
              </div>
              {ev.length > 4 && <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 1 }}>+{ev.length - 4}</div>}
            </div>
          );
        })}
      </div>
      {ziSel && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border-tertiary)", paddingTop: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
            {ziSel} {LUNI[luna]} {an}
            {ziSelData.length > 0 && <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 400, marginLeft: 8 }}>({ziSelData.length} programăr{ziSelData.length === 1 ? "e" : "i"})</span>}
          </div>
          {ziSelData.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: 12 }}>Nicio programare.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ziSelData.sort((a,b) => a.ora.localeCompare(b.ora)).map((pr) => (
                <div key={pr.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "0.5px solid var(--border-tertiary)", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{pr.ora}</span>
                      <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{pr.tip}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{pr.titlu}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{pr.client} · {pr.telefon}{pr.locatie !== "—" ? ` · ${pr.locatie}` : ""}</div>
                    {pr.observatii !== "—" && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3, fontStyle: "italic" }}>{pr.observatii}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <select value={pr.status} onChange={(e) => schimbaStatus(pr.id, e.target.value)} style={{ ...statusStyle[pr.status], border: "none", outline: "none", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, cursor: "pointer" }}>
                      {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => stergeProgramare(pr.id)} style={{ border: "none", background: "transparent", color: "var(--danger)", fontSize: 16, cursor: "pointer", padding: "2px 4px", lineHeight: 1 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Programari() {
  const m = useIsMobile();
  const { getToken, isLoaded } = useAuth();
  const [programari, setProgramari] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Toate");
  const [viewMode, setViewMode] = useState("calendar");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const authFetch = async (url, opts = {}) => {
    const token = await getToken({ template: "api" });
    return fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
    });
  };

  const checkGoogleStatus = async () => {
    try {
      const res = await authFetch("/api/organizations?action=google-status");
      if (res.ok) {
        const data = await res.json();
        setGoogleConnected(data.connected);
        setGoogleEmail(data.email);
      }
    } catch {}
  };

  const syncToGoogle = async (programare) => {
    if (!googleConnected) return;
    try {
      await authFetch("/api/organizations?action=google-sync", {
        method: "POST",
        body: JSON.stringify({ programare }),
      });
    } catch {}
  };

  const deleteFromGoogle = async (googleEventId, programareId) => {
    if (!googleConnected) return;
    try {
      await authFetch("/api/organizations?action=google-delete-event", {
        method: "POST",
        body: JSON.stringify({ googleEventId, programareId }),
      });
    } catch {}
  };

  const connectGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    if (!clientId || clientId.includes("your-client")) {
      alert("Configurează VITE_GOOGLE_CLIENT_ID și GOOGLE_CLIENT_SECRET în environment variables.");
      return;
    }
    const redirectUri = window.location.origin + "/admin/programari";
    const scope = "https://www.googleapis.com/auth/calendar.events";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  const disconnectGoogle = async () => {
    if (!confirm("Deconectezi Google Calendar? Programările nu vor mai fi sincronizate.")) return;
    await authFetch("/api/organizations?action=google-disconnect", { method: "DELETE" });
    setGoogleConnected(false);
    setGoogleEmail(null);
  };

  useEffect(() => {
    setProgramari(programariStore.getAll());
    setClienti(clientiStore.getAll());
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    checkGoogleStatus();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setSyncLoading(true);
      const redirectUri = window.location.origin + "/admin/programari";
      authFetch("/api/organizations?action=google-connect", {
        method: "POST",
        body: JSON.stringify({ code, redirectUri }),
      }).then(async (res) => {
        const data = await res.json();
        if (data.ok) {
          setGoogleConnected(true);
          setGoogleEmail(data.email);
        }
      }).catch(() => {}).finally(() => {
        setSyncLoading(false);
        window.history.replaceState({}, "", "/admin/programari");
      });
    }
  }, [isLoaded]);

  const refresh = () => {
    setProgramari(programariStore.getAll());
    setClienti(clientiStore.getAll());
  };

  const stergeProgramare = (id) => {
    if (!confirm("Sigur vrei să ștergi această programare?")) return;
    const pr = programari.find(p => p.id === id);
    programariStore.delete(id);
    if (pr) deleteFromGoogle(pr.googleEventId, pr.id);
    refresh();
  };

  const schimbaStatus = (id, statusNou) => {
    programariStore.update(id, { status: statusNou, ultimaActualizare: "Acum" });
    const pr = programari.find(p => p.id === id);
    if (pr) syncToGoogle({ ...pr, status: statusNou });
    refresh();
  };

  const onAddProgramare = (programareNoua) => {
    const added = programariStore.add(programareNoua);
    refresh();
    if (added) syncToGoogle(added);
  };

  const programariFiltrate = useMemo(() => {
    return programari.filter((p) => {
      const txt = `${p.titlu} ${p.client} ${p.telefon} ${p.locatie} ${p.tip} ${p.observatii}`.toLowerCase();
      return txt.includes(search.toLowerCase()) && (status === "Toate" || p.status === status);
    });
  }, [programari, search, status]);

  const azi = new Date().toISOString().slice(0, 10);
  const stats = { total: programari.length, azi: programari.filter((p) => p.data === azi).length, confirmate: programari.filter((p) => p.status === "Confirmată").length, importante: programari.filter((p) => p.status === "Importantă").length };

  const tabBtn = (mode, label) => ({
    border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
    background: viewMode === mode ? "var(--primary)" : "var(--bg-secondary)",
    color: viewMode === mode ? "#fff" : "var(--text-secondary)",
  });

  return (
    <div style={{ ...page, padding: m ? "18px 14px 28px" : "22px 24px" }}>
      <header style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>Programări</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Gestionează vizionările, întâlnirile, contractele și apelurile cu clienții.</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {syncLoading ? (
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Conectare...</span>
            ) : googleConnected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--success-dark)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> {googleEmail || "Conectat"}
                </span>
                <button onClick={disconnectGoogle} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>Deconectează</button>
              </div>
            ) : (
              <button onClick={connectGoogle} style={{ border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: "var(--bg-secondary)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                📅 Conectează Google Calendar
              </button>
            )}
            <button onClick={() => setViewMode("calendar")} style={tabBtn("calendar", "Calendar")}>📅 Calendar</button>
            <button onClick={() => setViewMode("list")} style={tabBtn("list", "Listă")}>📋 Listă</button>
          </div>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <StatCard label="Total programări" value={stats.total} hint="în calendar" />
        <StatCard label="Astăzi" value={stats.azi} hint="programate azi" />
        <StatCard label="Confirmate" value={stats.confirmate} hint="gata de desfășurat" />
        <StatCard label="Importante" value={stats.importante} hint="necesită atenție" />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 315px", gap: 16, alignItems: "start" }}>
        <section style={card}>
          {viewMode === "list" && (
            <>
              <div style={{ padding: 16, borderBottom: "0.5px solid var(--border-tertiary)" }}>
                <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 180px", gap: 10 }}>
                  <input style={input} placeholder="Caută după client, telefon, locație, tip..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                </div>
              </div>
              {!m ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                    <thead>
                      <tr style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontSize: 11, textAlign: "left" }}>
                        <th style={{ padding: "11px 14px", fontWeight: 600 }}>Data</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Ora</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Programare</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Client</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Tip</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Status</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Actualizare</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programariFiltrate.map((pr) => (
                        <tr key={pr.id} style={{ borderTop: "0.5px solid var(--border-tertiary)" }}>
                          <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{formatData(pr.data)}</td>
                          <td style={{ padding: "13px 14px", fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>{pr.ora}</td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{pr.titlu}</div>
                            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{pr.locatie}</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{pr.observatii}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                              Adăugat de {pr.createdByName || "—"}
                              {pr.updatedByName && pr.updatedByName !== pr.createdByName ? ` · Modificat de ${pr.updatedByName}` : ""}
                            </div>
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{pr.client}</div>
                            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{pr.telefon}</div>
                          </td>
                          <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{pr.tip}</td>
                          <td style={{ padding: "13px 14px" }}>
                            <select value={pr.status} onChange={(e) => schimbaStatus(pr.id, e.target.value)}
                              style={{ ...statusStyle[pr.status], border: "none", outline: "none", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 20, cursor: "pointer" }}>
                              {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{pr.ultimaActualizare || "—"}</td>
                          <td style={{ padding: "13px 14px" }}>
                            <button type="button" onClick={() => stergeProgramare(pr.id)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Șterge</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {programariFiltrate.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există programări.</div>}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
                  {programariFiltrate.length === 0 && <div style={{ padding: 22, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există programări.</div>}
                  {programariFiltrate.map((pr) => (
                    <div key={pr.id} style={{ border: "1px solid var(--border-tertiary)", borderRadius: 14, padding: 14, background: "var(--bg-primary)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{pr.titlu}</div>
                          <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>{formatData(pr.data)} • {pr.ora}</div>
                        </div>
                        <select value={pr.status} onChange={(e) => schimbaStatus(pr.id, e.target.value)}
                          style={{ ...statusStyle[pr.status], border: "none", outline: "none", borderRadius: 20, padding: "5px 8px", fontSize: 11, fontWeight: 700, maxWidth: 130 }}>
                          {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                        <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Client</div><div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{pr.client}</div><div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{pr.telefon}</div></div>
                        <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Locație</div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{pr.locatie}</div></div>
                        <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Tip</div><div style={{ fontSize: 13, color: "var(--text-primary)" }}>{pr.tip}</div></div>
                        <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Observații</div><div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.45 }}>{pr.observatii}</div></div>
                        <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Ultima actualizare</div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{pr.ultimaActualizare || "—"}</div></div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                          Adăugat de {pr.createdByName || "—"}
                          {pr.updatedByName && pr.updatedByName !== pr.createdByName ? ` · Modificat de ${pr.updatedByName}` : ""}
                        </div>
                      </div>
                      <button type="button" onClick={() => stergeProgramare(pr.id)} style={{ width: "100%", border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Șterge programarea</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {viewMode === "calendar" && (
            <div style={{ padding: 16 }}>
              <CalendarView programari={programari} schimbaStatus={schimbaStatus} stergeProgramare={stergeProgramare} />
            </div>
          )}
        </section>
        <ProgramareForm clienti={clienti} onAdd={onAddProgramare} />
      </div>
    </div>
  );
}
