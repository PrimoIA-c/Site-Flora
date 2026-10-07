import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";
import { sendContactMessage } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const s = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");

  // Pot de miel anti-robots : champ invisible qui doit rester vide.
  if (s("website", 100)) return NextResponse.json({ ok: true });

  const name = s("name", 120);
  const email = s("email", 160);
  const message = s("message", 4000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) {
    return NextResponse.json({ error: "Merci de remplir votre nom, un e-mail valide et un message (10 caractères min.)." }, { status: 400 });
  }
  const settings = await getSettings();
  await sendContactMessage(settings.alert_email, { name, email, phone: s("phone", 40), dates: s("dates", 120), message });
  return NextResponse.json({ ok: true });
}
