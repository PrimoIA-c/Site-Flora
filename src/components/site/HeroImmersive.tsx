"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { useSafeReducedMotion } from "@/components/motion/useSafeReducedMotion";

/**
 * Hero plein écran : la photo du salon occupe tout l'écran, avance lentement (effet « on entre »)
 * et se rapproche quand on fait défiler la page. Le contenu (titre, boutons) est passé en enfant.
 */
export function HeroImmersive({ url, alt, children, footer }: { url?: string; alt: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.55]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-marine text-ecume">
      {/* Photo plein écran */}
      <motion.div aria-hidden={!url} style={reduce ? undefined : { scale }} className="absolute inset-0 -z-20 origin-[50%_45%]">
        {url ? (
          <div className="kenburns absolute inset-0">
            <Image src={url} alt={alt} fill priority sizes="100vw" className="object-cover object-[50%_40%]" />
          </div>
        ) : (
          <div className="granite-grain absolute inset-0 opacity-40" />
        )}
      </motion.div>

      {/* Voiles : lisibilité du texte + profondeur marine */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-marine/90 via-marine/55 to-marine/10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-marine via-transparent to-marine/50" />
      <motion.div aria-hidden style={reduce ? undefined : { opacity: veil }} className="absolute inset-0 -z-10 bg-marine opacity-0" />

      <motion.div style={reduce ? undefined : { y: contentY, opacity: contentOpacity }} className="relative flex flex-1 flex-col">
        {children}
      </motion.div>
      {footer}
    </section>
  );
}
