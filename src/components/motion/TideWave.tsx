"use client";

import { useEffect, useRef } from "react";

/**
 * Ligne d'horizon animée : trois vagues superposées qui « respirent » comme la marée.
 * Les chemins SVG sont recalculés à chaque image (léger : ~40 points par vague),
 * et l'animation se met en pause hors écran ou si l'onglet est masqué.
 */
const LAYERS = [
  { amp: 10, len: 0.9, speed: 0.35, y: 0.4, fill: "var(--color-marine-3)", opacity: 0.7 },
  { amp: 14, len: 1.3, speed: 0.22, y: 0.56, fill: "var(--color-sable)", opacity: 0.35 },
  { amp: 9, len: 0.7, speed: 0.5, y: 0.74, fill: "var(--color-ecume)", opacity: 1 },
];

const W = 1440;
const H = 240;

function wavePath(t: number, l: (typeof LAYERS)[number], breathe: number) {
  const pts = 40;
  const baseY = H * l.y + breathe * 10;
  let d = `M0 ${H} L0 ${baseY}`;
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * W;
    const k = (i / pts) * Math.PI * 2;
    const y =
      baseY +
      Math.sin(k * l.len * 2 + t * l.speed) * l.amp * (0.75 + 0.25 * breathe) +
      Math.sin(k * l.len * 5 - t * l.speed * 1.7) * l.amp * 0.25;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${W} ${H} Z`;
}

export function TideWave({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const breathe = Math.sin(t * 0.25); // cycle lent : la « marée »
      LAYERS.forEach((l, i) => pathRefs.current[i]?.setAttribute("d", wavePath(t, l, breathe)));
      // Fine ligne d'horizon lumineuse qui suit la première vague
      const top = wavePath(t, LAYERS[0], breathe).replace(/ L1440 240 Z$/, "").replace(/^M0 240 L/, "M");
      lineRef.current?.setAttribute("d", top);
    };

    const loop = (now: number) => {
      if (visible && !document.hidden) draw(now);
      raf = requestAnimationFrame(loop);
    };

    draw(start);
    if (reduce) return;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (svgRef.current) io.observe(svgRef.current);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
    >
      {LAYERS.map((l, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={wavePath(0, l, 0)}
          fill={l.fill}
          opacity={l.opacity}
        />
      ))}
      <path ref={lineRef} fill="none" stroke="var(--color-phare)" strokeOpacity="0.55" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
