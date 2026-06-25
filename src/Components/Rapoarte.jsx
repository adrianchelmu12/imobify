import { useEffect, useState } from "react";
import { proprietatiStore, clientiStore, programariStore, taskuriStore, comisioaneStore, campaniiStore } from "../data/stores";

const card = { background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 14 };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

function StatCard({ label, value, hint, color, bg }) {
  return (
    <div style={{ ...card, padding: "18px 20px", background: bg || "var(--bg-primary)" }}>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "var(--text-primary)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{hint}</div>
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: color || "var(--text-primary)" }}>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--bg-secondary)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: color || "var(--primary)", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

export default function Rapoarte() {
  const m = useIsMobile();
  const [date, setDate] = useState(null);

  useEffect(() => {
    setDate({
      proprietati: proprietatiStore.getAll(),
      clienti: clientiStore.getAll(),
      programari: programariStore.getAll(),
      taskuri: taskuriStore.getAll(),
      comisioane: comisioaneStore.getAll(),
      campanii: campaniiStore.getAll(),
    });
  }, []);

  if (!date) {
    return <div style={{ padding: "28px 32px", textAlign: "center", color: "var(--text-tertiary)" }}>Se încarcă...</div>;
  }

  const azi = new Date().toISOString().slice(0, 10);
  const lunaCurenta = new Date().toISOString().slice(0, 7);

  const propDisponibile = date.proprietati.filter((p) => p.status === "disponibil").length;
  const propVandute = date.proprietati.filter((p) => p.status === "vandut").length;
  const clientiActivi = date.clienti.filter((c) => c.status !== "Închis").length;
  const clientiInchisi = date.clienti.filter((c) => c.status === "Închis").length;
  const clientiNoi = date.clienti.filter((c) => c.status === "Nou").length;
  const clientiInteresati = date.clienti.filter((c) => c.status === "Interesat").length;
  const programariAzi = date.programari.filter((p) => p.data === azi).length;
  const taskuriPending = date.taskuri.filter((t) => t.status === "pending").length;
  const taskuriDone = date.taskuri.filter((t) => t.status === "done").length;
  const comisioaneTotale = date.comisioane.reduce((s, c) => s + (Number(c.suma) || 0), 0);
  const comisioanePlatite = date.comisioane.filter((c) => c.status === "Plătit").reduce((s, c) => s + (Number(c.suma) || 0), 0);
  const campaniiActive = date.campanii.filter((c) => c.status === "Activă").length;
  const leaduriDinCampanii = date.campanii.reduce((s, c) => s + (Number(c.leaduriGenerate) || 0), 0);

  const surseClienti = {};
  date.clienti.forEach((c) => { if (c.sursa) { surseClienti[c.sursa] = (surseClienti[c.sursa] || 0) + 1; } });
  const maxSursa = Math.max(...Object.values(surseClienti), 1);

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px" }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Rapoarte & Analiză</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Statistici generale și indicatori de performanță</div>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Proprietăți disponibile" value={propDisponibile} hint={`din ${date.proprietati.length} totale`} color="var(--primary)" />
        <StatCard label="Clienți activi" value={clientiActivi} hint={`${clientiInchisi} închiși`} color="var(--warning-dark)" />
        <StatCard label="Comisioane" value={`${comisioaneTotale.toLocaleString("ro-RO")} €`} hint={`${comisioanePlatite.toLocaleString("ro-RO")} € plătite`} color="#be185d" />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 16 }}>
        <section style={card}>
          <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border-tertiary)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Clienți pe surse</div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {Object.keys(surseClienti).length === 0 ? (
              <div style={{ color: "var(--text-tertiary)", fontSize: 12 }}>Nicio sursă înregistrată.</div>
            ) : (
              Object.entries(surseClienti)
                .sort(([, a], [, b]) => b - a)
                .map(([sursa, count]) => (
                  <MiniBar key={sursa} label={sursa} value={count} max={maxSursa} color="var(--primary)" />
                ))
            )}
          </div>
        </section>

        <section style={card}>
          <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border-tertiary)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Prezentare generală</div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <MiniBar label="Proprietăți disponibile" value={propDisponibile} max={date.proprietati.length || 1} color="var(--primary)" />
            <MiniBar label="Proprietăți vândute" value={propVandute} max={date.proprietati.length || 1} color="var(--success)" />
            <MiniBar label="Clienți activi" value={clientiActivi} max={date.clienti.length || 1} color="var(--warning)" />
            <MiniBar label="Clienți interesați" value={clientiInteresati} max={date.clienti.length || 1} color="var(--success)" />
            <MiniBar label="Task-uri rezolvate" value={taskuriDone} max={date.taskuri.length || 1} color="var(--success)" />
          </div>
        </section>

        <section style={card}>
          <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border-tertiary)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Indicatori activitate</div>
          </div>
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{date.programari.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Programări totale</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--warning-dark)" }}>{programariAzi}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Programări azi</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--danger)" }}>{taskuriPending}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Task-uri restante</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--success-dark)" }}>{taskuriDone}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Task-uri rezolvate</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{date.clienti.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Clienți total</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0369a1" }}>{clientiNoi}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Clienți noi</div>
            </div>
          </div>
        </section>

        <section style={card}>
          <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border-tertiary)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Marketing & Campanii</div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{date.campanii.length}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Campanii</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--success-dark)" }}>{campaniiActive}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Active</div>
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "12px", borderRadius: 10, background: "var(--primary-light)" }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Lead-uri generate din campanii</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{leaduriDinCampanii}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
