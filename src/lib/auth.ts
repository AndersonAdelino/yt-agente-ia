import { cookies } from "next/headers";

const SESSION_COOKIE = "agent_session";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function setSession(password: string): Promise<boolean> {
  if (password !== process.env.ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return true;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
