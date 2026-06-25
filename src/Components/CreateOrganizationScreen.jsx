import { CreateOrganization } from "@clerk/clerk-react";

export default function CreateOrganizationScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-tertiary)",
        fontFamily: "var(--font-sans)",
        padding: 20,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
            Creează-ți agenția
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Pentru a accesa dashboard-ul, ai nevoie de o agenție. Este primul pas pentru a începe să lucrezi cu Imobio.
          </p>
        </div>
        <CreateOrganization afterCreateOrganizationUrl="/admin" />
      </div>
    </div>
  );
}
