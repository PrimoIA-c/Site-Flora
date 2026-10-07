import Image from "next/image";

/**
 * Photo du logement, ou emplacement élégant clairement libellé tant qu'aucune photo n'est chargée.
 * Les photos se gèrent depuis /admin/photos.
 */
export function PhotoFrame({
  url,
  label,
  index,
  sizes = "(min-width: 768px) 50vw, 90vw",
  priority = false,
  tone = "sable",
  arch = false,
  className = "",
}: {
  url?: string | null;
  label: string;
  index?: number;
  sizes?: string;
  priority?: boolean;
  tone?: "sable" | "marine";
  /** Cadre en arche : le libellé est centré pour ne pas être rogné par l'arrondi. */
  arch?: boolean;
  className?: string;
}) {
  if (url) {
    return (
      <div className={`group/photo relative overflow-hidden bg-sable ${className}`}>
        <Image
          src={url}
          alt={label || "Photo du logement"}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[1400ms] ease-tide group-hover/photo:scale-[1.04]"
          unoptimized={url.startsWith("data:")}
        />
      </div>
    );
  }

  const dark = tone === "marine";
  return (
    <div
      role="img"
      aria-label={`Emplacement photo : ${label}`}
      className={`relative overflow-hidden ${dark ? "bg-marine-2 text-ecume" : "bg-sable text-marine"} ${className}`}
    >
      <div className="granite-grain absolute inset-0 opacity-70" />
      {/* Lignes de marée gravées */}
      <svg aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-40" viewBox="0 0 400 200" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M0 ${60 + i * 28} C 70 ${40 + i * 28}, 130 ${80 + i * 28}, 200 ${60 + i * 28} S 330 ${40 + i * 28}, 400 ${60 + i * 28}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity={1 - i * 0.16}
          />
        ))}
      </svg>
      <div className={`absolute inset-0 flex flex-col p-5 md:p-7 ${arch ? "items-center justify-center gap-3 text-center" : "justify-between"}`}>
        <span className="eyebrow opacity-60">
          {typeof index === "number" ? `N° ${String(index + 1).padStart(2, "0")} · ` : ""}Photo à venir
        </span>
        <span className="font-serif text-3xl md:text-4xl" style={{ fontVariationSettings: '"SOFT" 100' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export const PLACEHOLDER_LABELS = ["Salon", "Chambre 1", "Chambre 2", "Cuisine", "Salle de bain", "Vue", "Quartier"];
