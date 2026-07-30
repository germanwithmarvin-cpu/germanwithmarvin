import type { MetadataRoute } from "next";

// Erzeugt /sitemap.xml mit den öffentlichen Seiten (Marketing + Rechtliches).
const base = "https://www.germanwithmarvin.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/agb`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
