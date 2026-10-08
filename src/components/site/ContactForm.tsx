"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Arrow, Button } from "@/components/motion/Ripple";
import { t, translateError } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

export function ContactForm() {
  const lang = useLang();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (res?.ok) return setState("sent");
    setError(translateError(lang, (await res?.json().catch(() => null))?.error || t(lang, "Envoi impossible, réessayez.", "Could not send, please try again.")));
    setState("error");
  }

  return (
    <AnimatePresence mode="wait">
      {state === "sent" ? (
        <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-marine p-10 text-ecume">
          <p className="font-serif text-4xl">{t(lang, "Message bien reçu.", "Message received.")}</p>
          <p className="mt-4 text-ecume/75">{t(lang, "Nous revenons vers vous très vite, par e-mail.", "We'll get back to you very soon by e-mail.")}</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0, y: -12 }} className="grid gap-5 rounded-lg bg-white p-6 shadow-[0_30px_60px_-30px_rgba(14,35,56,0.25)] sm:grid-cols-2 md:p-10">
          <label className="sm:col-span-2">
            <span className="label">{t(lang, "Nom et prénom", "Full name")}</span>
            <input name="name" required autoComplete="name" className="field" />
          </label>
          <label>
            <span className="label">E-mail</span>
            <input name="email" type="email" required autoComplete="email" className="field" />
          </label>
          <label>
            <span className="label">{t(lang, "Téléphone (facultatif)", "Phone (optional)")}</span>
            <input name="phone" type="tel" autoComplete="tel" className="field" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">{t(lang, "Dates envisagées (facultatif)", "Dates you have in mind (optional)")}</span>
            <input name="dates" className="field" placeholder={t(lang, "ex. du 12 au 19 juillet", "e.g. 12 to 19 July")} />
          </label>
          <label className="sm:col-span-2">
            <span className="label">{t(lang, "Votre message", "Your message")}</span>
            <textarea name="message" required minLength={10} rows={6} className="field" />
          </label>
          {/* Pot de miel anti-spam, invisible pour les humains */}
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <p className="text-xs text-granite sm:col-span-2">
            {t(lang, "Vos données servent uniquement à répondre à votre message (voir la politique de confidentialité).", "Your details are only used to answer your message (see our privacy policy, in French).")}
          </p>
          {state === "error" && (
            <p role="alert" className="rounded-md bg-corail px-4 py-3 text-sm text-white sm:col-span-2">
              {error}
            </p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={state === "sending"} className="group">
              {state === "sending" ? t(lang, "Envoi…", "Sending…") : t(lang, "Envoyer", "Send")} <Arrow />
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
