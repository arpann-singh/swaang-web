"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function Ensemble({ team: parentTeam }: { team?: any[] }) {
  const [teamMembers, setTeamMembers] = useState<any[]>(parentTeam || []);

  useEffect(() => {
    // 🔥 FIXED: Changed "showOnHome" to "isSpotlight" to match your Admin Panel!
    const q = query(collection(db, "team"), where("isSpotlight", "==", true));
    
    const unsub = onSnapshot(q, (snap) => {
      const fetchedTeam = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeamMembers(fetchedTeam);
    });
    
    return () => unsub();
  }, []);

  return (
    <section id="ensemble" className="py-24 md:py-40 px-6 bg-transparent relative overflow-hidden border-b-8 border-black">
      {/* 🎬 THE CREW WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-24 opacity-[0.03] pointer-events-none select-none z-0">
        <h1 className="text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black rotate-3">
          STAGE CREW // ACTORS // STAGE CREW //
        </h1>
        <h1 className="text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black -rotate-3 -ml-20">
          ENSEMBLE // ENSEMBLE // ENSEMBLE //
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-24">
          <span className="bg-[#06D6A0] text-black px-6 py-2 border-4 border-black font-mono font-black uppercase text-xs tracking-[0.3em] shadow-[4px_4px_0px_white] mb-6 inline-block">
            THE CAST & CREW
          </span>
          <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter text-white leading-none mt-4" style={{ WebkitTextStroke: '2px black' }}>
            THE <span className="text-black border-b-8 border-black inline-block pb-2">ENSEMBLE</span>
          </h2>
          <p className="mt-8 font-mono font-bold text-sm leading-relaxed uppercase bg-black text-[#FFD166] border-4 border-white p-4 shadow-[6px_6px_0px_#06D6A0]">
            NO ONE STANDS ALONE ON THE STAGE. THE STRENGTH OF SWAANG LIES IN THE COLLECTIVE HEARTBEAT OF ITS ENSEMBLE.
          </p>
        </div>

        {/* 👥 The Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {teamMembers.length === 0 ? (
            <div className="col-span-full text-center font-black uppercase text-black/30 tracking-widest py-20 font-mono">
              Loading Featured Cast...
            </div>
          ) : (
            teamMembers.slice(0, 5).map((member, i) => {
              const memberImage = member.image || member.photo || member.imageUrl;

              return (
                <motion.div 
                  key={member.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col items-center"
                >
                  {/* SQUARED STENCIL PORTRAIT */}
                  <div className="relative mb-4 w-full aspect-square border-4 border-black bg-white shadow-[6px_6px_0px_#FF5F5F] group-hover:shadow-[8px_8px_0px_#06D6A0] transition-all group-hover:-translate-y-1 overflow-hidden">
                    {memberImage ? (
                      <img 
                        src={memberImage} 
                        alt={member.name || "Performer"} 
                        className="w-full h-full object-cover transition-all duration-500 scale-105 group-hover:scale-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono font-black text-black/20 uppercase bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#FFF_10px,#FFF_20px)] p-2 text-center text-xs">NO ID</div>
                    )}
                    {/* Overlay Decal */}
                    <div className="absolute top-2 left-2 bg-[#FFD166] border-2 border-black px-2 py-0.5 font-mono font-black text-[10px] uppercase text-black z-10 shadow-[2px_2px_0px_black]">
                      #00{i+1}
                    </div>
                  </div>
                  
                  <h4 className="font-mono font-black text-sm uppercase text-black tracking-widest text-center mt-2 group-hover:text-[#FF5F5F] transition-colors">
                    {member.name || "Performer"}
                  </h4>
                  <p className="text-xs font-mono font-bold text-[#FF5F5F] uppercase tracking-widest mt-1 text-center">
                    {member.role || "Member"}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="mt-20 text-center relative z-20">
          <Link href="/team" className="group flex items-center justify-center gap-4 bg-white text-black border-8 border-black px-8 py-4 max-w-sm mx-auto shadow-[12px_12px_0px_#FF5F5F] hover:shadow-[6px_6px_0px_#FF5F5F] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all">
            <span className="font-mono font-black uppercase tracking-[0.2em] text-lg">VIEW FULL CREW</span>
            <span className="font-black text-xl group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}