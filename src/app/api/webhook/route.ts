import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResponse, ChatMessage } from "@/lib/openai";
import { sendWhatsAppMessage } from "@/lib/evolution";

// Evolution API (Node.js) webhook payload
interface EvolutionWebhookPayload {
  event: string;
  instance?: string;
  data?: {
    key?: {
      remoteJid?: string;
      fromMe?: boolean;
      id?: string;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: { text: string };
    };
    messageType?: string;
    pushName?: string;
  };
}

function extractPhone(remoteJid?: string): string {
  if (!remoteJid) return "";
  // Ignora grupos (contém @g.us)
  if (remoteJid.includes("@g.us")) return "";
  return remoteJid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const payload: EvolutionWebhookPayload = await req.json();

    if (payload.event !== "messages.upsert") {
      return NextResponse.json({ ok: true });
    }

    const data = payload.data;
    if (!data || data.key?.fromMe) {
      return NextResponse.json({ ok: true });
    }

    const phone = extractPhone(data.key?.remoteJid);
    const text =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      "";

    if (!phone || !text) {
      return NextResponse.json({ ok: true });
    }

    const config = await prisma.agentConfig.findFirst();
    if (!config || !config.evolutionUrl || !config.evolutionApiKey) {
      return NextResponse.json({ error: "Agente não configurado" }, { status: 400 });
    }

    let conversation = await prisma.conversation.findFirst({
      where: { source: "whatsapp", phone },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { source: "whatsapp", phone },
        include: { messages: true },
      });
    }

    await prisma.message.create({
      data: { conversationId: conversation.id, role: "user", content: text },
    });

    const history: ChatMessage[] = conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    history.push({ role: "user", content: text });

    const { content, tokens } = await generateResponse(
      history,
      config.systemPrompt,
      config.temperature,
      config.maxTokens
    );

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content,
        tokens,
      },
    });

    await sendWhatsAppMessage(
      config.evolutionUrl,
      config.evolutionApiKey,
      config.instanceId,
      phone,
      content
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
