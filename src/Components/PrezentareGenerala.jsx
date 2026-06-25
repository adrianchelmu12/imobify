import { useEffect, useState } from "react";
import { proprietatiStore, clientiStore, programariStore } from "../data/stores";
import {
  HiOutlineHomeModern,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendarDays,
  HiOutlineClock,
} from "react-icons/hi2";

const card = {
  background: "var(--bg-primary)",
  border: "0.5px solid var(--border-tertiary)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)",
};

function StatCard({ label, value, subtitle, icon: Icon, color, gradient }) {
  return (
    <div
      style={{
        ...card,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div style={{ position: "absolute", top: -24, right: -24, width: 100, height: 100, borderRadius: "50%", background: gradient || "var(--primary-light)", opacity: 0.25 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: color || "var(--primary-light)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={22} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
          {label}
        </div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function DonutChart({ data, colors, total }) {
  const size = 150;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((item, i) => {
    const pct = total > 0 ? item.value / total : 0;
    const dash = circumference * pct;
    const seg = { ...item, color: colors[i], dash, dashOffset: circumference - offset, pct };
    offset += dash;
    return seg;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border-tertiary)" strokeWidth={stroke} />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.dash > 0 ? seg.color : "transparent"}
            strokeWidth={stroke}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.dashOffset}
            strokeLinecap="round"
          />
        ))}
        <text x={center} y={center + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="26" fontWeight="800"
          transform={`rotate(90, ${center}, ${center})`}>
          {total}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {seg.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentCard({ title, children }) {
  return (
    <section style={{ ...card, padding: 22 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
        <HiOutlineClock size={18} color="var(--primary)" />
        {title}
      </div>
      {children}
    </section>
  );
}

export default function PrezentareGenerala() {
  const [proprietati, setProprietati] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [programari, setProgramari] = useState([]);

  useEffect(() => {
    setProprietati(proprietatiStore.getAll());
    setClienti(clientiStore.getAll());
    setProgramari(programariStore.getAll());
  }, []);

  const azi = new Date().toISOString().slice(0, 10);
  const programariAzi = programari.filter((p) => p.data === azi).length;
  const total = proprietati.length;
  const disponibile = proprietati.filter((p) => p.status === "disponibil").length;
  const vandute = proprietati.filter((p) => p.status === "vandut" || p.status === "inchiriat").length;
  const vanzare = proprietati.filter((p) => p.tranzactie === "Vânzare").length;
  const inchiriere = proprietati.filter((p) => p.tranzactie === "Închiriere").length;
  const apartamente = proprietati.filter((p) => p.tip === "Apartament" || p.tip === "Garsonieră").length;
  const caseTeren = proprietati.filter((p) => p.tip === "Casă").length;
  const terenuri = proprietati.filter((p) => p.tip === "Terenuri").length;
  const spatii = proprietati.filter((p) => p.tip === "Spațiu comercial" || p.tip === "Spațiu industrial" || p.tip === "Birouri").length;

  return (
    <div style={{ padding: "32px", maxWidth: 1280 }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Prezentare generală</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
          {total} proprietăți · {clienti.length} clienți · {programariAzi} programări azi
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total proprietăți" value={total} icon={HiOutlineHomeModern} color="var(--primary-light)" gradient="var(--primary-light)" />
        <StatCard label="Disponibile" value={disponibile} icon={HiOutlineCheckCircle} color="var(--success-light)" gradient="var(--success-light)" />
        <StatCard label="Vândute / Închiriate" value={vandute} icon={HiOutlineXCircle} color="var(--danger-light)" gradient="var(--danger-light)" />
        <StatCard label="Programări azi" value={programariAzi} icon={HiOutlineCalendarDays} color="#dbeafe" gradient="#dbeafe" />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 22 }}>După tip proprietate</div>
          <DonutChart total={total}
            data={[
              { label: "Apartamente / Garsoniere", value: apartamente },
              { label: "Case", value: caseTeren },
              { label: "Terenuri", value: terenuri },
              { label: "Spații comerciale", value: spatii },
            ]}
            colors={["var(--primary)", "#f59e0b", "#10b981", "#6366f1"]}
          />
        </div>
        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 22 }}>După tranzacție</div>
          <DonutChart total={total}
            data={[
              { label: "Vânzare", value: vanzare },
              { label: "Închiriere", value: inchiriere },
            ]}
            colors={["var(--primary)", "#10b981"]}
          />
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <RecentCard title="Proprietăți recente">
          {proprietati.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: 16, textAlign: "center" }}>Nu există proprietăți adăugate încă.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {proprietati.slice(0, 4).map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, borderRadius: 14, background: "var(--bg-secondary)" }}>
                  <img loading="lazy"
                    src={item.imagini?.[0] || item.imagine || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"}
                    alt={item.titlu}
                    style={{ width: 64, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.titlu}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{item.locatie} · {item.pret}</div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: item.status === "disponibil" ? "var(--success-light)" : "var(--bg-secondary)", color: item.status === "disponibil" ? "var(--success-dark)" : "var(--text-tertiary)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </RecentCard>

        <RecentCard title="Clienți recenți">
          {clienti.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: 16, textAlign: "center" }}>Nu există clienți adăugați încă.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clienti.slice(0, 4).map((client) => (
                <div key={client.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 12, borderRadius: 14, background: "var(--bg-secondary)" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{client.nume}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{client.telefon} · {client.interes}</div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 999,
                    background: client.status === "Interesat" ? "var(--success-light)" : client.status === "Nou" ? "var(--warning-light)" : "var(--bg-secondary)",
                    color: client.status === "Interesat" ? "var(--success-dark)" : client.status === "Nou" ? "var(--warning-dark)" : "var(--text-tertiary)",
                    fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </RecentCard>
      </section>
    </div>
  );
}
