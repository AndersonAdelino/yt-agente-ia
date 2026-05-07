import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResponse, ChatMessage } from "@/lib/openai";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { message, conversationId } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  const config = await prisma.agentConfig.findFirst();
  if (!config) {
    return NextResponse.json({ error: "Agente não configurado" }, { status: 400 });
  }

  let conversation = conversationId
    ? await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: config.historyLimit * 2, // par usuário+assistente
          },
        },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { source: "chat" },
      include: { messages: true },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  const history: ChatMessage[] = conversation.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: message });

  const { content, tokens } = await generateResponse(
    history,
    config.systemPrompt,
    config.temperature,
    config.maxTokens,
    { aiProvider: config.aiProvider, openaiApiKey: config.openaiApiKey, openaiModel: config.openaiModel, groqApiKey: config.groqApiKey, groqModel: config.groqModel }
  );

  const assistantMsg = await prisma.message.create({
    data: { conversationId: conversation.id, role: "assistant", content, tokens },
  });

  return NextResponse.json({
    conversationId: conversation.id,
    message: { id: assistantMsg.id, content, tokens, role: "assistant" },
  });
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    const conversations = await prisma.conversation.findMany({
      where: { source: "chat" },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    return NextResponse.json(conversations);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(conversation);
}
