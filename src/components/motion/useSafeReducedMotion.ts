"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Comme `useReducedMotion`, mais renvoie `false` jusqu'à l'hydratation :
 * le HTML serveur et le premier rendu client sont ainsi identiques (pas d'erreur d'hydratation).
 */
export function useSafeReducedMotion(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && Boolean(reduce);
}
