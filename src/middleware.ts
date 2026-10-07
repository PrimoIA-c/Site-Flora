import { NextResponse, type NextRequest } from "next/server";

/**
 * Protection OPTIONNELLE de l'admin par mot de passe (authentification HTTP Basic).
 * - Sans variable ADMIN_PASSWORD : l'admin est libre d'accès (comportement demandé au départ).
 * - Avec ADMIN_PASSWORD définie (sur Vercel) : le navigateur demande identifiant + mot de passe.
 *   Identifiant : ADMIN_USER (par défaut « admin »).
 * Les actions de l'admin (enregistrer, annuler…) passent par les mêmes URL /admin : elles sont couvertes aussi.
 * Pour une vraie authentification Supabase, voir src/lib/admin-auth.ts et le README.
 */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return NextResponse.next();

  const user = process.env.ADMIN_USER || "admin";
  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const [u, ...rest] = atob(header.slice(6)).split(":");
    if (u === user && rest.join(":") === password) return NextResponse.next();
  }
  return new NextResponse("Authentification requise", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"', "X-Robots-Tag": "noindex" },
  });
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
