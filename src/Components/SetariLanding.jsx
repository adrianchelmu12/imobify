import { useEffect, useState, useRef } from "react";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { HiOutlineGlobeAlt, HiOutlineSwatch, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlinePhoto, HiOutlinePhone, HiOutlineMapPin } from "react-icons/hi2";

const card = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "var(--shadow-card)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-primary)",
  background: "white",
  fontSize: 14,
  color: "var(--text-primary)",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

const btnPrimary = {
  background: "linear-gradient(135deg, var(--primary), var(--accent))",
  border: "none",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "var(--radius-md)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  transition: "all 0.2s ease",
  boxShadow: "var(--shadow-md)",
};

const toggleStyle = {
  width: 48,
  height: 26,
  borderRadius: 13,
  border: "none",
  cursor: "pointer",
  position: "relative",
  transition: "background 0.25s ease",
  flexShrink: 0,
};

const toggleKnob = (on) => ({
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#fff",
  position: "absolute",
  top: 3,
  left: on ? 25 : 3,
  transition: "left 0.25s ease",
  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
});

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
  paddingBottom: 12,
  borderBottom: "1px solid var(--border-primary)",
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: 700,
  color: "var(--text-primary)",
  margin: 0,
};

export default function SetariLanding() {
  const { getToken } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [slug, setSlug] = useState("");
  const [landingEnabled, setLandingEnabled] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#f59e0b");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cui, setCui] = useState("");
  const fileInputRef = useRef(null);

  async function fetchHeaders() {
    const token = await getToken({ template: "api" });
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/organizations", { headers: await fetchHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSlug(data.slug || "");
          setLandingEnabled(data.landingEnabled || false);
          setPrimaryColor(data.landingPrimaryColor || "#2563eb");
          setSecondaryColor(data.landingSecondaryColor || "#f59e0b");
          setLogoUrl(data.logoUrl || organization?.imageUrl || "");
          setAboutText(data.landingAboutText || "");
          setExperienceYears(data.landingExperienceYears || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setAddress(data.address || "");
          setCompanyName(data.companyName || "");
          setCui(data.cui || "");
        }
      }
    } catch (e) {
      console.error("Eroare la încărcarea setărilor:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orgLoaded && organization) {
      loadSettings();
    }
  }, [orgLoaded, organization]);

  function readFileAsBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      if (!slug.trim()) { setError("Subdomeniul este obligatoriu."); setSaving(false); return; }

      let finalLogoUrl = logoUrl;
      if (logoFile) {
        setUploadingLogo(true);
        finalLogoUrl = await readFileAsBase64(logoFile);
        if (finalLogoUrl) setLogoUrl(finalLogoUrl);
        setUploadingLogo(false);
      }

      const res = await fetch("/api/organizations", {
        method: "PUT",
        headers: await fetchHeaders(),
        body: JSON.stringify({
          slug: slug.trim().toLowerCase(),
          landingEnabled,
          landingPrimaryColor: primaryColor,
          landingSecondaryColor: secondaryColor,
          landingAboutText: aboutText,
          landingExperienceYears: experienceYears,
          phone, email, address, companyName, cui,
          logoUrl: finalLogoUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Eroare la salvare.");
      } else {
        setLogoFile(null);
        setSuccess("Setările au fost salvate cu succes.");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e) {
      setError("Eroare de conexiune.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "40px", fontSize: 14, color: "var(--text-muted)" }}>Se încarcă...</div>;
  }

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <HiOutlineGlobeAlt size={28} color="var(--primary)" />
          Landing Page
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Configurează site-ul public al agenției. Disponibil la{" "}
          <strong style={{ color: "var(--primary)" }}>{slug ? `${slug}.imobify.ro` : "numeagentie.imobify.ro"}</strong>
        </p>
      </div>

      {error && (
        <div style={{ ...card, padding: "14px 18px", marginBottom: 20, borderLeft: "3px solid var(--danger)", display: "flex", alignItems: "center", gap: 10 }}>
          <HiOutlineExclamationCircle size={20} color="var(--danger)" />
          <span style={{ fontSize: 13.5, color: "var(--danger)", fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ ...card, padding: "14px 18px", marginBottom: 20, borderLeft: "3px solid var(--success)", display: "flex", alignItems: "center", gap: 10 }}>
          <HiOutlineCheckCircle size={20} color="var(--success)" />
          <span style={{ fontSize: 13.5, color: "var(--success-dark)", fontWeight: 500 }}>{success}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* --- Activare --- */}
        <div style={{ ...card, padding: 24 }}>
          <div style={sectionHeader}>
            <HiOutlineGlobeAlt size={20} color="var(--primary)" />
            <h3 style={sectionTitle}>Activare</h3>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Site public activ</div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>Dezactivează dacă nu vrei încă să fie vizibil.</p>
            </div>
            <button type="button" style={{ ...toggleStyle, background: landingEnabled ? "var(--success)" : "var(--border-secondary)" }} onClick={() => setLandingEnabled(!landingEnabled)}>
              <div style={toggleKnob(landingEnabled)} />
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Subdomeniu</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="numeagentie" style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: "none" }} />
              <span style={{ padding: "10px 14px", borderRadius: "0 var(--radius-md) var(--radius-md) 0", border: "1px solid var(--border-primary)", borderLeft: "none", background: "var(--bg-tertiary)", fontSize: 14, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>.imobify.ro</span>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 6 }}>Doar litere mici, cifre și liniuțe.</p>
          </div>
        </div>

        {/* --- Branding --- */}
        <div style={{ ...card, padding: 24 }}>
          <div style={sectionHeader}>
            <HiOutlinePhoto size={20} color="var(--primary)" />
            <h3 style={sectionTitle}>Branding</h3>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "contain", border: "1px solid var(--border-primary)", background: "#fff" }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 12, border: "2px dashed var(--border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", background: "var(--bg-tertiary)" }}>
                  <HiOutlinePhoto size={24} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) { setLogoFile(file); setLogoUrl(URL.createObjectURL(file)); } }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo} style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  {uploadingLogo ? "Se încarcă..." : logoUrl ? "Schimbă" : "Alege logo"}
                </button>
                {logoUrl && <button type="button" onClick={() => { setLogoUrl(""); setLogoFile(null); }} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 12, cursor: "pointer", textAlign: "left", padding: 0 }}>Șterge</button>}
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 12px" }}>
            <HiOutlineSwatch size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Paletă de culori
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Culoare principală</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", border: "2px solid var(--border-primary)", cursor: "pointer", padding: 0 }} />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ ...inputStyle, width: 110, fontFamily: "monospace" }} />
                <div style={{ width: 60, height: 30, borderRadius: 6, background: primaryColor, boxShadow: `0 4px 12px ${primaryColor}40` }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Culoare secundară</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", border: "2px solid var(--border-primary)", cursor: "pointer", padding: 0 }} />
                <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ ...inputStyle, width: 110, fontFamily: "monospace" }} />
                <div style={{ width: 60, height: 30, borderRadius: 6, background: secondaryColor, boxShadow: `0 4px 12px ${secondaryColor}40` }} />
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Previzualizare:</span>
            <div style={{ padding: "6px 14px", borderRadius: 999, background: primaryColor, color: "#fff", fontSize: 12, fontWeight: 700 }}>Buton</div>
            <div style={{ padding: "6px 14px", borderRadius: 999, border: `2px solid ${secondaryColor}`, color: secondaryColor, fontSize: 12, fontWeight: 700 }}>Buton</div>
          </div>
        </div>

        {/* --- Contact --- */}
        <div style={{ ...card, padding: 24 }}>
          <div style={sectionHeader}>
            <HiOutlinePhone size={20} color="var(--primary)" />
            <h3 style={sectionTitle}>Contact</h3>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Apar în footer, pagina Despre și pe cardul de contact al landing page-ului.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><label style={labelStyle}>Telefon</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0740 000 000" style={inputStyle} /></div>
            <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@agentie.ro" style={inputStyle} /></div>
          </div>
          <div>
            <label style={labelStyle}>
              <HiOutlineMapPin size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
              Adresă agenție (apare și pe harta Google Maps)
            </label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ex: Strada Lăpușneanu, Nr. 12, Iași" style={inputStyle} />
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>Această adresă va apărea pe harta din pagina "Despre noi" și în footer.</p>
          </div>
        </div>

        {/* --- Despre noi --- */}
        <div style={{ ...card, padding: 24 }}>
          <div style={sectionHeader}>
            <span style={{ fontSize: 18 }}>📝</span>
            <h3 style={sectionTitle}>Pagina „Despre noi"</h3>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Descriere agenție</label>
            <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} placeholder="Descrie agenția ta: experiență, valori, servicii..." rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 80, fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={labelStyle}>Ani de experiență</label>
            <input type="text" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="ex: 15" style={{ ...inputStyle, width: 100 }} />
          </div>
        </div>

        {/* --- Date fiscale --- */}
        <div style={{ ...card, padding: 24 }}>
          <div style={sectionHeader}>
            <span style={{ fontSize: 18 }}>🏢</span>
            <h3 style={sectionTitle}>Date fiscale</h3>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px" }}>Apar doar în subsolul landing page-ului.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Nume firmă</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="SC Agentia SRL" style={inputStyle} /></div>
            <div><label style={labelStyle}>CUI</label><input type="text" value={cui} onChange={(e) => setCui(e.target.value)} placeholder="RO 12345678" style={inputStyle} /></div>
          </div>
        </div>

        {/* --- Salvare --- */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" style={btnPrimary} onClick={handleSave} disabled={saving}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}>
            {saving ? "Se salvează..." : "Salvează setările"}
          </button>
        </div>

      </div>
    </div>
  );
}
