"use client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-cookie-banner"))}
      className="my-4 rounded-full bg-marine px-5 py-3 text-sm font-semibold text-ecume hover:bg-marine-2"
    >
      Gérer mes cookies
    </button>
  );
}
