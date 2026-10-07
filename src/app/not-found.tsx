import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-marine px-6 text-center text-ecume">
      <p className="eyebrow text-phare">Erreur 404</p>
      <h1 className="mt-4 text-5xl md:text-7xl">Marée basse : cette page n&apos;existe pas</h1>
      <Link href="/" className="mt-10 rounded-full bg-phare px-6 py-3.5 font-semibold text-marine hover:bg-phare-2">
        Revenir au rivage
      </Link>
    </main>
  );
}
