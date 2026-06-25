import { useEffect, useState } from "react";
import { clientiStore } from "../data/stores";

const COLOANE = [
  { key: "Nou", label: "Noi", color: "var(--primary)", bg: "var(--primary-light)" },
  { key: "Contactat", label: "Contactați", color: "var(--warning-dark)", bg: "var(--warning-light)" },
  { key: "Interesat", label: "Interesați", color: "var(--success-dark)", bg: "var(--success-light)" },
  { key: "Închis", label: "Închiși", color: "var(--text-secondary)", bg: "var(--bg-secondary)" },
];

const card = { background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 14 };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

export default function Pipeline() {
  const m = useIsMobile();
  const [clienti, setClienti] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => { setClienti(clientiStore.getAll()); }, []);

  const refresh = () => setClienti(clientiStore.getAll());

  const changeStatus = (id, newStatus) => {
    clientiStore.update(id, { status: newStatus, ultimaInteractiune: "Acum" });
    refresh();
  };

  const clientiFiltrati = clienti.filter((c) => {
    const txt = `${c.nume} ${c.telefon} ${c.email} ${c.interes} ${c.zona}`.toLowerCase();
    return txt.includes(search.toLowerCase());
  });

  const total = clienti.length;
  const active = clienti.filter((c) => c.status !== "Închis").length;

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px" }}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Pipeline vânzări</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{total} clienți în pipeline · {active} activi</div>
      </header>

      <div style={{ marginBottom: 16, maxWidth: 400 }}>
        <input style={input} placeholder="Caută client..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        {m ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {COLOANE.map((col) => {
              const items = clientiFiltrati.filter((c) => c.status === col.key);
              return (
                <div key={col.key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: col.color }}>{col.label}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: col.color, background: col.bg, padding: "2px 10px", borderRadius: 20 }}>{items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((c) => (
                      <div key={c.id} style={{ ...card, padding: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{c.nume}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{c.telefon || "—"} {c.email !== "—" && c.email ? `· ${c.email}` : ""}</div>
                        {c.interes && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>{c.interes}</div>}
                        {c.buget && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>{c.buget}</div>}
                        <select value={c.status} onChange={(e) => changeStatus(c.id, e.target.value)}
                          style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-secondary)", background: col.bg, color: col.color, fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                          {COLOANE.map((col) => <option key={col.key} value={col.key}>{col.label}</option>)}
                        </select>
                      </div>
                    ))}
                    {items.length === 0 && <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--text-tertiary)", border: "1px dashed var(--border-tertiary)", borderRadius: 10 }}>Niciun client</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", gap: 12, minWidth: 950 }}>
            {COLOANE.map((col) => {
              const items = clientiFiltrati.filter((c) => c.status === col.key);
              return (
                <div key={col.key} style={{ ...card, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: col.color, background: col.bg, borderBottom: "1px solid var(--border-tertiary)", display: "flex", justifyContent: "space-between" }}>
                    {col.label}
                    <span style={{ opacity: 0.7 }}>{items.length}</span>
                  </div>
                  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 120 }}>
                    {items.map((c) => (
                      <div key={c.id} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-tertiary)", background: "var(--bg-primary)" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{c.nume}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 3 }}>{c.telefon || "—"}</div>
                        {c.interes && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.interes}</div>}
                        {c.buget && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>{c.buget}</div>}
                        <select value={c.status} onChange={(e) => changeStatus(c.id, e.target.value)}
                          style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-tertiary)", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: 10, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                          {COLOANE.map((col) => <option key={col.key} value={col.key}>{col.label}</option>)}
                        </select>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "var(--text-tertiary)" }}>—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
