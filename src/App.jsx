import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useClerk } from "@clerk/clerk-react";

import SignUpPage from "./Components/SignUpPage";
import Layout from "./Components/Layout";
import PrezentareGenerala from "./Components/PrezentareGenerala";
import AdaugaProprietate from "./Components/AdaugaProprietate";
import Agenti from "./Components/Agenti";
import AdminProprietati from "./Components/AdminProprietati";
import Portofoliu from "./Components/Portofoliu";
import Proiecte from "./Components/Proiecte";
import Harta from "./Components/Harta";
import Clienti from "./Components/Clienti";
import Pipeline from "./Components/Pipeline";
import Programari from "./Components/Programari";
import Documente from "./Components/Documente";
import Comisioane from "./Components/Comisioane";
import Campanii from "./Components/Campanii";
import Taskuri from "./Components/Taskuri";
import AiAssistant from "./Components/AiAssistant";
import Rapoarte from "./Components/Rapoarte";
import SetariLanding from "./Components/SetariLanding";

function ProtectedRoute({ children }) {
  const { loaded } = useClerk();

  if (!loaded) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0f172a", fontFamily: "var(--font-sans)",
      }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Se încarcă...</div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
      <SignedIn>
        {children}
      </SignedIn>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in/*" element={<RedirectToSignIn redirectUrl="/admin" />} />
        <Route path="/sign-up/*" element={<Navigate to="/sign-in" replace />} />
        <Route path="/register/*" element={<SignUpPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/admin" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PrezentareGenerala />} />
          <Route path="adauga-proprietate" element={<AdaugaProprietate />} />
          <Route path="agenti" element={<Agenti />} />
          <Route path="proprietati" element={<AdminProprietati />} />
          <Route path="portofoliu" element={<Portofoliu />} />
          <Route path="proiecte" element={<Proiecte />} />
          <Route path="harta" element={<Harta />} />
          <Route path="clienti" element={<Clienti />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="programari" element={<Programari />} />
          <Route path="documente" element={<Documente />} />
          <Route path="comisioane" element={<Comisioane />} />
          <Route path="campanii" element={<Campanii />} />
          <Route path="taskuri" element={<Taskuri />} />
          <Route path="ai-assistant" element={<AiAssistant />} />
          <Route path="rapoarte" element={<Rapoarte />} />
          <Route path="setari-landing" element={<SetariLanding />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
