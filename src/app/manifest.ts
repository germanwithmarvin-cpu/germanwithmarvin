import type { MetadataRoute } from "next";

// Web-App-Manifest → macht German Simplified installierbar (Home-Bildschirm,
// Vollbild ohne Browser-Leiste). Next verlinkt es automatisch.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "German Simplified — Learn German with Marvin",
    short_name: "German Simplified",
    description:
      "Video lessons, interactive exercises, a flashcard trainer and reading stories — from A1 to B2.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff1d2",
    theme_color: "#fff1d2",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
