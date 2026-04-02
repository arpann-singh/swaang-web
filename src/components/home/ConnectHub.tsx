"use client";
import { motion } from "framer-motion";

export default function ConnectHub({ data }: { data: any }) {
  const socials = [
    { name: "Instagram", url: data.instagram, color: "bg-[#FF5F5F]" },
    { name: "YouTube", url: data.youtube, color: "bg-[#FF0000]" },
    { name: "LinkedIn", url: data.linkedin, color: "bg-[#0077B5]" }
  ];

  return (
    <footer className="bg-[#2D2D2D] text-[#FFF9F0] py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="space-y-12">
          <h2 className="font-cinzel text-8xl md:text-[10rem] font-black uppercase leading-[0.8] tracking-tighter">
            SWA <br/> ANG.
          </h2>
          <div className="space-y-4">
            <p className="text-4xl font-black uppercase italic tracking-tighter text-[#06D6A0]">Connect With The Stage</p>
            <p className="text-xl opacity-60 font-medium max-w-md">{data.address || "SSTC Junwani, Durg (Chhattisgarh)"}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {socials.filter(s => s.url).map((s, i) => (
              <a key={i} href={s.url} target="_blank" className="group relative h-20">
                <div className={`absolute inset-0 ${s.color} translate-x-2 translate-y-2 rounded-2xl opacity-20 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10 h-full border-2 border-white/20 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-xl hover:border-white transition-colors">
                  {s.name}
                </div>
              </a>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-bold opacity-30 uppercase tracking-widest text-xs">© 2026 Swaang Drama Club • SSTC Bhilai</p>
            <div className="flex gap-8 font-black uppercase text-[10px] tracking-widest">
              <span>Privacy</span>
              <span>Credits</span>
              <span className="text-[#06D6A0]">Curated by Arpan Singh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
