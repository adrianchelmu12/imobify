import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useUser, useAuth, SignOutButton, useOrganizationList, useOrganization } from "@clerk/clerk-react";
import { setTokenGetter } from "../lib/apiStore";
import { syncAllStores } from "../data/stores";
import { syncAgenti } from "../data/agentiStorage";
import { fetchMyRole, isAdmin, isManagerOrAdmin } from "../lib/roleStore";
import CreateOrganizationScreen from "./CreateOrganizationScreen";
import NotificationBell from "./NotificationBell";
import {
  HiOutlineSquares2X2,
  HiOutlinePlusCircle,
  HiOutlineHomeModern,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentList,
  HiOutlineEye,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineBarsArrowDown,
  HiOutlineDocumentDuplicate,
  HiOutlineBanknotes,
  HiOutlineMegaphone,
  HiOutlineSparkles,
  HiOutlinePresentationChartBar,
  HiOutlineChevronDown,
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineGlobeAlt,
} from "react-icons/hi2";

const NAV_SECTIONS = [
  {
    label: "Activitate",
    items: [
      { label: "Clienți", icon: HiOutlineUserGroup, href: "/admin/clienti" },
      { label: "Pipeline", icon: HiOutlineBarsArrowDown, href: "/admin/pipeline" },
      { label: "Programări", icon: HiOutlineCalendarDays, href: "/admin/programari" },
    ],
  },
  {
    label: "Proprietăți",
    items: [
      { label: "Proprietăți", icon: HiOutlineHomeModern, href: "/admin/proprietati" },
      { label: "Portofoliu", icon: HiOutlineEye, href: "/admin/portofoliu" },
      { label: "Proiecte rezidențiale", icon: HiOutlineBuildingOffice2, href: "/admin/proiecte" },
      { label: "Hartă", icon: HiOutlineMapPin, href: "/admin/harta" },
    ],
  },
  {
    label: "Vânzări",
    items: [
      { label: "Documente", icon: HiOutlineDocumentDuplicate, href: "/admin/documente" },
      { label: "Comisioane", icon: HiOutlineBanknotes, href: "/admin/comisioane" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Campanii", icon: HiOutlineMegaphone, href: "/admin/campanii" },
    ],
  },
  {
    label: "Productivitate",
    items: [
      { label: "Task-uri", icon: HiOutlineClipboardDocumentList, href: "/admin/taskuri" },
      { label: "AI Assistant", icon: HiOutlineSparkles, href: "/admin/ai-assistant" },
    ],
  },
  {
    label: "Analiză",
    items: [
      { label: "Rapoarte", icon: HiOutlinePresentationChartBar, href: "/admin/rapoarte" },
    ],
  },
  {
    label: "Configurare",
    items: [
      { label: "Landing Page", icon: HiOutlineGlobeAlt, href: "/admin/setari-landing" },
    ],
  },
];

const linkStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: isActive ? 600 : 450,
  textDecoration: "none",
  color: isActive ? "#e2e8ff" : "rgba(218, 224, 240, 0.55)",
  background: isActive ? "rgba(99,102,241,0.18)" : "transparent",
  border: isActive ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  flexShrink: 0,
});

