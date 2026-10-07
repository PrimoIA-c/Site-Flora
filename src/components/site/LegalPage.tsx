import type { ReactNode } from "react";

/** Mise en page commune des pages légales. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section className="bg-ecume pb-24 pt-28 md:pt-40">
      <div className="container-x max-w-3xl">
        <p className="eyebrow mb-5 flex items-center gap-3 text-granite">
          <span className="h-px w-8 bg-granite" /> Informations légales
        </p>
        <h1 className="text-4xl md:text-6xl">{title}</h1>
        <p className="mt-4 text-sm text-granite">Dernière mise à jour : {updated}</p>
        <div className="mt-6 rounded-md border border-phare bg-phare/10 p-4 text-sm">
          Les passages <span className="todo">[À COMPLÉTER]</span> doivent être renseignés avant la mise en ligne. Ce modèle ne remplace pas
          l&apos;avis d&apos;un professionnel du droit.
        </div>
        <div className="prose-legal mt-10">{children}</div>
      </div>
    </section>
  );
}

/** Champ à compléter, surligné. */
export function T({ children = "À COMPLÉTER" }: { children?: ReactNode }) {
  return <span className="todo">[{children}]</span>;
}
