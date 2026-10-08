"use client";

import { usePathname } from "next/navigation";
import type { Lang } from "./i18n";

/** Langue de la page courante : anglais sous /en, français partout ailleurs. */
export function useLang(): Lang {
  const pathname = usePathname() ?? "/";
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}
