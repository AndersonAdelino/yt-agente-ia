"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number;
}

const STORAGE_KEY = "chat_conversation_id";

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      className="animate-fade-up"
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", gap: "4px" }}>
        {!isUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "4px" }}>
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "var(--ai-dim)",
                border: "1px solid var(--ai-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--ai)" stroke="none">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-3)", fontWeight: 500 }}>
              Agente
            </span>
          </div>
        )}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            background: isUser
              ? "var(--accent)"
              : "var(--surface-2)",
            color: isUser ? "#000" : "var(--text-1)",
            border: isUser ? "none" : "1px solid var(--border)",
            fontWeight: isUser ? 500 : 400,
          }}
        >
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
        </div>
        {msg.tokens && (
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-3)",
              marginLeft: isUser ? 0 : "4px",
              textAlign: isUser ? "right" : "left",
              fontFamily: "var(--font-mono)",
            }}
          >
            {msg.tokens} tokens
          </p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          padding: "12px 16px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "16px 16px 16px 4px",
          display: "flex",
          gap: "5px",
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="dot-pulse"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--ai)",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadHistory = useCallback(async (convId: string) => {
    const res = await fetch(`/api/chat?conversationId=${convId}`);
    if (!res.ok) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const data = await res.json();
    if (data?.messages?.length) {
      setMessages(
        data.messages.map((m: { id: string; role: string; content: string; tokens?: number }) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          tokens: m.tokens,
        }))
      );
      setConversationId(convId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      loadHistory(saved).finally(() => setLoadingHistory(false));
    } else {
      setLoadingHistory(false);
    }
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function resetChat() {
    setMessages([]);
    setConversationId(null);
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString() + "-err", role: "assistant", content: `Erro: ${err.error ?? "Falha ao obter resposta"}` },
        ]);
        return;
      }

      const data = await res.json();
      const newConvId = data.conversationId;
      setConversationId(newConvId);
      localStorage.setItem(STORAGE_KEY, newConvId);
      setMessages((prev) => [...prev, { ...data.message, role: "assistant" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-err", role: "assistant", content: "Erro de conexão." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--text-1)",
                lineHeight: 1.3,
              }}
            >
              Chat de Teste
            </h1>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: "1px" }}>
              {conversationId
                ? "Conversa salva — histórico preservado entre sessões"
                : "Teste o agente sem precisar do WhatsApp"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Online indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              className="status-pulse"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--success)",
              }}
            />
            <span style={{ fontSize: "0.6875rem", color: "var(--text-3)" }}>online</span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={resetChat}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
              }}
            >
              <IconTrash />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {loadingHistory ? (
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
            Carregando histórico...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p style={{ color: "var(--text-1)", fontWeight: 500, fontSize: "0.9375rem" }}>
                Agente pronto para conversar
              </p>
              <p style={{ color: "var(--text-3)", fontSize: "0.8125rem", marginTop: "4px", maxWidth: "280px" }}>
                Envie uma mensagem para testar. O histórico fica salvo até você clicar em{" "}
                <span style={{ color: "var(--error)" }}>Limpar</span>.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "14px 24px 18px",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem… (Enter para enviar)"
            rows={1}
            className="field-input"
            style={{
              flex: 1,
              resize: "none",
              maxHeight: "120px",
              overflowY: "auto",
              minHeight: "44px",
              lineHeight: "1.5",
              paddingTop: "11px",
              paddingBottom: "11px",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              flexShrink: 0,
              width: "44px",
              height: "44px",
              background: input.trim() && !loading ? "var(--accent)" : "var(--surface-3)",
              border: "1px solid " + (input.trim() && !loading ? "var(--accent-border)" : "var(--border-2)"),
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              color: input.trim() && !loading ? "#000" : "var(--text-3)",
              transition: "all 0.2s ease",
            }}
          >
            <IconSend />
          </button>
        </div>
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-3)",
            textAlign: "center",
            marginTop: "8px",
            fontFamily: "var(--font-mono)",
          }}
        >
          GPT-4.1-mini · Shift+Enter para quebrar linha
        </p>
      </div>
    </div>
  );
}
