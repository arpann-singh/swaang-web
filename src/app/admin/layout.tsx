import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";

// Fonts are scoped to the admin area only — the public site keeps its own typography.
const display = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--adm-font-display",
  display: "swap",
});

const ui = Inter({
  subsets: ["latin"],
  variable: "--adm-font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swaang Studio | Admin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${ui.variable}`}>{children}</div>;
}
