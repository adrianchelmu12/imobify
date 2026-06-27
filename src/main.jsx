import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";

import "./index.css";
import App from "./App";

(function curataDateFictive() {
  if (localStorage.getItem("imob-data-curatata-v2")) return;
  const filtreaza = (key, ids) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    const set = new Set(ids);
    const filtrat = data.filter((item) => !set.has(item.id));
    localStorage.setItem(key, JSON.stringify(filtrat));
  };
  filtreaza("imob-proprietati-v2", Array.from({ length: 21 }, (_, i) => 1000 + i));
  filtreaza("imob-clienti-v2", Array.from({ length: 28 }, (_, i) => 2000 + i));
  filtreaza("imob-programari-v2", Array.from({ length: 22 }, (_, i) => 3000 + i));
  filtreaza("imob-taskuri-v2", Array.from({ length: 15 }, (_, i) => 4000 + i));
  filtreaza("imob-proiecte-v2", Array.from({ length: 6 }, (_, i) => 5000 + i));
  filtreaza("imob-comisioane-v2", Array.from({ length: 14 }, (_, i) => 6000 + i));
  filtreaza("imob-campanii-v2", Array.from({ length: 8 }, (_, i) => 7000 + i));
  filtreaza("imob-agenti-v2", [1, 2, 3, 4]);
  filtreaza("imob-documente-v2", [8001, 8002, 8003]);

  (function curataNotificariDemo() {
    const raw = localStorage.getItem("imob-notificari-v2");
    if (!raw) return;
    const data = JSON.parse(raw);
    const demoKeys = new Set(["demo-1", "demo-2", "demo-3"]);
    const filtrat = data.filter((n) => !demoKeys.has(n.cheie));
    localStorage.setItem("imob-notificari-v2", JSON.stringify(filtrat));
  })();

  localStorage.setItem("imob-data-curatata-v2", "1");
})();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY lipsește din .env");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignInUrl="/admin"
      afterSignUpUrl="/admin"
      afterSignOutUrl="/sign-in"
      appearance={{
        elements: {
          organizationSwitcherPopoverCard: {
            background: "var(--secondary)",
            border: "0.5px solid rgba(255,255,255,0.1)",
          },
          organizationSwitcherPopoverMain: {
            color: "#fff",
          },
          organizationPreviewMainIdentifier: {
            color: "#fff",
          },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
