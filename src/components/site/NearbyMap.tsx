"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { CATEGORIES, EN_TEXT, NEARBY_PLACES, type PlaceCategory } from "@/config/nearby-places";

type LeafletNS = typeof import("leaflet");

const homeIcon = (L: LeafletNS) =>
  L.divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div style="position:relative;width:44px;height:44px">
      <span class="home-ping" style="position:absolute;inset:0;border-radius:9999px;background:#f2b84b"></span>
      <span style="position:absolute;inset:4px;border-radius:9999px;background:#0e2338;border:3px solid #f2b84b;display:grid;place-items:center;box-shadow:0 10px 24px -8px rgba(14,35,56,.7)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f7f5f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13a7 7 0 0 0 14 0M8 11h8"/></svg>
      </span></div>`,
  });

const pinIcon = (L: LeafletNS, color: string, n: number) =>
  L.divIcon({
    className: "",
    iconSize: [28, 34],
    iconAnchor: [14, 32],
    popupAnchor: [0, -30],
    html: `<div style="width:28px;height:34px;filter:drop-shadow(0 6px 8px rgba(14,35,56,.35))">
      <svg viewBox="0 0 28 34" width="28" height="34"><path d="M14 33C14 33 2 21 2 13a12 12 0 0 1 24 0c0 8-12 20-12 20z" fill="${color}" stroke="#f7f5f0" stroke-width="2"/>
      <text x="14" y="17" text-anchor="middle" font-size="11" font-weight="700" fill="#f7f5f0" font-family="system-ui">${n}</text></svg></div>`,
  });

/**
 * Carte du quartier (fond OpenStreetMap / CARTO teinté aux couleurs du site),
 * avec le logement, les plages, le marché, les commerces et le patrimoine, filtrables par catégorie.
 */
export function NearbyMap({ lang = "fr" }: { lang?: "fr" | "en" }) {
  const en = lang === "en";
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const [cat, setCat] = useState<PlaceCategory | "tout">("tout");
  const [ready, setReady] = useState(false);

  const places = useMemo(
    () => NEARBY_PLACES.map((p, i) => ({ ...p, name: en ? EN_TEXT[p.name] ?? p.name : p.name, note: p.note && en ? EN_TEXT[p.note] ?? p.note : p.note, distance: en ? p.distance.replace(",", ".") : p.distance, n: i + 1 })),
    [en],
  );
  const visible = useMemo(() => (cat === "tout" ? places : places.filter((p) => p.category === cat)), [cat, places]);

  // Création de la carte (une seule fois, côté navigateur)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current || mapRef.current) return;
      LRef.current = L;
      const { lat, lng } = siteConfig.location;
      const map = L.map(el.current, {
        center: [lat - 0.002, lng - 0.004],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });
      // Fond OpenStreetMap (gratuit, sans clé), teinté aux couleurs du site par CSS (.map-sea)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">les contributeurs OpenStreetMap</a>',
      }).addTo(map);
      L.marker([lat, lng], { icon: homeIcon(L), zIndexOffset: 1000, title: "Le logement" })
        .addTo(map)
        .bindPopup(`<strong>${siteConfig.name}</strong><br>${siteConfig.location.address}`);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Marqueurs selon le filtre
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;
    layer.clearLayers();
    const pts: [number, number][] = [[siteConfig.location.lat, siteConfig.location.lng]];
    visible.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: pinIcon(L, CATEGORIES[p.category].color, p.n), title: p.name })
        .addTo(layer)
        .bindPopup(`<strong>${p.name}</strong><br>${p.distance} · ${p.walk} ${en ? "walk" : "à pied"}${p.note ? `<br><em>${p.note}</em>` : ""}`);
      pts.push([p.lat, p.lng]);
    });
    // « Tout » : vue rapprochée sur le logement ; une catégorie : on cadre ses lieux
    if (cat === "tout") map.setView([siteConfig.location.lat - 0.0008, siteConfig.location.lng - 0.0012], 16);
    else map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 17 });
  }, [ready, visible, cat, en]);

  const focus = (lat: number, lng: number, name: string) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([lat, lng], 17, { duration: 0.8 });
    layerRef.current?.eachLayer((m) => {
      const marker = m as import("leaflet").Marker;
      if (marker.options.title === name) setTimeout(() => marker.openPopup(), 850);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {/* Filtres */}
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={en ? "Filter places" : "Filtrer les lieux"}>
          {(["tout", ...Object.keys(CATEGORIES)] as (PlaceCategory | "tout")[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                cat === c ? "border-marine bg-marine text-ecume" : "border-marine/20 bg-ecume hover:border-marine/50"
              }`}
            >
              {c !== "tout" && <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORIES[c].color }} />}
              {c === "tout" ? (en ? "All" : "Tout") : en ? CATEGORIES[c].labelEn : CATEGORIES[c].label}
            </button>
          ))}
        </div>
        <div className="map-sea relative overflow-hidden rounded-lg border border-marine/10 shadow-[0_30px_60px_-30px_rgba(14,35,56,0.5)]">
          <div ref={el} className="h-[380px] w-full md:h-[520px]" role="region" aria-label={en ? "Map of the Saint-Servan neighbourhood" : "Carte du quartier de Saint-Servan"} />
          <div className="pointer-events-none absolute right-3 top-3 z-[400] rounded-full bg-marine/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-ecume">
            ⚓ {siteConfig.location.coordinates}
          </div>
        </div>
      </div>

      {/* Liste */}
      <ol className="max-h-[520px] space-y-1 overflow-y-auto pr-1 lg:col-span-4 lg:mt-12">
        {visible.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              onClick={() => focus(p.lat, p.lng, p.name)}
              className="group flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-sable-2"
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-ecume"
                style={{ background: CATEGORIES[p.category].color }}
              >
                {p.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.name}</span>
                {p.note && <span className="block truncate text-xs text-granite">{p.note}</span>}
              </span>
              <span className="shrink-0 text-right text-xs text-granite">
                <strong className="block text-sm text-marine">{p.walk}</strong>
                {p.distance}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
