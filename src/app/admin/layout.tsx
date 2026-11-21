import type { Metadata, Viewport } from "next";

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
  return <div className="adm-font-scope">{children}</div>;
}
