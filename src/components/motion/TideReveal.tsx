"use client";

import { useSafeReducedMotion } from "@/components/motion/useSafeReducedMotion";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Section qui « monte comme la marée » : révélée par un masque dont le bord supérieur
 * est une vague qui s'aplatit à mesure qu'elle atteint le haut.
 */
export function TideReveal({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 30%"] });

  const off = useMotionValue(0); // 1 = animations réduites : aucun masque
  useEffect(() => off.set(reduce ? 1 : 0), [reduce, off]);

  const clip = useTransform([scrollYProgress, off], ([p, disabled]: number[]) => {
    if (disabled) return "none";
    const t = Math.min(1, Math.max(0, p));
    const eased = 1 - Math.pow(1 - t, 3);
    const base = (1 - eased) * 100; // hauteur de la ligne d'eau (en % depuis le haut)
    const amp = 5 * (1 - eased); // amplitude de la vague, nulle à la fin
    const phase = t * Math.PI * 3;
    const steps = 24;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const y = base + amp * Math.sin((i / steps) * Math.PI * 2.5 + phase);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
    return `polygon(0% 100%, ${pts.join(", ")}, 100% 100%)`;
  });

  return (
    <motion.div id={id} ref={ref} className={className} style={{ clipPath: clip }}>
      {children}
    </motion.div>
  );
}
