"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const themes: any = {
  green: { border: "border-[#06D6A0]", text: "text-[#06D6A0]" },
  red: { border: "border-[#FF5F5F]", text: "text-[#FF5F5F]" },
  yellow: { border: "border-[#FFD166]", text: "text-[#FFD166]" }
};

export default function CreditsPage() {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Swapped to onSnapshot for Real-Time, Cache-Busting Updates!
    const unsubscribe = onSnapshot(doc(db, "settings", "credits"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setDevelopers(docSnap.data().list);
      } else {
        setDevelopers([]); // Safely handle empty state
      }
      setLoading(false);
    });

    // Cleanup the listener when leaving the page
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#1A1A1A] pt-32 pb-20 px-6 text-[#FFF9F0]">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-white/20" />
            <p className="font-black uppercase tracking-[0.4em] text-[10px] md:text-sm text-white/50">The Code Behind The Curtain</p>
            <div className="h-[2px] w-12 bg-white/20" />
          </div>
          <h1 className="font-cinzel text-5xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            System <br className="md:hidden"/> <span className="text-white/40 italic">Architects</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="text-center text-[#06D6A0] font-black uppercase animate-pulse text-2xl">Loading Cast...</div>
        ) : developers.length === 0 ? (
          <div className="text-center text-white/30 font-black uppercase text-xl">No Architects Assigned Yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((dev, index) => {
              const theme = themes[dev.theme] || themes.green;
              const contributionsList = dev.contributions ? dev.contributions.split(",").map((c: string) => c.trim()) : [];

              return (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className={`group relative bg-white/5 border-2 border-white/10 p-8 rounded-[2rem] backdrop-blur-sm hover:bg-white/10 transition-all duration-300 ${theme.border} hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]`}
                >
                  <div className="absolute -top-4 left-8 bg-[#1A1A1A] px-4 py-1 border-2 border-white/20 rounded-full">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${theme.text}`}>{dev.department}</span>
                  </div>
                  <div className="mb-8 mt-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-1 break-words">{dev.name}</h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-white/50">{dev.role}</p>
                  </div>
                  <div className="space-y-4 mb-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/10 pb-2">System Contributions</h3>
                    <ul className="space-y-3">
                      {contributionsList.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 ${theme.text}`} />
                          <span className="text-sm font-bold opacity-80 leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-4 pt-6 border-t border-white/10 absolute bottom-8 left-8 right-8">
                    {dev.github && <a href={dev.github} target="_blank" className="text-xs font-black uppercase tracking-widest hover:text-white transition-colors text-white/40">GitHub ↗</a>}
                    {dev.linkedin && <a href={dev.linkedin} target="_blank" className="text-xs font-black uppercase tracking-widest hover:text-white transition-colors text-white/40">LinkedIn ↗</a>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-20 text-center">
          <Link href="/" className="inline-block border-2 border-white/20 text-white font-black uppercase px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all tracking-widest text-sm">
            Return to Stage
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
