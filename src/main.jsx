import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";

import "./index.css";
import App from "./App";

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
