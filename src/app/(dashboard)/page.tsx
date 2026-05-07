"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number;
}

const STORAGE_KEY = "chat_conversation_id";

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] ${isUser ? "order-last" : ""}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs">
              🤖
            </div>
            <span className="text-xs text-zinc-500">Agente</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-emerald-500 text-white rounded-tr-sm"
              : "bg-zinc-800 text-zinc-100 rounded-tl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        {msg.tokens && (
          <p className="text-[11px] text-zinc-600 mt-1 ml-1">{msg.tokens} tokens</p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
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

  // Carrega histórico da última conversa ao abrir
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-zinc-100">Chat de Teste</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {conversationId
              ? "Conversa salva — histórico preservado entre sessões"
              : "Teste o agente sem precisar do WhatsApp"}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={resetChat}
            className="text-xs text-zinc-500 hover:text-red-400 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Limpar memória
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loadingHistory ? (
          <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
            Carregando histórico...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mb-4">
              🤖
            </div>
            <p className="text-zinc-300 font-medium mb-1">Agente pronto para conversa</p>
            <p className="text-sm text-zinc-500 max-w-xs">
              Envie uma mensagem para testar. O histórico fica salvo até você clicar em{" "}
              <span className="text-red-400">Limpar memória</span>.
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-zinc-800 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none max-h-32 overflow-y-auto"
            style={{ minHeight: "46px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-11 h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2 text-center">
          GPT-4.1-mini · Shift+Enter para quebrar linha
        </p>
      </div>
    </div>
  );
}
