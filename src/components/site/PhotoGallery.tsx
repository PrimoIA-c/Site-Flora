"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface GalleryPhoto {
  url: string;
  label: string;
}

/** « La chambre, côté rangements » → « La chambre » */
const roomOf = (label: string) => label.split(",")[0].trim() || "Le logement";

/**
 * Galerie complète : filtres par pièce, mosaïque, et visionneuse plein écran
 * (flèches, clavier, glisser du doigt, vignettes).
 */
export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const rooms = useMemo(() => Array.from(new Set(photos.map((p) => roomOf(p.label)))), [photos]);
  const [room, setRoom] = useState<string>("Tout");
  const shown = useMemo(() => (room === "Tout" ? photos : photos.filter((p) => roomOf(p.label) === room)), [photos, room]);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrer par pièce">
        {["Tout", ...rooms].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoom(r)}
            aria-pressed={room === r}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              room === r ? "border-marine bg-marine text-ecume" : "border-marine/20 hover:border-marine/50"
            }`}
          >
            {r}
            <span className="ml-2 text-xs opacity-60">{r === "Tout" ? photos.length : photos.filter((p) => roomOf(p.label) === r).length}</span>
          </button>
        ))}
      </div>

      <motion.ul layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.li
              layout
              key={p.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full overflow-hidden rounded-sm bg-sable shadow-[0_24px_50px_-28px_rgba(14,35,56,0.55)]"
                aria-label={`Agrandir : ${p.label}`}
              >
                <div className={`relative w-full ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
                  <Image
                    src={p.url}
                    alt={p.label}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1200ms] ease-tide group-hover:scale-[1.05]"
                  />
                </div>
                <span className="absolute inset-0 bg-gradient-to-t from-marine/70 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-left text-ecume">
                  <span className="font-serif text-xl">{p.label}</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-ecume/40 text-lg opacity-0 transition-all duration-500 group-hover:opacity-100">
                    ⤢
                  </span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>{open !== null && <Lightbox photos={shown} start={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}

function Lightbox({ photos, start, onClose }: { photos: GalleryPhoto[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const [dir, setDir] = useState(0);
  const n = photos.length;
  const go = useCallback((d: number) => {
    setDir(d);
    setI((x) => (x + d + n) % n);
  }, [n]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const p = photos[i];
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${i + 1} sur ${n} : ${p.label}`}
      className="fixed inset-0 z-[80] flex flex-col bg-marine/97 text-ecume backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-lenis-prevent
    >
      <div className="flex items-center justify-between px-5 py-4 md:px-8">
        <p className="text-sm">
          <span className="font-serif text-xl">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-ecume/60"> / {String(n).padStart(2, "0")}</span>
          <span className="ml-4 hidden text-ecume/85 sm:inline">{p.label}</span>
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-ecume/30 text-xl hover:bg-ecume hover:text-marine" aria-label="Fermer">
          ✕
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={p.url}
            custom={dir}
            initial={{ opacity: 0, x: dir * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -80 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="absolute inset-0 cursor-grab px-3 active:cursor-grabbing md:px-24"
          >
            <Image src={p.url} alt={p.label} fill sizes="100vw" className="pointer-events-none select-none object-contain" priority />
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ecume/30 bg-marine/40 text-2xl hover:bg-ecume hover:text-marine md:grid">
          ‹
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ecume/30 bg-marine/40 text-2xl hover:bg-ecume hover:text-marine md:grid">
          ›
        </button>
      </div>

      <p className="px-5 pt-3 text-center font-serif text-lg sm:hidden">{p.label}</p>
      <ul className="flex gap-2 overflow-x-auto px-5 py-4 [scrollbar-width:none] md:justify-center">
        {photos.map((t, k) => (
          <li key={t.url} className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setDir(k > i ? 1 : -1);
                setI(k);
              }}
              aria-label={`Voir : ${t.label}`}
              aria-current={k === i}
              className={`relative block h-14 w-11 overflow-hidden rounded-sm transition-all md:h-16 md:w-12 ${k === i ? "ring-2 ring-phare" : "opacity-50 hover:opacity-100"}`}
            >
              <Image src={t.url} alt="" fill sizes="48px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
