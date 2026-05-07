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
    <div className="flex h-full">
      {/* List */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="px-4 py-4 border-b border-zinc-800">
          <h1 className="text-base font-semibold text-zinc-100">Conversas WhatsApp</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Mensagens recebidas via webhook</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConv ? (
            <p className="text-xs text-zinc-500 px-4 py-4">Carregando...</p>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-zinc-500">Nenhuma conversa ainda</p>
              <p className="text-xs text-zinc-600 mt-1">
                Configure o webhook da Evolution API para receber mensagens
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${
                  selected?.id === conv.id ? "bg-zinc-800" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
                    📱
                  </div>
                  <span className="text-sm text-zinc-200 font-medium truncate">
                    {conv.phone ?? "Desconhecido"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 ml-9">{formatDate(conv.updatedAt)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {!selected && !loadingMsgs && (
          <div className="h-full flex items-center justify-center text-center px-6">
            <div>
              <p className="text-4xl mb-3">📱</p>
              <p className="text-zinc-400 font-medium">Selecione uma conversa</p>
              <p className="text-sm text-zinc-600 mt-1">
                As mensagens do WhatsApp aparecerão aqui
              </p>
            </div>
          </div>
        )}

        {loadingMsgs && (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Carregando mensagens...
          </div>
        )}

        {selected && !loadingMsgs && (
          <div>
            <div className="px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-950">
              <p className="text-sm font-medium text-zinc-200">{selected.phone}</p>
              <p className="text-xs text-zinc-500">Conversa via WhatsApp</p>
            </div>
            <div className="px-6 py-4 space-y-3">
              {selected.messages?.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-zinc-800 text-zinc-100 rounded-tl-sm"
                        : "bg-emerald-500 text-white rounded-tr-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[11px] mt-1 opacity-60">{formatDate(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
