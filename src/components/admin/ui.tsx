"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { spawnRipple } from "@/components/motion/Ripple";
import type { ActionState } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "M3 12h7V3H3zM14 21h7v-9h-7zM14 3v5h7V3zM3 21h7v-5H3z" },
  { href: "/admin/reservations", label: "Réservations", icon: "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4" },
  { href: "/admin/calendrier", label: "Calendrier", icon: "M4 5h16v15H4zM4 10h16M8 14h2M12 14h2M16 14h0M8 17h2" },
  { href: "/admin/tarifs", label: "Tarifs", icon: "M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" },
  { href: "/admin/photos", label: "Photos", icon: "M3 6h18v13H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h0" },
  { href: "/admin/parametres", label: "Paramètres", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .3-1.4-1.4L17 5l-3-1-1 2h-2L10 4 7 5l.4 2-1.4 1.4L4 8l-1 3 2 1v0l-2 1 1 3 2-.3 1.4 1.4L7 19l3 1 1-2h2l1 2 3-1-.4-2 1.4-1.4 2 .4 1-3z" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation admin" className="flex gap-1 overflow-x-auto md:flex-col">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-ecume text-marine" : "text-ecume/75 hover:bg-ecume/10 hover:text-ecume"
            }`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={n.icon} />
            </svg>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SubmitButton({ children, pendingText = "Enregistrement…", variant = "primary" }: { children: ReactNode; pendingText?: string; variant?: "primary" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={spawnRipple}
      className={`ripple-host inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
        variant === "danger" ? "bg-corail text-white hover:brightness-95" : "bg-marine text-ecume hover:bg-marine-2"
      }`}
    >
      {pending ? pendingText : children}
    </button>
  );
}

/** Message de retour après une action (disparaît après quelques secondes). */
export function ActionMessage({ state }: { state: ActionState | null }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!state?.at) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [state?.at]);
  return (
    <AnimatePresence>
      {visible && state && (
        <motion.p
          role="status"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`rounded-md px-4 py-2.5 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
        >
          {state.ok ? "✓ " : "⚠ "}
          {state.message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function Card({ title, description, children, className = "" }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-marine/10 bg-white p-5 md:p-6 ${className}`}>
      {title && <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>}
      {description && <p className="mt-1 text-sm text-granite">{description}</p>}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </section>
  );
}
