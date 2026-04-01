"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const Header = () => {
  const [isAuditionOpen, setIsAuditionOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Listen to site_config for the Master Toggle
    const unsub = onSnapshot(doc(db, "settings", "site_config"), (doc) => {
      if (doc.exists()) setIsAuditionOpen(doc.data().auditionsOpen);
    });
    return () => unsub();
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed top-0 w-full z-[100]">
      <div className="px-4 md:px-10 pt-5">
        <header className="max-w-7xl mx-auto bg-white border-4 border-[#2D2D2D] rounded-full shadow-[8px_8px_0px_#2D2D2D] py-3 px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-5 group">
            <div className="flex items-center gap-3 bg-[#FFF9F0] border-2 border-[#2D2D2D] p-2 rounded-2xl shadow-[4px_4px_0px_#2D2D2D] group-hover:rotate-2 transition-transform">
               <img src="/club-logo.png" alt="Swaang" className="w-9 h-9 object-contain" />
               <div className="w-[2px] h-6 bg-[#2D2D2D]/15" />
               <img src="/college-logo.png" alt="SSTC" className="w-9 h-9 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black text-[#2D2D2D] tracking-tighter leading-none">SWAANG</span>
              <span className="text-[10px] font-black text-[#FF5F5F] uppercase tracking-[0.25em] leading-none mt-1.5">SSTC BHILAI</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-10">
            {[{ name: "Events", href: "/events" }, { name: "Ensemble", href: "/members" }, { name: "Gallery", href: "/gallery" }].map((item) => (
              <Link key={item.name} href={item.href} className={`text-[12px] font-black uppercase tracking-[0.15em] transition-all hover:text-[#FF5F5F] ${pathname === item.href ? "text-[#FF5F5F]" : "text-[#2D2D2D]"}`}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <AnimatePresence>
              {isAuditionOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Link href="/auditions">
                    <button className="bg-[#06D6A0] text-[#2D2D2D] border-2 border-[#2D2D2D] px-6 py-2.5 rounded-full font-black text-[11px] uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none transition-all">
                      Join
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <Link href="/contact">
              <button className="bg-[#FFD166] text-[#2D2D2D] border-2 border-[#2D2D2D] px-7 py-2.5 rounded-full font-black text-[11px] uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none transition-all">
                Contact
              </button>
            </Link>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;
