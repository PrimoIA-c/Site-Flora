/**
 * Point d'entrée UNIQUE pour protéger l'admin.
 *
 * Aujourd'hui : accès libre (demandé pour démarrer), l'admin est simplement non indexé.
 * Pour ajouter l'authentification Supabase plus tard (voir README → « Sécuriser l'admin ») :
 *   1. installer @supabase/ssr et lire la session utilisateur dans cette fonction ;
 *   2. vérifier que l'e-mail figure dans ADMIN_EMAILS ;
 *   3. sinon `redirect("/admin/connexion")`.
 * Toutes les pages admin (layout) et toutes les actions serveur admin appellent déjà `requireAdmin()`,
 * il n'y a donc rien d'autre à modifier.
 */
import "server-only";

export async function requireAdmin(): Promise<{ email: string | null }> {
  return { email: null };
}
