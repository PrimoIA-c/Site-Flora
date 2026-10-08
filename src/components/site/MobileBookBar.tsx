"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatEUR } from "@/lib/dates";

/**
 * Barre « Réserver » collée en bas de l'écran sur mobile : prix + bouton, toujours à portée de pouce.
 * Elle apparaît après le premier écran et se masque sur la page de réservation.
 */
export function MobileBookBar({ price }: { price: number }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const en = pathname.startsWith("/en");

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/reserver") || pathname.startsWith("/en/book") || pathname.startsWith("/en/booking") || pathname.startsWith("/admin") || pathname.startsWith("/reservation")) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-marine/10 bg-ecume/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgba(14,35,56,0.5)] backdrop-blur-md transition-transform duration-500 ease-[var(--ease-tide)] md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <p className="text-[0.7rem] uppercase tracking-widest text-granite">{en ? "From" : "Dès"}</p>
          <p className="font-serif text-2xl">
            {formatEUR(price)} <span className="font-sans text-sm text-granite">/ {en ? "night" : "nuit"}</span>
          </p>
          <p className="text-[0.7rem] text-phare-2">{en ? "Direct booking · no service fees" : "En direct · sans frais de service"}</p>
        </div>
        <Link
          href={en ? "/en/book" : "/reserver"}
          tabIndex={show ? 0 : -1}
          className="shrink-0 rounded-full bg-phare px-6 py-3.5 text-sm font-semibold text-marine shadow-lg active:scale-95"
        >
          {en ? "Book now" : "Réserver"}
        </Link>
      </div>
    </div>
  );
}
