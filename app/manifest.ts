import type { MetadataRoute } from "next";

// Makes Flipbook installable ("Add to Home Screen" / "Install app"). Icons: public/pwa, drawn from icon.svg there;
// they fill the whole square, so phones can crop them to any shape without cutting the logo.
// iPhones read app/apple-icon.png and the appleWebApp settings in app/layout.tsx instead.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flipbook",
    short_name: "Flipbook",
    description: "Pick a subject, choose a class, turn real pages.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f0e7",
    theme_color: "#f7f0e7",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
