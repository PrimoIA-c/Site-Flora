import type { FaqGroup } from "@/config/faq";

/** Liste de questions dépliables, groupées par thème (fonctionne sans JavaScript). */
export function FaqList({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="space-y-10">
      {groups.map((g, gi) => (
        <section key={g.title} aria-labelledby={`faq-${gi}`} className="grid gap-4 md:grid-cols-12">
          <h2 id={`faq-${gi}`} className="text-2xl md:col-span-4 md:text-3xl">
            <span className="mr-3 font-serif text-base text-phare-2">{String(gi + 1).padStart(2, "0")}</span>
            {g.title}
          </h2>
          <div className="divide-y divide-marine/10 overflow-hidden rounded-lg bg-white/70 ring-1 ring-marine/10 md:col-span-8">
            {g.items.map((it) => (
              <details key={it.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium transition-colors hover:bg-sable-2/60 [&::-webkit-details-marker]:hidden">
                  {it.q}
                  <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-marine/20 text-lg leading-none transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-marine/75">{it.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
