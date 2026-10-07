"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Arrow, Button } from "@/components/motion/Ripple";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (res?.ok) return setState("sent");
    setError((await res?.json().catch(() => null))?.error || "Envoi impossible, réessayez.");
    setState("error");
  }

  return (
    <AnimatePresence mode="wait">
      {state === "sent" ? (
        <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-marine p-10 text-ecume">
          <p className="font-serif text-4xl">Message bien reçu.</p>
          <p className="mt-4 text-ecume/75">Nous revenons vers vous très vite, par e-mail.</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0, y: -12 }} className="grid gap-5 rounded-lg bg-white p-6 shadow-[0_30px_60px_-30px_rgba(14,35,56,0.25)] sm:grid-cols-2 md:p-10">
          <label className="sm:col-span-2">
            <span className="label">Nom et prénom</span>
            <input name="name" required autoComplete="name" className="field" />
          </label>
          <label>
            <span className="label">E-mail</span>
            <input name="email" type="email" required autoComplete="email" className="field" />
          </label>
          <label>
            <span className="label">Téléphone (facultatif)</span>
            <input name="phone" type="tel" autoComplete="tel" className="field" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Dates envisagées (facultatif)</span>
            <input name="dates" className="field" placeholder="ex. du 12 au 19 juillet" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Votre message</span>
            <textarea name="message" required minLength={10} rows={6} className="field" />
          </label>
          {/* Pot de miel anti-spam, invisible pour les humains */}
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <p className="text-xs text-granite sm:col-span-2">
            Vos données servent uniquement à répondre à votre message (voir la politique de confidentialité).
          </p>
          {state === "error" && (
            <p role="alert" className="rounded-md bg-corail px-4 py-3 text-sm text-white sm:col-span-2">
              {error}
            </p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={state === "sending"} className="group">
              {state === "sending" ? "Envoi…" : "Envoyer"} <Arrow />
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
