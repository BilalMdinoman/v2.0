import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "V.2.0 — Multi-Agent Trading Intelligence",
  description:
    "Seven-agent autonomous AI trading system. Paper trading Solana memecoins with real market data.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#040a13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
