import type { Metadata } from "next";
import { Inter, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  style: ["italic", "normal"] 
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  title: "Swaang | The Dramatic Society",
  description: "Official platform of Swaang - crafting stories that live beyond the stage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <head>
        {/* Manual import for extra weights if needed */}
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${cinzel.variable} font-sans bg-black text-white antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
