"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Footer() {
  const pathname = usePathname();
  const [data, setData] = useState<any>({});

  // Fetch settings from Firebase
  useEffect(() => {
    return onSnapshot(doc(db, "settings", "homepage"), (d) => setData(d.data() || {}));
  }, []);

  // 🛑 THE KILL SWITCH: Hide in Admin
  if (pathname?.startsWith("/admin")) return null;

  // SVG Icons combined with Firebase dynamic URLs
  const socials = [
    { 
      name: "Instagram", 
      url: data.instagram, 
      color: "hover:bg-[#FF5F5F] hover:border-[#FF5F5F] hover:text-white",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      )
    },
    { 
      name: "YouTube", 
      url: data.youtube, 
      color: "hover:bg-[#FFD166] hover:border-[#FFD166] hover:text-[#1A1A1A]",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
          <path d="m10 15 5-3-5-3z"/>
        </svg>
      )
    },
    { 
      name: "LinkedIn", 
      url: data.linkedin, 
      color: "hover:bg-[#06D6A0] hover:border-[#06D6A0] hover:text-[#1A1A1A]",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect width="4" height="12" x="2" y="9"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      )
    },
    { 
      name: "Twitter", 
      url: data.twitter, 
      color: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-[#1A1A1A] border-t-[8px] md:border-t-[12px] border-[#0A0A0A] pt-20 pb-10 px-6 text-[#FFF9F0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-16">
          
          {/* 🎭 LEFT: COMPACT BRANDING */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="font-cinzel text-[10vw] lg:text-[4.5rem] font-black uppercase leading-[0.9] tracking-tighter drop-shadow-[5px_5px_0px_#FF5F5F]">
              SWAANG <br/>
              <span className="text-white/20 italic">THE</span> <br/>
              DRAMATIC <br/>
              SOCIETY.
            </h2>
            
            <div className="space-y-4">
              <p className="text-xl md:text-2xl font-black uppercase italic text-[#06D6A0]">
                Connect With The Stage
              </p>
              <ul className="space-y-3 border-l-4 border-[#2D2D2D] pl-4 mt-4">
                <li className="relative group">
                  <span className="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-1 h-full bg-[#FF5F5F] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="font-bold text-xs md:text-sm tracking-widest uppercase text-white/90">{data.address || "SSTC Junwani, Durg (C.G.)"}</p>
                </li>
                <li className="relative group">
                  <span className="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-1 h-full bg-[#06D6A0] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="font-bold text-xs md:text-sm tracking-widest uppercase text-white/90">{data.phone || "+91 79877 55520"}</p>
                </li>
                <li className="relative group">
                  <span className="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-1 h-full bg-[#FFD166] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="font-bold text-xs md:text-sm tracking-widest uppercase text-[#06D6A0] hover:text-[#FFD166] transition-colors cursor-pointer">{data.email || "swaangsstc2110@gmail.com"}</p>
                </li>
              </ul>
            </div>
          </div>

          {/* 📱 RIGHT: NAVIGATION & SOCIAL HUB */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              
              {/* Quick Links */}
              <div className="space-y-6">
                <h3 className="text-[#FFD166] font-black uppercase text-xs tracking-[0.3em]">Quick Navigation</h3>
                <div className="flex flex-col gap-4 font-black uppercase text-sm md:text-lg tracking-tighter">
                  <Link href="/events" className="hover:translate-x-2 transition-transform hover:text-[#FFD166] flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#FFD166] rounded-full"></span> The Playbill
                  </Link>
                  <Link href="/team" className="hover:translate-x-2 transition-transform hover:text-[#06D6A0] flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#06D6A0] rounded-full"></span> The Ensemble
                  </Link>
                  <Link href="/gallery" className="hover:translate-x-2 transition-transform hover:text-[#FF5F5F] flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#FF5F5F] rounded-full"></span> The Gallery
                  </Link>
                  <Link href="/credits" className="hover:translate-x-2 transition-transform hover:text-[#FFF9F0] flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#FFF9F0] rounded-full"></span> The Credits
                  </Link>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="space-y-6">
                <h3 className="text-[#06D6A0] font-black uppercase text-xs tracking-[0.3em]">Social Hub</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {socials.filter(s => s.url).map((s, i) => (
                    <a 
                      key={i} 
                      href={s.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`flex items-center gap-3 px-5 py-3 border-2 border-white/20 text-white/90 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 group ${s.color}`}
                    >
                      {s.svg}
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Accent Line */}
            <div className="mt-16 h-1 w-full bg-[#FF5F5F]/20 rounded-full" />
          </div>
        </div>

        {/* 📜 BOTTOM BAR */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
          
          <p className="font-bold text-xs uppercase tracking-widest text-white/60 mb-2 md:mb-0">
            © {new Date().getFullYear()} Swaang Drama Club • SSTC Bhilai
          </p>
          
          <div className="text-center md:text-right group cursor-default">
            <p className="font-black text-[8px] uppercase tracking-[0.4em] text-white/50 mb-1 group-hover:text-white transition-colors">
              Developed By
            </p>
            <p className="font-black text-sm uppercase tracking-widest text-[#06D6A0] group-hover:text-[#FFD166] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors">
              {data.curatorName || "Arpan Singh"}
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
