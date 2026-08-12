import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { clientiStore, proprietatiStore } from "../data/stores";
import {
  HiOutlineArrowsRightLeft,
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const FALLBACK_IMG = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => {
    const r = () => setM(window.innerWidth <= 900);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return m;
}

function scoreColor(score) {
  if (score >= 80) return { bg: "#dcfce7", fg: "#166534" };
  if (score >= 60) return { bg: "#fef3c7", fg: "#92400e" };
  return { bg: "#f3f4f6", fg: "#6b7280" };
}

function parseJson(text) {
  if (!text) throw new Error("Răspuns gol");
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("JSON invalid");
  return JSON.parse(t.slice(start, end + 1));
}

export default function Matching() {
  const m = useIsMobile();
  const { getToken } = useAuth();

  const [clienti, setClienti] = useState([]);
  const [proprietati, setProprietati] = useState([]);
  const [rezultate, setRezultate] = useState(null);
  const [seIncarca, setSeIncarca] = useState(false);
  const [eroare, setEroare] = useState("");
  const [cauta, setCauta] = useState("");

  useEffect(() => {
    setClienti(clientiStore.getAll());
    setProprietati(proprietatiStore.getAll());
  }, []);

  const clientiActivi = clienti.filter((c) => c.status !== "Închis");
  const propDisponibile = proprietati.filter(
    (p) => !["vandut", "inchiriat"].includes(p.status) && !["vandut", "inchiriat"].includes(p.status_proprietate),
  );

  const genul = async () => {
    setSeIncarca(true);
    setEroare("");

    const cLimit = clientiActivi.slice(0, 20).map((c) => ({
      id: String(c.id),
      nume: c.nume,
      buget: c.buget || "",
      interes: c.interes || "",
      zona: c.zona || "",
      tranzactie: c.tranzactie || "Vânzare",
    }));

    const pLimit = propDisponibile.slice(0, 60).map((p) => ({
      id: String(p.id),
      titlu: p.titlu,
      tip: p.tip || "",
      tranzactie: p.tranzactie || (p.pretNumeric ? "Vânzare" : ""),
      pret: Number(p.pretNumeric || 0),
      oras: p.oras || p.adresa?.oras || "",
      zona: p.zona || p.adresa?.cartier || "",
      camere: p.camere || "",
      suprafata: p.suprafata || "",
    }));

    if (cLimit.length === 0 || pLimit.length === 0) {
      setEroare("Adaugă cel puțin un client activ și o proprietate disponibilă.");
      setSeIncarca(false);
      return;
    }

    const system = `Ești un motor inteligent de potrivire imobiliară pentru o agenție din România.
Primești o listă de clienți (cu buget, interes, zonă și tipul tranzacției) și o listă de proprietăți disponibile.
Pentru FIECARE client, alege cele mai potrivite proprietăți (maxim 3) care se potrivesc cu bugetul, tipul dorit și zona.
Ține cont de: buget (prețul să fie apropiat sau sub buget), tipul de proprietate cerut în "interes", zona dorită, și ca tipul tranzacției proprietății să coincidă cu cel al clientului ("Vânzare" vs "Închiriere").
Returnează STRICT un singur obiect JSON, fără alt text, cu următoarea structură:
{ "<id_client>": [ { "proprietateId": "<id_proprietate>", "score": <număr 0-100>, "motiv": "<o frază scurtă în română care explică de ce se potrivește>" } ] }
Dacă un client nu are nicio potrivire relevantă, folosește un array gol pentru el. Nu adăuga markdown, nu adăuga comentarii, doar JSON.`;

    const user = `CLIENTI: ${JSON.stringify(cLimit)}\n\nPROPRIETATI: ${JSON.stringify(pLimit)}`;

    try {
      const token = await getToken({ template: "api" });
      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const parsed = parseJson(content);

      const map = {};
      clientiActivi.slice(0, 20).forEach((c) => {
        map[String(c.id)] = parsed[String(c.id)] || [];
      });

      setRezultate(map);
    } catch (err) {
      console.error("Matching AI error:", err);
      setEroare("Nu am putut genera potrivirile. Verifică DEEPSEEK_API_KEY în environment variables pe Vercel.");
    } finally {
      setSeIncarca(false);
    }
  };

  const propById = (id) => proprietati.find((p) => String(p.id) === String(id));

  const clientiCuRezultate = clientiActivi
    .slice(0, 20)
    .filter((c) => {
      if (!cauta) return true;
      const txt = `${c.nume} ${c.telefon || ""} ${c.interes || ""} ${c.zona || ""}`.toLowerCase();
      return txt.includes(cauta.toLowerCase());
    });

  const totalPotriviri = rezultate ? Object.values(rezultate).reduce((s, arr) => s + arr.length, 0) : 0;
  const scorMediu = rezultate && totalPotriviri > 0
    ? Math.round(Object.values(rezultate).flat().reduce((s, x) => s + (Number(x.score) || 0), 0) / totalPotriviri)
    : 0;

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "32px", maxWidth: 1100 }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, #8b5cf6, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
            <HiOutlineArrowsRightLeft size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>Matching AI</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Potrivește automat clienții cu proprietățile potrivite, folosind inteligență artificială.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={genul}
          disabled={seIncarca}
          style={{
            border: "none",
            borderRadius: 12,
            background: seIncarca ? "var(--border-tertiary)" : "linear-gradient(135deg, #8b5cf6, #ec4899)",
            color: "#fff",
            padding: "12px 22px",
            fontWeight: 700,
            cursor: seIncarca ? "default" : "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: seIncarca ? "none" : "0 4px 16px rgba(139,92,246,0.3)",
          }}
        >
          <HiOutlineSparkles size={16} />
          {seIncarca ? "Se analizează..." : rezultate ? "Regenerează potrivirile" : "Generează potriviri AI"}
        </button>
      </header>

      {eroare && (
        <div style={{ ...card, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(254,226,226,0.7)" }}>
          <HiOutlineExclamationTriangle size={18} color="#b91c1c" />
          <span style={{ fontSize: 13, color: "#b91c1c" }}>{eroare}</span>
        </div>
      )}

      {!rezultate && !seIncarca && !eroare && (
        <div style={{ ...card, padding: 60, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HiOutlineArrowsRightLeft size={30} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>Descoperă cele mai bune potriviri</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 480, lineHeight: 1.5 }}>
            AI-ul analizează bugetul, tipul de proprietate și zona dorită de fiecare client și le asociază automat cu proprietățile disponibile din portofoliu.
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            {clientiActivi.length} clienți activi · {propDisponibile.length} proprietăți disponibile
          </div>
        </div>
      )}

      {seIncarca && (
        <div style={{ ...card, padding: 60, textAlign: "center" }}>
          <div style={{ display: "inline-block", width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>AI-ul potrivește clienții cu proprietățile...</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6 }}>Poate dura câteva secunde.</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {rezultate && !seIncarca && (
        <>
          <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>Clients analizați</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{Object.keys(rezultate).length}</div>
            </div>
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>Potriviri găsite</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#8b5cf6", lineHeight: 1 }}>{totalPotriviri}</div>
            </div>
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>Scor mediu</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#ec4899", lineHeight: 1 }}>{scorMediu}%</div>
            </div>
          </section>

          <div style={{ marginBottom: 16 }}>
            <div style={{ position: "relative", maxWidth: 360 }}>
              <HiOutlineMagnifyingGlass size={16} style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                placeholder="Caută client..."
                value={cauta}
                onChange={(e) => setCauta(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clientiCuRezultate.map((client) => {
              const matches = rezultate[String(client.id)] || [];
              if (matches.length === 0) return null;
              return (
                <div key={client.id} style={{ ...card, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {(client.nume || "?").trim().charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{client.nume}</div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        {[client.interes, client.zona, client.buget ? `Buget ${client.buget}` : ""].filter(Boolean).join(" · ") || "Fără detalii"}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", background: "rgba(139,92,246,0.12)", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                      {matches.length} potrivir{matches.length === 1 ? "e" : "i"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                    {matches.slice(0, 3).map((match, idx) => {
                      const p = propById(match.proprietateId);
                      if (!p) return null;
                      const sc = Number(match.score) || 0;
                      const c = scoreColor(sc);
                      const img = p.imagine || p.imagini?.[0] || FALLBACK_IMG;
                      return (
                        <div
                          key={idx}
                          style={{ borderRadius: 14, border: "1px solid var(--border-tertiary)", background: "var(--bg-primary)", overflow: "hidden", transition: "all 0.2s ease", cursor: "pointer" }}
                          onClick={() => window.open("/admin/proprietati", "_self")}
                          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                          <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
                            <img src={img} alt={p.titlu} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
                            <span style={{ position: "absolute", top: 8, right: 8, fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.fg }}>{sc}%</span>
                          </div>
                          <div style={{ padding: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.titlu}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6", marginBottom: 6 }}>
                              {Number(p.pretNumeric) ? `${Number(p.pretNumeric).toLocaleString("ro-RO")} €` : p.pret || "—"}
                              {p.tranzactie === "Închiriere" ? "/lună" : ""}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
                              <HiOutlineSparkles size={11} style={{ marginRight: 4, verticalAlign: "-1px", color: "#ec4899" }} />
                              {match.motiv}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {clientiCuRezultate.filter((c) => (rezultate[String(c.id)] || []).length > 0).length === 0 && (
            <div style={{ ...card, padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
              Nicio potrivire pentru filtrul curent.
            </div>
          )}
        </>
      )}
    </div>
  );
}
