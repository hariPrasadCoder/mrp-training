"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hostname === "127.0.0.1") {
      const localUrl = new URL(window.location.href);
      localUrl.hostname = "localhost";
      window.location.replace(localUrl.toString());
    }
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });

      if (result.error) {
        setError(result.error.message ?? "Authentication failed. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "";
      setError(
        message.toLowerCase().includes("invalid origin")
          ? "This address is not allowed by Neon Auth. Open the app at http://localhost:3000 and try again."
          : "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-shell">
    <section className="auth-story">
      <button className="brand auth-brand"><span className="brand-mark"><span /><span /><span /></span><span>MYREAL<br />PRODUCT</span></button>
      <div><span className="eyebrow">Personal AI engineering</span><h1>Build it.<br />Prove it.<br />Ship it.</h1><p>Four weeks. One real product. A coach in your corner when the work gets difficult.</p></div>
      <div className="auth-blocks"><i /><i /><i /><i /></div>
    </section>
    <section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}>
      <span className="eyebrow">{mode === "sign-in" ? "Welcome back" : "Create your workspace"}</span>
      <h2>{mode === "sign-in" ? "Continue building." : "Start with a problem."}</h2>
      <p>{mode === "sign-in" ? "Sign in to see your next block." : "Your personalised plan begins with Week 0."}</p>
      {mode === "sign-up" && <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required /></label>}
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
      {error && <div className="auth-error">{error}</div>}
      <button className="primary-button auth-submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <>{mode === "sign-in" ? "Sign in" : "Create account"}<ArrowRight size={18} /></>}</button>
      <button type="button" className="auth-toggle" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(""); }}>{mode === "sign-in" ? "New learner? Create an account" : "Already have an account? Sign in"}</button>
    </form></section>
  </main>;
}
