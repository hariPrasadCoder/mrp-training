"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function AuthScreen({
  resetToken = "",
  resetError = "",
  accessError = false,
}: {
  resetToken?: string;
  resetError?: string;
  accessError?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "forgot" | "reset">(
    resetToken ? "reset" : "sign-in",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    accessError
      ? "This cohort is invitation-only. Sign in with the email address on your invitation."
      : "",
  );
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
      if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/auth/sign-in`,
        });
        if (result.error) {
          setError(result.error.message ?? "Password reset is not available.");
          return;
        }
        setError("If that account exists, a reset link has been sent.");
        return;
      }
      if (mode === "reset") {
        const result = await authClient.resetPassword({
          newPassword: password,
          token: resetToken,
        });
        if (result.error) {
          setError(
            result.error.message ?? "This reset link is invalid or expired.",
          );
          return;
        }
        setMode("sign-in");
        setPassword("");
        setError("Password updated. You can sign in now.");
        return;
      }
      if (mode === "sign-up") {
        const invitationResponse = await fetch("/api/auth/invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const invitation = await invitationResponse.json().catch(() => null);
        if (!invitationResponse.ok || !invitation?.invited) {
          setError(
            invitation?.error ??
              "This cohort is invitation-only. Use the email address on your invitation.",
          );
          return;
        }
      }

      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name });

      if (result.error) {
        setError(
          result.error.message ?? "Authentication failed. Please try again.",
        );
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

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="brand auth-brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>
            MYREAL
            <br />
            PRODUCT
          </span>
        </div>
        <div>
          <span className="eyebrow">Personal AI engineering</span>
          <h1>
            Build it.
            <br />
            Prove it.
            <br />
            Ship it.
          </h1>
          <p>
            Four weeks. One real product. A coach in your corner when the work
            gets difficult.
          </p>
        </div>
        <div className="auth-blocks">
          <i />
          <i />
          <i />
          <i />
        </div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">
            {mode === "sign-in"
              ? "Welcome back"
              : mode === "sign-up"
                ? "Create your workspace"
                : "Account recovery"}
          </span>
          <h2>
            {mode === "sign-in"
              ? "Continue building."
              : mode === "sign-up"
                ? "Start with a problem."
                : mode === "forgot"
                  ? "Reset your password."
                  : "Choose a new password."}
          </h2>
          <p>
            {mode === "sign-in"
              ? "Sign in to see your next block."
              : mode === "sign-up"
                ? "Use the email address on your invitation. Your plan begins with Week 0."
                : mode === "forgot"
                  ? "We will email you a secure reset link."
                  : "Use at least eight characters."}
          </p>
          {resetError && mode === "reset" && (
            <div className="auth-error" role="alert">
              This reset link is invalid or expired.
            </div>
          )}
          {mode === "sign-up" && (
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>
          )}
          {mode !== "reset" && (
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
          )}
          {mode !== "forgot" && (
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>
          )}
          {error && (
            <div className="auth-error" role="status" aria-live="polite">
              {error}
            </div>
          )}
          <button
            className="primary-button auth-submit"
            disabled={loading || Boolean(resetError && mode === "reset")}
          >
            {loading ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <>
                {mode === "sign-in"
                  ? "Sign in"
                  : mode === "sign-up"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Update password"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
          {mode === "sign-in" && (
            <button
              type="button"
              className="auth-toggle"
              onClick={() => {
                setMode("forgot");
                setError("");
              }}
            >
              Forgot password?
            </button>
          )}
          <button
            type="button"
            className="auth-toggle"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setError("");
            }}
          >
            {mode === "sign-in"
              ? "Have an invitation? Create an account"
              : "Back to sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
