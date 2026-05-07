"use client";

import { useEffect, useState } from "react";

interface Config {
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  historyLimit: number;
  enabled: boolean;
  allowedPhones: string;
  evolutionUrl: string;
  evolutionApiKey: string;
  instanceId: string;
  aiProvider: string;
  openaiApiKey: string;
  openaiModel: string;
  groqApiKey: string;
  groqModel: string;
}

const DEFAULT: Config = {
  name: "Assistente IA",
  systemPrompt: "Você é um assistente prestativo e amigável.",
  temperature: 0.7,
  maxTokens: 1024,
  historyLimit: 10,
  enabled: true,
  allowedPhones: "",
  evolutionUrl: "",
  evolutionApiKey: "",
  instanceId: "",
  aiProvider: "openai",
  openaiApiKey: "",
  openaiModel: "gpt-4.1-mini",
  groqApiKey: "",
  groqModel: "llama-3.3-70b-versatile",
};

const OPENAI_MODELS = [
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini (recomendado)" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
];

const GROQ_MODELS = [
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (mais rápido)" },
  { value: "gemma2-9b-it", label: "Gemma 2 9B" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B (contexto longo)" },
];

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          background: "var(--surface-2)",
        }}
      >
        <span style={{ color: "var(--accent)", flexShrink: 0 }}>{icon}</span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-1)",
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "var(--text-2)",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: "-2px" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function IconBot() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="3" />
      <path d="M12 8V5" /><circle cx="12" cy="3.5" r="1.5" />
      <circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconBrain() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.66" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.66" />
    </svg>
  );
}

