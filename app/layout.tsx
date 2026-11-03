import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://flipbook.studiogalaxy.org"),
  title: { default: "Flipbook — a library for young readers", template: "%s · Flipbook" },
  description:
    "Pick a subject, choose a class, turn real pages. A demo learning library by Studio Galaxy, made with our Flipbook SDK.",
};

export const viewport: Viewport = { themeColor: "#f7f0e7" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
