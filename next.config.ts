import type { NextConfig } from "next";

// Autorise les images servies par Supabase Storage (domaine déduit de l'URL du projet).
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  // Métadonnées (title, description) toujours dans le <head>, pour tous les robots et outils d'audit.
  htmlLimitedBots: /.*/,
  experimental: {
    serverActions: { bodySizeLimit: "10mb" }, // upload de photos depuis l'admin
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
