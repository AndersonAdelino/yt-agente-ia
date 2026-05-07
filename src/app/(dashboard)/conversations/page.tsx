"use client";

import { useEffect, useState } from "react";

interface Conversation {
  id: string;
  source: string;
  phone: string | null;
  updatedAt: string;
  messages?: { role: string; content: string; tokens?: number | null; createdAt: string }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function phoneInitials(phone: string | null): string {
  if (!phone) return "?";
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-2) || phone.slice(0, 2).toUpperCase();
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => {
        setConversations(Array.isArray(d) ? d : []);
        setLoadingConv(false);
      });
  }, []);

  async function loadConversation(conv: Conversation) {
    setLoadingMsgs(true);
    const r = await fetch(`/api/conversations?conversationId=${conv.id}`);
    const data = await r.json();
    setSelected(data);
    setLoadingMsgs(false);
  }

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg)" }}>
      {/* Conversation list */}
      <div
        style={{
          width: "260px",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--text-1)",
            }}
          >
            Conversas WhatsApp
          </h1>
          <p style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: "2px" }}>
            Mensagens recebidas via webhook
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConv ? (
            <p style={{ fontSize: "0.8125rem", color: "var(--text-3)", padding: "16px" }}>
              Carregando...
            </p>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: "var(--text-3)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 9.32 19.79 19.79 0 0 1 1.68 .7 2 2 0 0 1 3.66 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 7.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 14.92z" />
                </svg>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-2)", fontWeight: 500 }}>
                Nenhuma conversa ainda
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "4px" }}>
                Configure o webhook da Evolution API para receber mensagens
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const active = selected?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    background: active ? "var(--accent-dim)" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        background: active ? "var(--accent-dim)" : "var(--surface-3)",
                        border: `1px solid ${active ? "var(--accent-border)" : "var(--border-2)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: active ? "var(--accent)" : "var(--text-2)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {phoneInitials(conv.phone)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: active ? 600 : 400,
                          color: active ? "var(--accent-text)" : "var(--text-1)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {conv.phone ?? "Desconhecido"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-3)",
                          marginTop: "1px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages panel */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {!selected && !loadingMsgs && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "24px",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-3)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 9.32 19.79 19.79 0 0 1 1.68 .7 2 2 0 0 1 3.66 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 7.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 14.92z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-1)" }}>
                Selecione uma conversa
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-3)", marginTop: "4px" }}>
                As mensagens do WhatsApp aparecerão aqui
              </p>
            </div>
          </div>
        )}

        {loadingMsgs && (
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
            Carregando mensagens...
          </div>
        )}

        {selected && !loadingMsgs && (
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
            {/* Conversation header */}
            <div
              style={{
                padding: "14px 24px",
                borderBottom: "1px solid var(--border)",
                position: "sticky",
                top: 0,
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                  flexShrink: 0,
                }}
              >
                {phoneInitials(selected.phone)}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-1)" }}>
                  {selected.phone}
                </p>
                <p style={{ fontSize: "0.6875rem", color: "var(--text-3)" }}>
                  Conversa via WhatsApp
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {selected.messages?.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={i}
                    className="animate-fade-up"
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-start" : "flex-end",
                      animationDelay: `${i * 0.03}s`,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "72%",
                        background: isUser ? "var(--surface-2)" : "var(--accent)",
                        border: isUser ? "1px solid var(--border)" : "none",
                        borderRadius: isUser ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                        padding: "10px 14px",
                        fontSize: "0.875rem",
                        color: isUser ? "var(--text-1)" : "#000",
                        lineHeight: 1.6,
                      }}
                    >
                      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                      <p
                        style={{
                          fontSize: "0.625rem",
                          marginTop: "5px",
                          opacity: 0.55,
                          fontFamily: "var(--font-mono)",
                          textAlign: "right",
                        }}
                      >
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
