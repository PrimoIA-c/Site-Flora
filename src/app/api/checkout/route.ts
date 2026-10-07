import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/booking";
import { isValidISODate } from "@/lib/dates";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Crée une réservation en attente + une session Stripe Checkout, et renvoie l'URL de paiement. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const str = (k: string, max = 200) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const checkIn = str("checkIn");
  const checkOut = str("checkOut");
  const name = str("name", 120);
  const email = str("email", 160).toLowerCase();
  const phone = str("phone", 40);
  const message = str("message", 2000);

  if (!isValidISODate(checkIn) || !isValidISODate(checkOut))
    return NextResponse.json({ error: "Dates invalides." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Indiquez votre nom." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 8) return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
  if (body.acceptTerms !== true)
    return NextResponse.json({ error: "Merci d'accepter les conditions générales de location." }, { status: 400 });

  const result = await createCheckout({
    checkIn,
    checkOut,
    adults: Number(body.adults),
    children: Number(body.children),
    withCleaning: body.withCleaning === true,
    name,
    email,
    phone,
    message,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ url: result.url });
}
