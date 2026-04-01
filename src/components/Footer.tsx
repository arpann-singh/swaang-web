"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const Footer = () => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "footer"), (doc) => {
      if (doc.exists()) setConfig(doc.data());
    });
  }, []);

  return (
    <footer className="bg-white border-t-8 border-[#2D2D2D] pt-20 pb-10 px-6 mt-40">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        <div className="flex flex-col items-start gap-8">
          {/* DUAL FOOTER LOGOS */}
          <div className="flex items-center gap-4 bg-white border-4 border-[#2D2D2D] p-4 rounded-[2rem] shadow-[10px_10px_0px_#2D2D2D] rotate-2">
             <img src="/club-logo.png" alt="Swaang Club" className="w-16 h-16 object-contain" onError={(e) => e.currentTarget.src='https://placehold.co/100?text=S'} />
             <div className="w-[3px] h-12 bg-[#2D2D2D]/10" />
             <img src="/college-logo.png" alt="SSTC College" className="w-16 h-16 object-contain" onError={(e) => e.currentTarget.src='https://placehold.co/100?text=C'} />
          </div>
          
          <div>
            <h2 className="font-cinzel text-4xl font-black text-[#2D2D2D] tracking-tighter uppercase">SWAANG.</h2>
            <p className="text-[#2D2D2D] text-[10px] font-black uppercase tracking-widest mt-2 leading-relaxed">
              {config?.address || "SSTC JUNWANI, BHILAI, CG"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[#FF5F5F] text-[10px] font-black uppercase tracking-[0.3em]">Direct Inbox</h4>
          <p className="text-[#2D2D2D] font-black text-sm">{config?.phone || "Phone not set"}</p>
          <p className="text-[#2D2D2D] font-bold text-xs underline underline-offset-4">{config?.email || "Email not set"}</p>
        </div>

        <div className="space-y-6">
          <h4 className="text-[#06D6A0] text-[10px] font-black uppercase tracking-[0.3em]">Social Canvas</h4>
          <div className="flex gap-4">
             {/* Instagram Button with Explicit Text Styling */}
             <a 
               href={config?.instagram || "#"} 
               target="_blank" 
               className="bg-white border-2 border-[#2D2D2D] px-6 py-3 rounded-xl shadow-[4px_4px_0px_#2D2D2D] font-black text-[10px] uppercase text-[#2D2D2D] hover:translate-y-1 transition-all"
             >
               Instagram
             </a>
             
             {/* YouTube Button with Explicit Text Styling */}
             <a 
               href={config?.youtube || "#"} 
               target="_blank" 
               className="bg-white border-2 border-[#2D2D2D] px-6 py-3 rounded-xl shadow-[4px_4px_0px_#2D2D2D] font-black text-[10px] uppercase text-[#2D2D2D] hover:translate-y-1 transition-all"
             >
               YouTube
             </a>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto mt-24 pt-10 border-t-2 border-[#2D2D2D]/10 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400">© 2026 Swaang • Shri Shankaracharya Technical Campus</p>
      </div>
    </footer>
  );
};
export default Footer;
