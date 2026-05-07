"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function IconBot() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="3" />
      <path d="M12 8V5" />
      <circle cx="12" cy="3.5" r="1.5" />
      <circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <path d="M9 18.5q3 1.5 6 0" />
    </svg>
  );
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient gradients */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 70% 55% at 15% 15%, rgba(240,160,32,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 55% 45% at 85% 85%, rgba(45,212,191,0.05) 0%, transparent 55%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Grid pattern */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-fade-up"
        style={{ width: "100%", maxWidth: "380px", position: "relative" }}
      >
        {/* Logotipo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
          >
            <IconBot />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1875rem",
                fontWeight: 700,
                color: "var(--text-1)",
                lineHeight: 1.2,
              }}
            >
              Agente IA
            </h1>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: "2px", letterSpacing: "0.06em" }}>
              WHATSAPP AUTOMATION
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px var(--border)",
          }}
        >
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--text-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "22px",
            }}
          >
            Acesso ao painel
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--text-2)",
                  marginBottom: "7px",
                  letterSpacing: "0.02em",
                }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="field-input"
                style={{ letterSpacing: "0.15em" }}
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--error)",
                  background: "var(--error-dim)",
                  border: "1px solid rgba(248,113,113,0.15)",
                  borderRadius: "8px",
                  padding: "9px 13px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: "12px", width: "100%", marginTop: "4px" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.6875rem", color: "var(--text-3)", marginTop: "20px" }}>
          GPT-4.1-mini · Evolution API · v1.0
        </p>
      </div>
    </div>
  );
}
