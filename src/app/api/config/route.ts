import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function getOrCreateConfig() {
  const existing = await prisma.agentConfig.findFirst();
  if (existing) return existing;
  return prisma.agentConfig.create({ data: {} });
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const config = await getOrCreateConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await req.json();
  const config = await getOrCreateConfig();
  const updated = await prisma.agentConfig.update({
    where: { id: config.id },
    data: {
      name: body.name,
      systemPrompt: body.systemPrompt,
      temperature: parseFloat(body.temperature),
      maxTokens: parseInt(body.maxTokens),
      evolutionUrl: body.evolutionUrl,
      evolutionApiKey: body.evolutionApiKey,
      instanceId: body.instanceId,
    },
  });
  return NextResponse.json(updated);
}
