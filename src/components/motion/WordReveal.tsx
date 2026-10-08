"use client";

import { motion } from "framer-motion";
import { Fragment, type ElementType } from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Anime au montage (hero) plutôt qu'à l'entrée dans l'écran. */
  immediate?: boolean;
  /** Mots (en minuscules) à mettre en italique « accent ». */
  accent?: string[];
}

/** Titre révélé mot par mot : chaque mot remonte de derrière une ligne de flottaison. */
export function WordReveal({ text, as: Tag = "h2", className, delay = 0, immediate = false, accent = [] }: Props) {
  const words = text.split(" ");
  const isAccent = (w: string) => accent.includes(w.toLowerCase().replace(/[.,!?;:]/g, ""));
  const accentStyle = { fontVariationSettings: '"SOFT" 100' };

  // Titres visibles au chargement (h1) : animation 100 % CSS, qui démarre dès le premier affichage
  // sans attendre le JavaScript — meilleur LCP. prefers-reduced-motion la neutralise (globals.css).
  if (immediate) {
    return (
      <Tag className={className} aria-label={text}>
        <span aria-hidden>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="inline-block overflow-hidden px-[0.1em] -mx-[0.1em] pb-[0.24em] -mb-[0.24em] align-bottom">
                <span
                  className={`word-rise inline-block ${isAccent(w) ? "italic" : ""}`}
                  style={{ ...(isAccent(w) ? accentStyle : {}), animationDelay: `${delay + i * 0.07}s` }}
                >
                  {w}
                </span>
              </span>
              {i < words.length - 1 ? " " : ""}
            </Fragment>
          ))}
        </span>
      </Tag>
    );
  }

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ staggerChildren: 0.07, delayChildren: delay }}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden px-[0.1em] -mx-[0.1em] pb-[0.24em] -mb-[0.24em] align-bottom">
              <motion.span
                className={`inline-block ${isAccent(w) ? "italic" : ""}`}
                style={isAccent(w) ? accentStyle : undefined}
                variants={{
                  hidden: { y: "110%", rotate: 4 },
                  show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
