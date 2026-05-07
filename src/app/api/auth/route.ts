import { NextRequest, NextResponse } from "next/server";
import { setSession, clearSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const ok = await setSession(password);
  if (!ok) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
