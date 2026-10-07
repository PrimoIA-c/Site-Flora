"use client";

import { useSafeReducedMotion } from "@/components/motion/useSafeReducedMotion";
import { motion } from "framer-motion";

/**
 * Mini-carte stylisée (non géographique) : le logement, la plage et le marché,
 * reliés par des tracés qui se dessinent au scroll avec leurs distances.
 */
export function NearbyMap() {
  const reduce = useSafeReducedMotion();
  const draw = (delay: number) =>
    ({
      initial: { pathLength: 0, opacity: 0 },
      whileInView: { pathLength: 1, opacity: 1 },
      viewport: { once: true, margin: "-15%" },
      transition: { duration: reduce ? 0 : 1.6, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
    }) as const;
  const pop = (delay: number) =>
    ({
      initial: { opacity: 0, y: 8 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-15%" },
      transition: { duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay },
    }) as const;

  return (
    <svg viewBox="0 0 600 460" className="h-auto w-full" role="img" aria-labelledby="map-title map-desc">
      <title id="map-title">Plan du quartier</title>
      <desc id="map-desc">La plage est à 100 mètres du logement, le marché à 200 mètres.</desc>

      {/* Mer */}
      <path d="M0 0 H600 V120 C 520 150, 470 110, 400 150 C 330 190, 300 150, 230 175 C 150 205, 90 170, 0 200 Z" fill="var(--color-marine)" />
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${40 + i * 30} ${60 + i * 30} q 30 -12 60 0 t 60 0`}
          fill="none"
          stroke="var(--color-ecume)"
          strokeOpacity="0.35"
          strokeWidth="1.2"
          {...(reduce ? {} : { animate: { x: [0, 14, 0] }, transition: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" } })}
        />
      ))}
      {/* Plage (sable) */}
      <path d="M0 200 C 90 170, 150 205, 230 175 C 300 150, 330 190, 400 150 C 470 110, 520 150, 600 120 V150 C 520 180, 470 140, 400 180 C 330 220, 300 180, 230 205 C 150 235, 90 200, 0 230 Z" fill="var(--color-sable)" />

      {/* Rues */}
      <g stroke="var(--color-marine)" strokeOpacity="0.14" strokeWidth="10" strokeLinecap="round" fill="none">
        <path d="M40 300 H560" />
        <path d="M60 400 H540" />
        <path d="M200 215 V440" />
        <path d="M430 180 V440" />
        <path d="M300 300 L 330 440" />
      </g>

      {/* Remparts, en granite */}
      <path d="M470 20 l60 -8 l40 30 l-6 60 l-52 18 l-48 -24 z" fill="none" stroke="var(--color-granite-2)" strokeWidth="2" strokeDasharray="3 4" />
      <text x="520" y="62" textAnchor="middle" fontSize="11" fill="var(--color-ecume)" opacity="0.7" letterSpacing="2">
        REMPARTS
      </text>

      {/* Tracé vers la plage */}
      <motion.path d="M200 300 C 200 260, 205 230, 210 196" fill="none" stroke="var(--color-marine)" strokeWidth="2.2" strokeDasharray="1 7" strokeLinecap="round" {...draw(0.2)} />
      {/* Tracé vers le marché */}
      <motion.path d="M200 300 C 260 300, 330 300, 430 300 L 430 330" fill="none" stroke="var(--color-marine)" strokeWidth="2.2" strokeDasharray="1 7" strokeLinecap="round" {...draw(0.6)} />

      {/* Logement : le « phare » */}
      <g transform="translate(200 300)">
        {!reduce && (
          <motion.circle r="10" fill="var(--color-phare)" animate={{ r: [10, 30], opacity: [0.5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }} />
        )}
        <circle r="10" fill="var(--color-phare)" stroke="var(--color-marine)" strokeWidth="2" />
      </g>
      <motion.g {...pop(0.1)}>
        <rect x="92" y="316" width="96" height="30" rx="15" fill="var(--color-marine)" />
        <text x="140" y="336" textAnchor="middle" fontSize="13" fill="var(--color-ecume)" fontWeight="600">
          Chez vous
        </text>
      </motion.g>

      {/* Plage */}
      <motion.g {...pop(1.3)}>
        <circle cx="210" cy="192" r="6" fill="var(--color-marine)" />
        <rect x="222" y="224" width="124" height="44" rx="6" fill="#fff" stroke="var(--color-marine)" strokeOpacity="0.15" />
        <text x="236" y="243" fontSize="12" fill="var(--color-granite)" letterSpacing="1.5">
          PLAGE
        </text>
        <text x="236" y="261" fontSize="16" fill="var(--color-marine)" fontFamily="var(--font-serif)">
          100 m · 1 min
        </text>
      </motion.g>

      {/* Marché */}
      <motion.g {...pop(1.8)}>
        <rect x="408" y="330" width="44" height="30" rx="4" fill="var(--color-corail)" />
        <path d="M408 330 l6 -10 h32 l6 10" fill="var(--color-corail)" opacity="0.7" />
        <rect x="364" y="372" width="140" height="44" rx="6" fill="#fff" stroke="var(--color-marine)" strokeOpacity="0.15" />
        <text x="378" y="391" fontSize="12" fill="var(--color-granite)" letterSpacing="1.5">
          MARCHÉ
        </text>
        <text x="378" y="409" fontSize="16" fill="var(--color-marine)" fontFamily="var(--font-serif)">
          200 m · 3 min
        </text>
      </motion.g>

      {/* Rose des vents */}
      <g transform="translate(560 420)" opacity="0.6">
        <path d="M0 -16 L4 0 L0 16 L-4 0 Z" fill="var(--color-marine)" />
        <text y="-20" textAnchor="middle" fontSize="10" fill="var(--color-marine)">
          N
        </text>
      </g>
    </svg>
  );
}
