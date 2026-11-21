"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Users, Sparkles } from "lucide-react";

export default function Ensemble({ team: parentTeam }: { team?: any[] }) {
  const [teamMembers, setTeamMembers] = useState<any[]>(parentTeam || []);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "team"), where("isSpotlight", "==", true));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const fetchedTeam = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeamMembers(fetchedTeam);
      },
      (err) => console.warn("Ensemble spotlight listener warning:", err)
    );

    return () => unsub();
  }, []);

  return (
    <section
      id="ensemble"
      className="py-20 md:py-40 px-4 sm:px-6 bg-transparent relative overflow-hidden border-b-8 border-black"
    >
      {/* 🎬 KINETIC CREW WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-24 opacity-[0.04] pointer-events-none select-none z-0">
        <motion.h1
          animate={{ x: ["0%", "-40%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          className="text-[15vw] md:text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black rotate-3"
        >
          STAGE CREW // ACTORS // STAGE CREW // ACTORS // STAGE CREW //
        </motion.h1>
        <motion.h1
          animate={{ x: ["-40%", "0%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="text-[15vw] md:text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black -rotate-3 -ml-20"
        >
          ENSEMBLE // ENSEMBLE // ENSEMBLE // ENSEMBLE // ENSEMBLE //
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-24"
        >
          <span className="bg-[#06D6A0] text-black px-5 py-2 border-4 border-black font-mono font-black uppercase text-xs tracking-[0.25em] shadow-[4px_4px_0px_black] mb-5 inline-flex items-center gap-2">
            <Users size={14} />
            <span>THE CAST &amp; CREW</span>
          </span>
          <h2
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter text-white leading-none mt-2"
            style={{ WebkitTextStroke: "2px black" }}
          >
            THE{" "}
            <span className="text-black border-b-8 border-black inline-block pb-2">
              ENSEMBLE
            </span>
          </h2>
          <p className="mt-6 sm:mt-8 font-mono font-bold text-xs sm:text-sm leading-relaxed uppercase bg-black text-[#FFD166] border-4 border-black p-4 shadow-[6px_6px_0px_#06D6A0]">
            NO ONE STANDS ALONE ON THE STAGE. THE STRENGTH OF SWAANG LIES IN THE COLLECTIVE HEARTBEAT OF ITS ENSEMBLE.
          </p>
        </motion.div>

        {/* 👥 The Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
          {teamMembers.length === 0 ? (
            <div className="col-span-full text-center font-black uppercase text-black/30 tracking-widest py-20 font-mono">
              Loading Featured Cast...
            </div>
          ) : (
            teamMembers.slice(0, 5).map((member, i) => {
              const memberImage =
                member.image || member.photo || member.imageUrl;
              const isSelected = activeMemberId === member.id;

              return (
                <motion.div
                  key={member.id || i}
                  onClick={() =>
                    setActiveMemberId((prev) =>
                      prev === member.id ? null : member.id
                    )
                  }
                  initial={{
                    scale: 0.88,
                    opacity: 0,
                    y: 35,
                    rotate: i % 2 === 0 ? -3 : 3,
                  }}
                  whileInView={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                  }}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.94, rotate: i % 2 === 0 ? -2 : 2 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    delay: i * 0.07,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                  className="group flex flex-col items-center cursor-pointer select-none"
                >
                  {/* SQUARED STENCIL PORTRAIT */}
                  <div
                    className={`relative mb-3.5 w-full aspect-square border-4 border-black bg-white transition-all overflow-hidden ${
                      isSelected
                        ? "shadow-[8px_8px_0px_#06D6A0] -translate-y-1.5"
                        : "shadow-[6px_6px_0px_#FF5F5F] group-hover:shadow-[8px_8px_0px_#06D6A0] group-hover:-translate-y-1"
                    }`}
                  >
                    {memberImage ? (
                      <img
                        src={memberImage}
                        alt={member.name || "Performer"}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isSelected
                            ? "scale-100"
                            : "scale-105 group-hover:scale-100"
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono font-black text-black/20 uppercase bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#FFF_10px,#FFF_20px)] p-2 text-center text-xs">
                        NO ID
                      </div>
                    )}

                    {/* Top Decal */}
                    <div className="absolute top-2 left-2 bg-[#FFD166] border-2 border-black px-2 py-0.5 font-mono font-black text-[10px] uppercase text-black z-10 shadow-[2px_2px_0px_black]">
                      #00{i + 1}
                    </div>

                    {/* Interactive On-Stage Badge on Tap */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-2 left-2 right-2 bg-black text-[#06D6A0] border-2 border-black px-2 py-1 font-mono font-black text-[9px] uppercase tracking-wider text-center shadow-[2px_2px_0px_#06D6A0] z-20 flex items-center justify-center gap-1"
                        >
                          <Sparkles size={10} />
                          <span>SPOTLIGHT CAST</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <h4
                    className={`font-mono font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest text-center mt-1 transition-colors ${
                      isSelected
                        ? "text-[#FF5F5F]"
                        : "text-black group-hover:text-[#FF5F5F]"
                    }`}
                  >
                    {member.name || "Performer"}
                  </h4>
                  <p className="text-[11px] sm:text-xs font-mono font-bold text-[#FF5F5F] uppercase tracking-wider mt-0.5 text-center">
                    {member.role || "Member"}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 sm:mt-20 text-center relative z-20"
        >
          <Link
            href="/team"
            className="group flex items-center justify-center gap-4 bg-white text-black border-6 sm:border-8 border-black px-6 sm:px-8 py-4 max-w-sm mx-auto shadow-[10px_10px_0px_#FF5F5F] sm:shadow-[12px_12px_0px_#FF5F5F] hover:shadow-[6px_6px_0px_#FF5F5F] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all"
          >
            <span className="font-mono font-black uppercase tracking-[0.2em] text-base sm:text-lg">
              VIEW FULL CREW
            </span>
            <span className="font-black text-xl group-hover:translate-x-2 transition-transform">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}