import type { Metadata } from "next";
import "./globals.css";
import GlobalTicker from "@/components/ui/GlobalTicker";
import Header from "@/components/Header";
import Footer from "@/components/ui/Footer";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased overflow-x-hidden max-w-[100vw] font-inter">
          <Header />
          <GlobalTicker />
          
          <main>
            {children}
          </main>

          <Footer />
      </body>
    </html>
  );
}