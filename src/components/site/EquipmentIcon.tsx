/** Pictogramme d'équipement, choisi d'après le libellé (trait fin, couleur courante). */
export function EquipmentIcon({ label, className = "h-5 w-5" }: { label: string; className?: string }) {
  const l = label.toLowerCase();
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let d: React.ReactNode;
  if (l.includes("wi-fi") || l.includes("wifi")) d = <><path {...p} d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="currentColor" /></>;
  else if (l.includes("lave-vaisselle")) d = <><rect {...p} x="4" y="3" width="16" height="18" rx="2" /><path {...p} d="M4 8h16M8 5.5h2M8 13a4 4 0 0 0 8 0" /></>;
  else if (l.includes("lave-linge")) d = <><rect {...p} x="4" y="3" width="16" height="18" rx="2" /><circle {...p} cx="12" cy="13" r="4.5" /><path {...p} d="M7 6h2" /></>;
  else if (l.includes("four")) d = <><rect {...p} x="3" y="4" width="18" height="16" rx="2" /><rect {...p} x="6" y="9" width="12" height="8" rx="1" /><path {...p} d="M7 6.5h1M10 6.5h1" /></>;
  else if (l.includes("vaisselle")) d = <><circle {...p} cx="12" cy="12" r="7" /><circle {...p} cx="12" cy="12" r="3.5" /><path {...p} d="M2 5v6M2 8h0M22 5v14M20 5v5h2" /></>;
  else if (l.includes("cuisine")) d = <><path {...p} d="M5 21V10M5 10a3 3 0 0 1-2-3V3M7 3v4a3 3 0 0 1-2 3M5 3v4M17 21V3c-2 1-3 3-3 6v4h3" /></>;
  else if (l.includes("canapé")) d = <><path {...p} d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM4 18v2M20 18v2" /></>;
  else if (l.includes("linge") || l.includes("serviette")) d = <><path {...p} d="M6 3h12v14a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" /><path {...p} d="M6 8h12M9 13h6" /></>;
  else if (l.includes("télé") || l.includes("tv")) d = <><rect {...p} x="3" y="5" width="18" height="12" rx="2" /><path {...p} d="M8 21h8M12 17v4" /></>;
  else if (l.includes("fer")) d = <><path {...p} d="M3 17h17v-3a6 6 0 0 0-6-6H8M3 17l2-5a6 6 0 0 1 5-4M7 20h11" /></>;
  else if (l.includes("bébé") || l.includes("chaise")) d = <><circle {...p} cx="12" cy="7" r="3" /><path {...p} d="M7 21v-6a5 5 0 0 1 10 0v6" /></>;
  else if (l.includes("parking")) d = <><rect {...p} x="4" y="3" width="16" height="18" rx="3" /><path {...p} d="M10 17V7h3a3 3 0 0 1 0 6h-3" /></>;
  else d = <path {...p} d="M3 12c3-4 6 4 9 0s6 4 9 0" />;
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {d}
    </svg>
  );
}
