import type { Metadata } from "next";
import "./globals.css";
import GlobalTicker from "@/components/ui/GlobalTicker";
import Header from "@/components/Header";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Swaang | The Dramatic Society",
  description: "Official platform of Swaang SSTC Bhilai.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FFF9F0] text-[#2D2D2D] antialiased">
          <Header />
          {children}
          <Footer /> {/* 👈 This is now global! */}
      </body>
    </html>
  );
}
