import type { Metadata } from "next";
import "./globals.css";
import GlobalTicker from "@/components/ui/GlobalTicker";
import Header from "@/components/Header";
import Footer from "@/components/ui/Footer";
import VisualInspectorOverlay from "@/components/visual-editor/VisualInspectorOverlay";

export const metadata: Metadata = {
  title: "Swaang | The Dramatic Society",
  description: "Official platform of Swaang SSTC Bhilai.",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased overflow-x-hidden max-w-[100vw] font-inter">
          <Header />
          <GlobalTicker />
          
          <main>
            {children}
          </main>

          <Footer />

          {/* ⚡ Visual Studio CMS Inspector Overlay */}
          <VisualInspectorOverlay />
      </body>
    </html>
  );
}