function IconSmartphone() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d);
        setLoading(false);
      });
  }, []);

  function set(key: keyof Config, value: string | number | boolean) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function copyWebhook() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/api/webhook` : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-3)",
          fontSize: "0.875rem",
        }}
      >
        Carregando configurações...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "var(--text-1)",
            }}
          >
            Configurações do Agente
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-3)", marginTop: "4px" }}>
            Defina o comportamento e a integração com o WhatsApp
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Identidade */}
          <SectionCard title="Identidade do Agente" icon={<IconBot />}>
            <Field label="Nome do Agente">
              <input
                type="text"
                value={config.name}
                onChange={(e) => set("name", e.target.value)}
                className="field-input"
                placeholder="Ex: Assistente Vendas"
              />
            </Field>
            <Field
              label="Instrução do Sistema (System Prompt)"
              hint="Define o comportamento, personalidade e escopo do agente."
            >
              <textarea
                value={config.systemPrompt}
                onChange={(e) => set("systemPrompt", e.target.value)}
                className="field-input"
                style={{ resize: "none", height: "120px" }}
                placeholder="Você é um assistente de vendas especializado em..."
              />
            </Field>
          </SectionCard>

          {/* Provedor de IA */}
          <SectionCard title="Provedor de IA" icon={<IconBrain />}>
            <Field label="Provedor" hint="OpenAI é pago; Groq oferece plano gratuito.">
              <div style={{ display: "flex", gap: "10px" }}>
                {(["openai", "groq"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("aiProvider", p)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: `1.5px solid ${config.aiProvider === p ? "var(--accent)" : "var(--border)"}`,
                      background: config.aiProvider === p ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--surface-2)",
                      color: config.aiProvider === p ? "var(--accent-text)" : "var(--text-2)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      transition: "all 0.15s",
                    }}
                  >
                    {p === "openai" ? "OpenAI" : "Groq (grátis)"}
                  </button>
                ))}
              </div>
            </Field>

            {config.aiProvider === "openai" && (
              <>
                <Field label="OpenAI API Key" hint="Obtenha em platform.openai.com/api-keys">
                  <input
                    type="password"
                    value={config.openaiApiKey}
                    onChange={(e) => set("openaiApiKey", e.target.value)}
                    className="field-input"
                    placeholder="sk-..."
                  />
                </Field>
                <Field label="Modelo OpenAI">
                  <select
                    value={config.openaiModel}
                    onChange={(e) => set("openaiModel", e.target.value)}
                    className="field-input"
                  >
                    {OPENAI_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {config.aiProvider === "groq" && (
              <>
                <Field label="Groq API Key" hint="Obtenha em console.groq.com — plano gratuito disponível.">
                  <input
                    type="password"
                    value={config.groqApiKey}
                    onChange={(e) => set("groqApiKey", e.target.value)}
                    className="field-input"
                    placeholder="gsk_..."
                  />
                </Field>
                <Field label="Modelo Groq">
                  <select
                    value={config.groqModel}
                    onChange={(e) => set("groqModel", e.target.value)}
                    className="field-input"
                  >
                    {GROQ_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}
          </SectionCard>

          {/* Modelo */}
          <SectionCard title="Parâmetros do Modelo" icon={<IconBrain />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Temperatura" hint={`Criatividade: ${config.temperature}`}>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => set("temperature", parseFloat(e.target.value))}
                  style={{ marginTop: "4px" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.6875rem",
                    color: "var(--text-3)",
                    marginTop: "4px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span>Preciso</span>
                  <span>Criativo</span>
                </div>
              </Field>

              <Field label="Máx. Tokens" hint="Tamanho máximo da resposta">
                <input
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => set("maxTokens", parseInt(e.target.value))}
                  min={64}
                  max={4096}
                  className="field-input"
                />
              </Field>

              <Field label="Limite de Histórico" hint="Pares de mensagens enviados como contexto">
                <input
                  type="number"
                  value={config.historyLimit}
                  onChange={(e) => set("historyLimit", parseInt(e.target.value))}
                  min={1}
                  max={50}
                  className="field-input"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Controle */}
          <SectionCard title="Controle do Agente" icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z" /><path d="M8 12h8M12 8v8" />
            </svg>
          }>
            {/* Toggle ativo/inativo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-1)" }}>
                  Agente {config.enabled ? "ativo" : "pausado"}
                </p>
                <p style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: "2px" }}>
                  {config.enabled
                    ? "Respondendo mensagens no WhatsApp"
                    : "Recebendo mensagens mas sem responder"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("enabled", !config.enabled)}
                style={{
                  width: "48px",
                  height: "26px",
                  borderRadius: "13px",
                  background: config.enabled ? "var(--accent)" : "var(--surface-3)",
                  border: `1px solid ${config.enabled ? "var(--accent)" : "var(--border-2)"}`,
                  cursor: "pointer",
                  position: "relative",
                  flexShrink: 0,
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: config.enabled ? "24px" : "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            </div>

            {/* Filtro de número */}
            <Field
              label="Filtro de números (opcional)"
              hint="Só responde esses números. Separe por vírgula. Vazio = responde todos."
            >
              <input
                type="text"
                value={config.allowedPhones}
                onChange={(e) => set("allowedPhones", e.target.value)}
                className="field-input"
                placeholder="5511999990000, 5521988880000"
              />
            </Field>
          </SectionCard>

          {/* Evolution API */}
          <SectionCard title="Integração WhatsApp (Evolution API)" icon={<IconSmartphone />}>
            <Field label="URL da Evolution API" hint="Ex: https://evolution.seudominio.com">
              <input
                type="url"
                value={config.evolutionUrl}
                onChange={(e) => set("evolutionUrl", e.target.value)}
                className="field-input"
                placeholder="https://evolution.seudominio.com"
              />
            </Field>
            <Field label="API Key">
              <input
                type="password"
                value={config.evolutionApiKey}
                onChange={(e) => set("evolutionApiKey", e.target.value)}
                className="field-input"
                placeholder="sua-api-key"
              />
            </Field>
            <Field label="Instance ID" hint="ID da instância WhatsApp no Evolution API">
              <input
                type="text"
                value={config.instanceId}
                onChange={(e) => set("instanceId", e.target.value)}
                className="field-input"
                placeholder="meu-numero"
              />
            </Field>

            {/* Webhook box */}
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-2)",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--text-2)",
                  marginBottom: "8px",
                }}
              >
                URL do Webhook
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <code
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--accent-text)",
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.com"}/api/webhook
                </code>
                <button
                  type="button"
                  onClick={copyWebhook}
                  className="btn-ghost"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "8px 12px",
                    flexShrink: 0,
                    color: copied ? "var(--success)" : "var(--text-2)",
                    borderColor: copied ? "var(--success)" : undefined,
                  }}
                >
                  <IconCopy />
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <p style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: "8px" }}>
                Configure esta URL em <strong style={{ color: "var(--text-2)" }}>Webhook URL</strong> na instância da Evolution API.
              </p>
            </div>
          </SectionCard>

          {/* Save bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
            {saved ? (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--success)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Configurações salvas
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: "11px 22px" }}
            >
              {saving ? "Salvando..." : "Salvar configurações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
