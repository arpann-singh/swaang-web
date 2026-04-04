"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#1A1A1A] border-t-[8px] md:border-t-[12px] border-[#0A0A0A] pt-20 pb-10 px-6 text-[#FFF9F0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
          
          {/* COLUMN 1: THE BRAND */}
          <div className="md:col-span-5 flex flex-col items-start">
            <h2 className="font-black uppercase tracking-tighter text-5xl md:text-6xl leading-[0.85] mb-8">
              <span className="block text-[#FFF9F0] drop-shadow-[3px_3px_0px_#FF5F5F]">SWAANG</span>
              <span className="block text-transparent stroke-text italic opacity-60 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)] py-1" style={{ WebkitTextStroke: '2px #FFF9F0' }}>THE</span>
              <span className="block text-[#FFF9F0] drop-shadow-[3px_3px_0px_#FF5F5F]">DRAMATIC</span>
              <span className="block text-[#FFF9F0] drop-shadow-[3px_3px_0px_#FF5F5F]">SOCIETY.</span>
            </h2>

            <h3 className="font-black uppercase tracking-widest text-[#06D6A0] text-sm md:text-base mb-6 italic">
              Connect With The Stage
            </h3>

            <ul className="space-y-3 border-l-4 border-[#2D2D2D] pl-4">
              <li className="relative group">
                <span className="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-1 h-full bg-[#FF5F5F] opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="font-bold text-xs md:text-sm tracking-widest uppercase text-white">Shri Shankaracharya Technical Campus</p>
              </li>
              <li className="relative group">
                <span className="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-1 h-full bg-[#06D6A0] opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="font-bold text-xs md:text-sm tracking-widest uppercase text-white">+91 7987755520</p>
              </li>
              <li className="relative group">
                <span className="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-1 h-full bg-[#FFD166] opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="font-bold text-xs md:text-sm tracking-widest uppercase text-[#06D6A0] hover:text-[#FFD166] transition-colors cursor-pointer">swaangsstc2110@gmail.com</p>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: QUICK NAVIGATION */}
          <div className="md:col-span-3 flex flex-col md:items-start">
            <h3 className="font-black uppercase tracking-[0.2em] text-[#FFD166] text-xs mb-6">Quick Navigation</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/events" className="font-black uppercase text-sm md:text-base tracking-widest text-white hover:text-[#FFD166] hover:translate-x-2 transition-all flex items-center gap-2">
                  The Playbill
                </Link>
              </li>
              <li>
                <Link href="/team" className="font-black uppercase text-sm md:text-base tracking-widest text-white hover:text-[#FFD166] hover:translate-x-2 transition-all flex items-center gap-2">
                  The Ensemble
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="font-black uppercase text-sm md:text-base tracking-widest text-white hover:text-[#FFD166] hover:translate-x-2 transition-all flex items-center gap-2">
                  The Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SOCIAL HUB */}
          <div className="md:col-span-4 flex flex-col md:items-start">
            <h3 className="font-black uppercase tracking-[0.2em] text-[#06D6A0] text-xs mb-6">Social Hub</h3>
            
            <div className="flex flex-wrap gap-4">
              {/* Instagram Button */}
              <a href="https://instagram.com/swaangclub" target="_blank" rel="noreferrer" className="flex items-center gap-3 border-2 border-white hover:border-[#FF5F5F] hover:bg-[#FF5F5F] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                Instagram
              </a>

              {/* YouTube Button */}
              <a href="https://youtube.com/@swaangclub" target="_blank" rel="noreferrer" className="flex items-center gap-3 border-2 border-white hover:border-[#FFD166] hover:bg-[#FFD166] hover:text-[#1A1A1A] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <path d="m10 15 5-3-5-3z"/>
                </svg>
                YouTube
              </a>
            </div>
          </div>

        </div>

        {/* 🎬 BOTTOM STAGE LINE */}
        <div className="border-t-2 border-[#2D2D2D] pt-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          
          <div className="text-center md:text-left">
            <p className="font-bold text-xs uppercase tracking-widest text-white/60 mb-2">
              © {new Date().getFullYear()} SWAANG DRAMA CLUB • SSTC BHILAI
            </p>
          </div>

          <div className="text-center md:text-right group cursor-default">
            <p className="font-black text-[8px] uppercase tracking-[0.4em] text-white/50 mb-1 group-hover:text-white transition-colors">
              Developed By
            </p>
            <p className="font-black text-sm uppercase tracking-widest text-[#06D6A0] group-hover:text-[#FFD166] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors">
              Arpan Singh
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}