function Sidebar({ mobileOpen, setMobileOpen, isMobile }) {
  const [collapsed, setCollapsed] = useState({});
  const [roleAdmin, setRoleAdmin] = useState(() => isAdmin());
  const [roleManagerOrAdmin, setRoleManagerOrAdmin] = useState(() => isManagerOrAdmin());
  const { user } = useUser();
  const { organization } = useOrganization();
  const orgMeta = organization?.publicMetadata || {};
  const agencyName = orgMeta?.agencyName || organization?.name || "Agenție";
  const agencyLogo = organization?.imageUrl || orgMeta?.agencyLogo || null;

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleAdmin(isAdmin());
      setRoleManagerOrAdmin(isManagerOrAdmin());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (label) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navContent = (
    <>
      <NavLink to="/admin" end onClick={() => { if (isMobile) setMobileOpen(false); }} style={linkStyle}>
        <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <HiOutlineSquares2X2 size={19} />
        </span>
        <span style={{ flex: 1 }}>Prezentare generală</span>
      </NavLink>

      <NavLink to="/admin/adauga-proprietate" onClick={() => { if (isMobile) setMobileOpen(false); }} style={linkStyle}>
        <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <HiOutlinePlusCircle size={19} />
        </span>
        <span style={{ flex: 1 }}>Adaugă proprietate</span>
      </NavLink>

      {roleAdmin && (
        <NavLink to="/admin/agenti" onClick={() => { if (isMobile) setMobileOpen(false); }} style={linkStyle}>
          <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <HiOutlineUserCircle size={19} />
          </span>
          <span style={{ flex: 1 }}>Echipă</span>
        </NavLink>
      )}

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 8px" }} />

      {NAV_SECTIONS.filter(s => {
        if (!roleManagerOrAdmin && (s.label === "Marketing" || s.label === "Analiză")) return false;
        return true;
      }).map((section) => (
        <div key={section.label}>
          <button
            type="button"
            onClick={() => toggleSection(section.label)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 12px 6px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(218,224,240,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            <span style={{ flex: 1, textAlign: "left" }}>{section.label}</span>
            <HiOutlineChevronDown
              size={11}
              style={{
                transform: collapsed[section.label] ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
            />
          </button>
          {!collapsed[section.label] && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => { if (isMobile) setMobileOpen(false); }}
                  style={linkStyle}
                >
                  <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon size={19} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );

  return (
    <aside
      style={{
        width: 250,
        maxWidth: "82vw",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: isMobile ? "fixed" : "sticky",
        left: isMobile ? (mobileOpen ? 0 : -260) : 0,
        top: 0,
        alignSelf: "flex-start",
        zIndex: 1001,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.98) 50%, rgba(15,23,42,0.99) 100%)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: isMobile && mobileOpen
          ? "0 25px 60px rgba(0,0,0,0.5)"
          : "0 0 0 1px rgba(255,255,255,0.03), 4px 0 24px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />

    <div style={{ position: "absolute", top: 24, right: 14, zIndex: 5 }}>
      <NotificationBell position="top" />
    </div>

    <div style={{ padding: "28px 20px 22px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {agencyLogo ? (
            <img
              src={agencyLogo}
              alt={agencyName}
              style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 16px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.15)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 145 }}>
              {agencyName}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(99,102,241,0.7)", letterSpacing: "0.8px", textTransform: "uppercase", marginTop: 2 }}>
              Imobify CRM
            </div>
          </div>
          {isMobile && (
            <button type="button" onClick={() => setMobileOpen(false)}
              style={{
                border: "none",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                width: 30,
                height: 30,
                borderRadius: 8,
                fontSize: 18,
                cursor: "pointer",
                lineHeight: 1,
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              ×
            </button>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "2px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, position: "relative", zIndex: 1 }}>
        {navContent}
      </nav>

      <div style={{ padding: "12px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
        {user && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={user.imageUrl}
                alt={user.fullName || user.username || ""}
                style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.fullName || user.username || "Utilizator"}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.primaryEmailAddress?.emailAddress || ""}
                </div>
              </div>
            </div>
            <SignOutButton>
              <button
                type="button"
                style={{
                  width: "100%",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  padding: "8px 0",
                  borderRadius: 10,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                  e.currentTarget.style.color = "#fca5a5";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <HiOutlineArrowLeftOnRectangle size={14} />
                Deconectare
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 900;
  });
  const { getToken } = useAuth();
  const { isLoaded: orgsLoaded, userMemberships, setActive } = useOrganizationList({ userMemberships: true });
  const { user } = useUser();
  const orgAutoSelected = useRef(false);

  async function syncOrgToDb(orgId, orgName) {
    try {
      const token = await getToken({ template: "api" });
      await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: orgName,
          userName: user?.fullName || user?.username || "",
          userEmail: user?.primaryEmailAddress?.emailAddress || "",
        }),
      });
    } catch (e) {
      console.warn("Sync org to DB failed:", e);
    }
  }

  useEffect(() => {
    if (orgsLoaded && userMemberships?.data?.length > 0 && !orgAutoSelected.current) {
      orgAutoSelected.current = true;
      const firstOrg = userMemberships.data[0].organization;
      setActive({ organization: firstOrg.id }).then(() => {
        syncOrgToDb(firstOrg.id, firstOrg.name);
        syncAllStores();
        syncAgenti();
      }).catch(() => {});
    }
  }, [orgsLoaded, userMemberships, setActive]);

  useEffect(() => {
    setTokenGetter(() => getToken({ template: "api" }));
    syncAllStores();
    syncAgenti();
    fetchMyRole(() => getToken({ template: "api" }));
  }, [getToken]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (orgsLoaded && userMemberships?.data?.length === 0) {
    return <CreateOrganizationScreen />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)", position: "relative" }}>
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
          }}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isMobile={isMobile} />

      <div style={{ flex: 1, minWidth: 0, minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        {isMobile && (
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              position: "sticky",
              top: 0,
              zIndex: 50,
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              style={{
                border: "none",
                background: "rgba(0,0,0,0.04)",
                fontSize: 18,
                cursor: "pointer",
                color: "var(--text-primary)",
                width: 38,
                height: 38,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ☰
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Dashboard</div>
            </div>
            <div style={{ width: 38 }} />
          </div>
        )}


        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
