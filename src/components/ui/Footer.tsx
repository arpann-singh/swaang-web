"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Footer() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "homepage"), (d) => setData(d.data() || {}));
  }, []);

  const socials = [
    { name: "Instagram", url: data.instagram, color: "hover:bg-[#E4405F]" },
    { name: "YouTube", url: data.youtube, color: "hover:bg-[#FF0000]" },
    { name: "LinkedIn", url: data.linkedin, color: "hover:bg-[#0077B5]" },
    { name: "Twitter", url: data.twitter, color: "hover:bg-[#1DA1F2]" }
  ];

  return (
    <footer className="bg-[#2D2D2D] text-[#FFF9F0] pt-20 pb-10 px-6 border-t-[12px] border-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* 🎭 LEFT: COMPACT BRANDING (Col-span 5) */}
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
              <div className="space-y-2 opacity-70 font-bold uppercase tracking-widest text-[9px] md:text-[11px] max-w-sm">
                <p className="border-l-4 border-[#FF5F5F] pl-4">{data.address || "SSTC Junwani, Durg (C.G.)"}</p>
                <p className="border-l-4 border-white/20 pl-4">{data.phone || "+91 79877 55520"}</p>
                <p className="border-l-4 border-[#06D6A0] pl-4 text-[#06D6A0]">{data.email || "swaangsstc2110@gmail.com"}</p>
              </div>
            </div>
          </div>

          {/* 📱 RIGHT: NAVIGATION & SOCIAL HUB (Col-span 7) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {/* Quick Links */}
              <div className="space-y-6">
                <h3 className="text-[#FFD166] font-black uppercase text-xs tracking-[0.3em]">Quick Navigation</h3>
                <div className="flex flex-col gap-3 font-black uppercase text-sm md:text-lg tracking-tighter">
                  <Link href="/events" className="hover:translate-x-2 transition-transform hover:text-[#FF5F5F]">🎭 The Playbill</Link>
                  <Link href="/members" className="hover:translate-x-2 transition-transform hover:text-[#06D6A0]">👥 The Ensemble</Link>
                  <Link href="/gallery" className="hover:translate-x-2 transition-transform hover:text-[#FFD166]">🖼️ The Gallery</Link>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="space-y-6">
                <h3 className="text-[#06D6A0] font-black uppercase text-xs tracking-[0.3em]">Social Hub</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socials.filter(s => s.url).map((s, i) => (
                    <a 
                      key={i} 
                      href={s.url} 
                      target="_blank" 
                      className={`h-12 flex items-center justify-center border-2 border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${s.color} hover:border-white hover:scale-105`}
                    >
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
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="font-bold opacity-30 uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
            © 2026 Swaang Drama Club • SSTC Bhilai
          </p>
          <div className="flex flex-col md:items-end">
             <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Developed By</span>
             <span className="text-[#06D6A0] font-black uppercase text-xs md:text-base tracking-tighter">
               {data.curatorName || "Arpan Singh"}
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
