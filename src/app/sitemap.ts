import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/stripe";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", "/logement", "/galerie", "/infos-pratiques", "/en", "/reserver", "/contact", "/mentions-legales", "/conditions-generales", "/confidentialite", "/cookies"].map(
    (p) => ({ url: `${base}${p}`, changeFrequency: p === "/reserver" ? "daily" : "monthly", priority: p === "" ? 1 : 0.6 }),
  );
}
