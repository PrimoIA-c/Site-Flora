import { PhotoFrame } from "./PhotoFrame";

/**
 * Composition photo d'une pièce : grande photo posée sur un aplat décalé,
 * étiquette numérotée et, s'il y en a une, seconde photo encadrée qui chevauche le coin.
 * Donne de la profondeur au lieu d'une simple image à plat.
 */
export function RoomPhotos({
  main,
  extra,
  fallbackLabel,
  index,
  reverse = false,
}: {
  main?: { url: string; label: string };
  extra?: { url: string; label: string };
  fallbackLabel: string;
  index: number;
  reverse?: boolean;
}) {
  const dark = index % 2 === 1;
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className={`relative ${extra ? "pb-16 md:pb-20" : "pb-6"}`}>
      {/* Aplat décalé derrière la photo */}
      <div
        aria-hidden
        className={`absolute top-8 bottom-0 rounded-sm md:top-12 ${
          reverse ? "-left-3 right-10 md:-left-8 md:right-16" : "-right-3 left-10 md:-right-8 md:left-16"
        } ${dark ? "bg-marine" : "bg-sable"}`}
      >
        <div className="granite-grain absolute inset-0 opacity-60" />
        {/* Lignes de marée */}
        <svg
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          className={`absolute bottom-3 h-10 w-1/2 opacity-40 ${reverse ? "left-4" : "right-4"} ${dark ? "text-phare" : "text-marine"}`}
        >
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M0 ${14 + i * 14} C 40 ${4 + i * 14}, 60 ${24 + i * 14}, 100 ${14 + i * 14} S 160 ${4 + i * 14}, 200 ${14 + i * 14}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* Photo principale */}
      <div className="relative z-10 shadow-[0_30px_60px_-24px_rgba(14,35,56,0.55)]">
        <PhotoFrame
          url={main?.url}
          label={main?.label || fallbackLabel}
          index={index}
          className="aspect-[4/3] rounded-sm"
          sizes="(min-width: 768px) 58vw, 100vw"
        />
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-ecume/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-marine backdrop-blur-sm">
          <span className="font-serif text-sm normal-case tracking-normal text-phare-2">N° {num}</span>
          {fallbackLabel}
        </span>
      </div>

      {/* Seconde photo qui chevauche */}
      {extra && (
        <figure
          className={`absolute bottom-0 z-20 w-[42%] md:w-[36%] ${
            reverse ? "-left-1 -rotate-2 md:-left-10" : "-right-1 rotate-2 md:-right-10"
          } transition-transform duration-700 ease-tide hover:rotate-0`}
        >
          <div className="border-[6px] border-ecume bg-ecume shadow-[0_24px_50px_-18px_rgba(14,35,56,0.6)] md:border-8">
            <PhotoFrame url={extra.url} label={extra.label} className="aspect-[3/4]" sizes="(min-width: 768px) 22vw, 42vw" />
          </div>
          <figcaption className="sr-only">{extra.label}</figcaption>
        </figure>
      )}
    </div>
  );
}
