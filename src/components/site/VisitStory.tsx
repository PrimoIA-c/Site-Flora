"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useSafeReducedMotion } from "@/components/motion/useSafeReducedMotion";

export interface VisitScene {
  url: string;
  room: string;
  title: string;
  text: string;
}

/**
 * Visite immersive : l'écran reste fixe pendant le défilement et l'on passe d'une pièce à l'autre.
 * Chaque photo « avance » doucement (comme si l'on marchait dans la pièce) puis se fond dans la suivante.
 * Avec prefers-reduced-motion : simple suite de photos légendées.
 */
export function VisitStory({ scenes }: { scenes: VisitScene[] }) {
  const reduce = useSafeReducedMotion();
  if (!scenes.length) return null;
  if (reduce) return <StaticVisit scenes={scenes} />;
  return <ScrollVisit scenes={scenes} />;
}

function ScrollVisit({ scenes }: { scenes: VisitScene[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = scenes.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n)))));
  const needle = useTransform(scrollYProgress, (v) => -30 + v * 360);
  const rooms = Array.from(new Set(scenes.map((s) => s.room)));

  return (
    <div ref={ref} style={{ height: `${n * 100 + 20}svh` }} className="relative bg-marine">
      <div className="sticky top-0 h-[100svh] overflow-hidden text-ecume">
        {scenes.map((s, i) => (
          <SceneLayer key={s.url + i} scene={s} index={i} total={n} progress={scrollYProgress} />
        ))}

        {/* Voiles de lisibilité */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-marine/90 via-transparent to-marine/50 md:bg-gradient-to-r md:from-marine/85 md:via-marine/30 md:to-transparent" />

        {/* Bandeau haut : titre de section + boussole */}
        <div className="container-x pointer-events-none absolute inset-x-0 top-[4.75rem] flex items-center justify-between md:top-28 md:justify-start md:gap-10">
          <p className="eyebrow flex items-center gap-3 text-phare">
            <span className="h-px w-8 bg-phare" /> La visite
          </p>
          <div className="flex items-center gap-3 text-sm text-ecume/80">
            <span className="font-serif text-2xl text-ecume">{String(active + 1).padStart(2, "0")}</span>
            <span>/ {String(n).padStart(2, "0")}</span>
            <motion.svg aria-hidden viewBox="0 0 40 40" className="h-10 w-10" style={{ rotate: needle }}>
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.35" />
              <path d="M20 5 L23 20 L20 35 L17 20 Z" fill="var(--color-phare)" />
              <path d="M20 20 L23 20 L20 35 L17 20 Z" fill="currentColor" opacity="0.6" />
            </motion.svg>
          </div>
        </div>

        {/* Légendes */}
        <div className="container-x absolute inset-x-0 bottom-8 md:bottom-20">
          <div className="relative min-h-[9.5rem] max-w-xl md:min-h-[12rem] md:max-w-[min(36rem,44vw)]">
            {scenes.map((s, i) => (
              <Caption key={i} scene={s} index={i} total={n} progress={scrollYProgress} />
            ))}
          </div>
          {/* Fil d'Ariane des pièces */}
          <ol className="mt-4 flex flex-wrap gap-x-5 md:mt-6 gap-y-2 text-xs font-semibold uppercase tracking-widest">
            {rooms.map((r) => (
              <li key={r} className={`transition-colors duration-500 ${r === scenes[active].room ? "text-phare" : "text-ecume/45"}`}>
                {r}
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/galerie"
          className="absolute bottom-6 right-5 z-10 hidden items-center gap-2 rounded-full border border-ecume/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-ecume hover:text-marine md:right-10 md:inline-flex"
        >
          Toutes les photos →
        </Link>
      </div>
    </div>
  );
}

/** Interpolation linéaire par morceaux (calculée en JS : pas d'accélération native, résultat fiable). */
function lerpMap(v: number, input: number[], output: number[]) {
  if (v <= input[0]) return output[0];
  for (let k = 1; k < input.length; k++) {
    if (v <= input[k]) {
      const t = (v - input[k - 1]) / (input[k] - input[k - 1] || 1);
      return output[k - 1] + t * (output[k] - output[k - 1]);
    }
  }
  return output[output.length - 1];
}

function windowFor(i: number, n: number) {
  const a = i / n;
  const b = (i + 1) / n;
  const f = 0.18 / n; // durée du fondu enchaîné
  return { a, b, f };
}

function SceneLayer({ scene, index, total, progress }: { scene: VisitScene; index: number; total: number; progress: MotionValue<number> }) {
  const { a, b, f } = windowFor(index, total);
  const first = index === 0;
  const last = index === total - 1;
  const inR = first ? [0, b - f, b + f] : last ? [a - f, a + f, 1] : [a - f, a + f, b - f, b + f];
  const outR = first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0];
  const opacity = useTransform(progress, (v) => lerpMap(v, inR, outR));
  // Mouvement très léger : la photo reste entière et nette, on « avance » à peine
  const s0 = Math.max(0, a - f);
  const s1 = Math.min(1, b + f);
  const scale = useTransform(progress, (v) => lerpMap(v, [s0, s1], [1, 1.06]));
  const lift = useTransform(progress, (v) => lerpMap(v, [s0, s1], [18, -18]));
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      {/* Fond : la même photo, floutée, pour l'ambiance */}
      <div aria-hidden className="absolute inset-0 scale-110">
        <Image src={scene.url} alt="" fill sizes="30vw" quality={40} className="object-cover blur-2xl brightness-[0.45] saturate-[0.9]" />
      </div>
      {/* Photo entière dans un cadre (aucun recadrage) */}
      <motion.figure
        style={{ y: lift }}
        className="absolute inset-x-0 top-[8.25rem] mx-auto aspect-[3/4] w-[min(calc(100vw-2.5rem),calc(46svh*0.75))] md:inset-x-auto md:right-[7vw] md:top-[calc(13svh+1.5rem)] md:w-[min(42vw,calc(72svh*0.75))]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[3px] border-[6px] border-ecume/95 bg-marine shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] md:border-[10px]">
          <motion.div style={{ scale }} className="absolute inset-0">
            <Image src={scene.url} alt={scene.title} fill sizes="(min-width:768px) 42vw, 92vw" quality={85} priority={index < 2} className="object-cover" />
          </motion.div>
        </div>
      </motion.figure>
    </motion.div>
  );
}

function Caption({ scene, index, total, progress }: { scene: VisitScene; index: number; total: number; progress: MotionValue<number> }) {
  const { a, b, f } = windowFor(index, total);
  const first = index === 0;
  const last = index === total - 1;
  const range = first ? [0, b - f * 1.5, b] : last ? [a, a + f * 1.5, 1] : [a, a + f * 1.5, b - f * 1.5, b];
  const oR = first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0];
  const yR = first ? [0, 0, -24] : last ? [24, 0, 0] : [24, 0, 0, -24];
  const opacity = useTransform(progress, (v) => lerpMap(v, range, oR));
  const y = useTransform(progress, (v) => lerpMap(v, range, yR));
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 bottom-0">
      <p className="font-serif text-lg text-phare">{String(index + 1).padStart(2, "0")}</p>
      <h3 className="mt-1 text-3xl md:text-6xl">{scene.title}</h3>
      <p className="mt-3 max-w-md text-sm text-ecume/80 md:mt-4 md:text-lg">{scene.text}</p>
    </motion.div>
  );
}

function StaticVisit({ scenes }: { scenes: VisitScene[] }) {
  return (
    <div className="bg-marine py-20 text-ecume">
      <div className="container-x space-y-14">
        <p className="eyebrow flex items-center gap-3 text-phare">
          <span className="h-px w-8 bg-phare" /> La visite
        </p>
        {scenes.map((s, i) => (
          <figure key={i} className="grid items-center gap-6 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image src={s.url} alt={s.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            </div>
            <figcaption>
              <p className="font-serif text-lg text-phare">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-4xl">{s.title}</h3>
              <p className="mt-3 text-ecume/80">{s.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
