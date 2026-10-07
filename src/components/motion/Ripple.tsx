"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

/** Ajoute une onde circulaire au point de clic (respecte prefers-reduced-motion via le CSS). */
export function spawnRipple(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.2;
  const span = document.createElement("span");
  span.className = "ripple";
  span.style.width = span.style.height = `${size}px`;
  span.style.left = `${(e.clientX || rect.left + rect.width / 2) - rect.left}px`;
  span.style.top = `${(e.clientY || rect.top + rect.height / 2) - rect.top}px`;
  el.appendChild(span);
  span.addEventListener("animationend", () => span.remove());
}

type Variant = "primary" | "ghost" | "light" | "outline";

const styles: Record<Variant, string> = {
  primary: "bg-phare text-marine hover:bg-phare-2",
  ghost: "bg-transparent text-marine hover:bg-marine/5",
  light: "bg-ecume text-marine hover:bg-white",
  outline: "border border-current bg-transparent hover:bg-current/5",
};

const base =
  "ripple-host inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-semibold tracking-tight transition-[background-color,transform,box-shadow] duration-300 ease-[var(--ease-tide)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  onClick,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`${base} ${styles[variant]} ${className}`}
      onClick={(e) => {
        spawnRipple(e);
        onClick?.(e);
      }}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`} onClick={spawnRipple}>
      {children}
    </Link>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
