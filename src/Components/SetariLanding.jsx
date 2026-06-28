import { useEffect, useState, useRef } from "react";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { HiOutlineGlobeAlt, HiOutlineSwatch, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlinePhoto } from "react-icons/hi2";

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
      const res = await fetch("/api/organizations", {
        headers: await fetchHeaders(),
      });
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

      if (!slug.trim()) {
        setError("Subdomeniul este obligatoriu.");
        setSaving(false);
        return;
      }

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
          phone,
          email,
          address,
          companyName,
          cui,
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
    return (
      <div style={{ padding: "32px 28px", maxWidth: 720 }}>
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Se încarcă...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 28px", maxWidth: 720 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <HiOutlineGlobeAlt size={28} color="var(--primary)" />
          Landing Page
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Configurează site-ul public de prezentare al agenției tale. Acesta va fi disponibil la{" "}
          <strong style={{ color: "var(--primary)" }}>{slug ? `${slug}.imobify.ro` : "numeagentie.imobify.ro"}</strong> și va afișa
          proprietățile publice din portofoliul tău.
        </p>
      </div>

      {error && (
        <div style={{
          ...card, padding: "14px 18px", marginBottom: 20,
          borderLeft: "3px solid var(--danger)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <HiOutlineExclamationCircle size={20} color="var(--danger)" />
          <span style={{ fontSize: 13.5, color: "var(--danger)", fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          ...card, padding: "14px 18px", marginBottom: 20,
          borderLeft: "3px solid var(--success)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <HiOutlineCheckCircle size={20} color="var(--success)" />
          <span style={{ fontSize: 13.5, color: "var(--success-dark)", fontWeight: 500 }}>{success}</span>
        </div>
      )}

      <div style={{ ...card, padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Activează Landing Page</h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Când este activat, site-ul public va fi vizibil la adresa subdomeniului configurat.
            </p>
          </div>
          <button
            type="button"
            style={{
              ...toggleStyle,
              background: landingEnabled ? "var(--success)" : "var(--border-secondary)",
            }}
            onClick={() => setLandingEnabled(!landingEnabled)}
          >
            <div style={toggleKnob(landingEnabled)} />
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
            <HiOutlinePhoto size={20} color="var(--primary)" />
            Logo agenție
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
            Încarcă logo-ul care va apărea pe landing page-ul tău.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo agenție"
                style={{
                  width: 64, height: 64, borderRadius: 12,
                  objectFit: "contain", border: "1px solid var(--border-primary)",
                  background: "#fff",
                }}
              />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 12,
                border: "2px dashed var(--border-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-tertiary)", background: "var(--bg-tertiary)",
              }}>
                <HiOutlinePhoto size={28} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLogoFile(file);
                    setLogoUrl(URL.createObjectURL(file));
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-primary)",
                  background: "var(--bg-primary)",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {uploadingLogo ? "Se încarcă..." : logoUrl ? "Schimbă logo-ul" : "Alege logo"}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => { setLogoUrl(""); setLogoFile(null); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--danger)",
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                  }}
                >
                  Șterge logo-ul
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="slug-input">
            Subdomeniu
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <input
              id="slug-input"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="numeagentie"
              style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: "none" }}
            />
            <span style={{
              padding: "10px 14px",
              borderRadius: "0 var(--radius-md) var(--radius-md) 0",
              border: "1px solid var(--border-primary)",
              borderLeft: "none",
              background: "var(--bg-tertiary)",
              fontSize: 14,
              color: "var(--text-muted)",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}>
              .imobify.ro
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 6 }}>
            Doar litere mici, cifre și liniuțe. Va deveni: <strong>{slug || "numeagentie"}.imobify.ro</strong>
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
            <HiOutlineSwatch size={20} color="var(--primary)" />
            Paletă de culori
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 18px" }}>
            Alege culorile care definesc identitatea vizuală a landing page-ului tău.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={labelStyle}>Culoare principală</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: 42, height: 42, borderRadius: "var(--radius-sm)", border: "2px solid var(--border-primary)", cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ ...inputStyle, width: 120, fontFamily: "monospace" }}
                />
                <div style={{
                  width: 100, height: 36, borderRadius: "var(--radius-sm)",
                  background: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`,
                }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Culoare secundară</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{ width: 42, height: 42, borderRadius: "var(--radius-sm)", border: "2px solid var(--border-primary)", cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{ ...inputStyle, width: 120, fontFamily: "monospace" }}
                />
                <div style={{
                  width: 100, height: 36, borderRadius: "var(--radius-sm)",
                  background: secondaryColor,
                  boxShadow: `0 4px 12px ${secondaryColor}40`,
                }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Previzualizare:</span>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <div style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", background: primaryColor, color: "#fff", fontSize: 13, fontWeight: 600 }}>
                Buton principal
              </div>
              <div style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", border: `2px solid ${secondaryColor}`, color: secondaryColor, fontSize: 13, fontWeight: 600 }}>
                Buton secundar
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
             Contact
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 16px" }}>
            Datele de contact apar în footer-ul și pagina "Despre noi" a landing page-ului.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0740 000 000"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@agentie.ro"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Adresă</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Strada Exemplu, Nr. 1, Iași"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
             Date fiscale
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 16px" }}>
            Apar doar în subsolul landing page-ului (footer).
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nume firmă</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="SC Agentia SRL"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>CUI</label>
              <input
                type="text"
                value={cui}
                onChange={(e) => setCui(e.target.value)}
                placeholder="RO 12345678"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
             Pagina "Despre noi"
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 16px" }}>
            Informațiile care apar pe pagina de prezentare a agenției tale.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Descriere agenție</label>
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Descrie agenția ta: experiență, valori, servicii oferite..."
              rows={5}
              style={{ ...inputStyle, resize: "vertical", minHeight: 100, fontFamily: "inherit" }}
            />
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
              Acest text va apărea în secțiunea "Despre noi" a landing page-ului.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Ani de experiență</label>
            <input
              type="text"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="ex: 15"
              style={{ ...inputStyle, width: 100 }}
            />
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
              Apare în dreptul statisticii "Ani experiență" pe pagina de prezentare.
            </p>
          </div>
        </div>

        <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-primary)" }}>
          <button
            type="button"
            style={btnPrimary}
            onClick={handleSave}
            disabled={saving}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
          >
            {saving ? "Se salvează..." : "Salvează setările"}
          </button>
        </div>
      </div>
    </div>
  );
}
