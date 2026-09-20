import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slipwise — Slips, sorted.",
  description: "Scan, save and organise your business slips. Less paperwork. More peace of mind.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Slipwise" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#216b45" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
