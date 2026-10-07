"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { WordReveal } from "./WordReveal";

/**
 * Apparition douce (montée + fondu). `immediate` : au chargement ; sinon à l'entrée dans l'écran.
 * Avec prefers-reduced-motion, MotionConfig (reducedMotion="user") supprime le déplacement : seul le fondu reste.
 */
export function FadeUp({
  children,
  delay = 0,
  immediate = false,
  className,
  y = 24,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  immediate?: boolean;
  className?: string;
  y?: number;
  as?: "div" | "li";
}) {
  const target = { opacity: 1, y: 0 };
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      {...(immediate ? { animate: target } : { whileInView: target, viewport: { once: true, margin: "0px 0px -10% 0px" } })}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Titre de section : sur-titre + titre révélé mot par mot. */
export function SectionTitle({
  eyebrow,
  title,
  accent,
  className = "",
  dark = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string[];
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={className}>
      <FadeUp y={10}>
        <p className={`eyebrow mb-4 flex items-center gap-3 ${dark ? "text-phare" : "text-granite"}`}>
          <span className={`h-px w-8 ${dark ? "bg-phare" : "bg-granite"}`} />
          {eyebrow}
        </p>
      </FadeUp>
      <WordReveal text={title} accent={accent} className="text-4xl md:text-6xl" />
    </div>
  );
}
