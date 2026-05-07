"use client";

import { useEffect, useState } from "react";

interface Config {
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  evolutionUrl: string;
  evolutionApiKey: string;
  instanceId: string;
}

const DEFAULT: Config = {
  name: "Assistente IA",
  systemPrompt: "Você é um assistente prestativo e amigável.",
  temperature: 0.7,
  maxTokens: 1024,
  evolutionUrl: "",
  evolutionApiKey: "",
  instanceId: "",
};

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
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1">{label}</label>
      {hint && <p className="text-xs text-zinc-500 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors";

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d);
        setLoading(false);
      });
  }, []);

  function set(key: keyof Config, value: string | number) {
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-100">Configurações do Agente</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Defina o comportamento e a integração com o WhatsApp
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identidade */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <span>🤖</span> Identidade do Agente
            </h2>
            <Field label="Nome do Agente">
              <input
                type="text"
                value={config.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputCls}
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
                className={inputCls + " resize-none h-32"}
                placeholder="Você é um assistente de vendas especializado em..."
              />
            </Field>
          </section>

          {/* Modelo */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <span>🧠</span> Parâmetros do Modelo (GPT-4.1-mini)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Temperatura" hint={`Criatividade: ${config.temperature}`}>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => set("temperature", parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-zinc-600 mt-1">
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
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* Evolution API */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <span>📱</span> Integração WhatsApp (Evolution API)
            </h2>
            <Field
              label="URL da Evolution API"
              hint="Ex: https://evolution.seudominio.com"
            >
              <input
                type="url"
                value={config.evolutionUrl}
                onChange={(e) => set("evolutionUrl", e.target.value)}
                className={inputCls}
                placeholder="https://evolution.seudominio.com"
              />
            </Field>
            <Field label="API Key">
              <input
                type="password"
                value={config.evolutionApiKey}
                onChange={(e) => set("evolutionApiKey", e.target.value)}
                className={inputCls}
                placeholder="sua-api-key"
              />
            </Field>
            <Field
              label="Instance ID"
              hint="ID da instância WhatsApp no Evolution Go"
            >
              <input
                type="text"
                value={config.instanceId}
                onChange={(e) => set("instanceId", e.target.value)}
                className={inputCls}
                placeholder="meu-numero"
              />
            </Field>

            <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
              <p className="font-medium text-zinc-300">URL do Webhook para configurar no Evolution Go:</p>
              <code className="block text-emerald-400 bg-zinc-900/60 rounded px-2 py-1 mt-1 break-all">
                {typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.com"}/api/webhook
              </code>
              <p>Configure esta URL em <strong>Webhook URL</strong> na instância da Evolution API.</p>
            </div>
          </section>

          <div className="flex items-center justify-between">
            {saved && (
              <p className="text-sm text-emerald-400 flex items-center gap-1.5">
                <span>✓</span> Configurações salvas
              </p>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
              >
                {saving ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
