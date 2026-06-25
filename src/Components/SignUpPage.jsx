import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a2e",
        padding: 20,
      }}
    >
      <SignUp routing="path" path="/register" signInUrl="/sign-in" afterSignUpUrl="/admin" />
    </div>
  );
}
