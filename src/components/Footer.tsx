"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Footer() {
  const pathname = usePathname();

  // 🛑 THE KILL SWITCH: Keeps the footer hidden inside the Admin Panel
  if (pathname?.startsWith("/admin")) return null;

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://instagram.com/swaangclub", // Update with actual Swaang link
      color: "hover:bg-[#FF5F5F] hover:text-white",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6 shrink-0">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      )
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@swaangclub", // Update with actual Swaang link
      color: "hover:bg-[#FFD166] hover:text-black",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6 shrink-0">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
          <path d="m10 15 5-3-5-3z"/>
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/swaang", // Update with actual Swaang link
      color: "hover:bg-[#06D6A0] hover:text-black",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6 shrink-0">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect width="4" height="12" x="2" y="9"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      )
    },
    {
      name: "Email Us",
      href: "/contact", 
      color: "hover:bg-[#2D2D2D] hover:text-white",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6 shrink-0">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-[#FFF9F0] border-t-[8px] border-[#2D2D2D] pt-16 pb-8 px-6 text-[#2D2D2D] relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 mb-16">
          
          {/* 🏢 BRANDING SECTION */}
          <div className="text-center md:text-left">
            <h2 className="font-cinzel text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Swaang</h2>
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-[#FF5F5F] mb-6">The Dramatic Society of SSTC</p>
            <p className="font-bold text-sm max-w-sm opacity-80 leading-relaxed mx-auto md:mx-0">
              Where stories come alive. We are a collective of actors, writers, and technicians bringing theatrical magic to Bhilai.
            </p>
          </div>

          {/* 🔗 THE SOCIAL HUB (WITH ICONS) */}
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <h3 className="font-black uppercase tracking-widest text-[10px] opacity-50 mb-4 border-b-2 border-[#2D2D2D]/20 pb-2">Connect with the Cast</h3>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-4 w-full">
              {socialLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  target={link.name === "Email Us" ? "_self" : "_blank"}
                  rel="noreferrer"
                  className={`flex items-center gap-2 md:gap-3 bg-white border-2 md:border-4 border-[#2D2D2D] px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-[4px_4px_0px_#2D2D2D] font-black uppercase text-[10px] md:text-xs tracking-widest transition-all ${link.color} hover:translate-y-1 hover:translate-x-1 hover:shadow-none`}
                >
                  {link.svg}
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 🎬 BOTTOM STAGE LINE */}
        <div className="border-t-4 border-[#2D2D2D] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">
          <p>© {new Date().getFullYear()} Swaang SSTC. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/credits" className="hover:text-[#FF5F5F] hover:underline transition-colors">Credits</Link>
            <span>//</span>
            <Link href="/audition" className="hover:text-[#06D6A0] hover:underline transition-colors">Join Us</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
