import type { MetadataRoute } from "next";

// Erzeugt /robots.txt. Öffentliche Seiten crawlbar; Admin/API gesperrt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: "https://www.germanwithmarvin.com/sitemap.xml",
  };
}
