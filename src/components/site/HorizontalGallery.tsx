"use client";

import { useSafeReducedMotion } from "@/components/motion/useSafeReducedMotion";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PhotoFrame } from "./PhotoFrame";

export interface GalleryItem {
  url: string | null;
  label: string;
}

/**
 * Galerie à défilement horizontal piloté par le scroll vertical (desktop),
 * avec léger parallaxe à l'intérieur de chaque photo.
 * Sur mobile / animations réduites : simple carrousel natif avec aimantation.
 */
export function HorizontalGallery({ items }: { items: GalleryItem[] }) {
  const reduce = useSafeReducedMotion();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!desktop || reduce) {
    return (
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none]">
        {items.map((it, i) => (
          <figure key={i} className="w-[82vw] max-w-sm shrink-0 snap-center">
            <PhotoFrame url={it.url} label={it.label} index={i} className="aspect-[4/5] rounded-sm shadow-[0_20px_40px_-20px_rgba(14,35,56,0.5)]" sizes="82vw" />
            <figcaption className="mt-3 text-sm text-granite">{it.label}</figcaption>
          </figure>
        ))}
      </div>
    );
  }
  return <ScrollTrack items={items} />;
}

function ScrollTrack({ items }: { items: GalleryItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <div ref={sectionRef} style={{ height: `calc(100vh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex items-center gap-8 pl-[8vw] pr-[8vw] will-change-transform">
          {items.map((it, i) => (
            <GalleryCard key={i} item={it} index={i} progress={scrollYProgress} total={items.length} />
          ))}
        </motion.div>
        <ProgressBar progress={scrollYProgress} />
      </div>
    </div>
  );
}

function GalleryCard({
  item,
  index,
  progress,
  total,
}: {
  item: GalleryItem;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  // Parallaxe : l'image glisse un peu moins vite que son cadre.
  const center = total > 1 ? index / (total - 1) : 0.5;
  const imgX = useTransform(progress, [center - 0.5, center + 0.5], ["8%", "-8%"]);
  // Alternance de formats pour un rythme éditorial
  const shape = ["h-[62vh] w-[44vh]", "h-[48vh] w-[64vh]", "h-[56vh] w-[42vh]"][index % 3];
  const offset = ["-translate-y-6", "translate-y-10", "translate-y-0"][index % 3];

  return (
    <figure className={`shrink-0 ${offset}`}>
      <div className={`relative overflow-hidden rounded-sm shadow-[0_30px_60px_-24px_rgba(14,35,56,0.5)] ring-1 ring-marine/10 ${shape}`}>
        <motion.div style={item.url ? { x: imgX, scale: 1.18 } : undefined} className="absolute inset-0">
          <PhotoFrame url={item.url} label={item.label} index={index} className="h-full w-full" sizes="60vh" />
        </motion.div>
      </div>
      <figcaption className="mt-4 flex items-baseline gap-3 text-sm text-granite">
        <span className="font-serif text-base text-marine">{String(index + 1).padStart(2, "0")}</span>
        {item.label}
      </figcaption>
    </figure>
  );
}

function ProgressBar({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute bottom-10 left-[8vw] right-[8vw] h-px bg-marine/15">
      <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-marine" />
    </div>
  );
}
