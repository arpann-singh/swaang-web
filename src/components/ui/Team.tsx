"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import MemberModal from "./MemberModal";

export default function Team() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  const categories = [
    { id: 'president', label: 'THE PRESIDENTS', accent: '#06D6A0' },
    { id: 'active', label: 'ACTIVE ENSEMBLE', accent: '#FF5F5F' },
    { id: 'alumni', label: 'THE ALUMNI LEGACY', accent: '#06D6A0' }
  ];

  return (
    <section className="pb-32 px-6">
      <div className="max-w-7xl mx-auto space-y-40">
        {categories.map((cat) => {
          const members = team.filter(m => (m.category || 'active') === cat.id);
          if (members.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-16">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: cat.accent }} />
                <h2 className="font-black text-4xl md:text-5xl tracking-tighter uppercase text-[#2D2D2D]">
                  {cat.label}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-x-16 gap-y-24">
                {members.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ y: -8 }}
                    onClick={() => setSelectedMember(m)}
                    className="flex flex-col items-center group cursor-pointer text-center"
                  >
                    <div className="relative mb-6 w-full max-w-[200px] aspect-square">
                      <div className="absolute inset-0 bg-[#06D6A0] translate-x-3 translate-y-3 rounded-[3.5rem] border-2 border-black" />
                      <div className="relative h-full w-full rounded-[3.5rem] border-4 border-[#2D2D2D] overflow-hidden bg-white">
                        <img 
                          src={m.image} 
                          alt={m.name}
                          className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100" 
                        />
                      </div>
                    </div>

                    <h4 className="font-black uppercase text-xl md:text-2xl text-[#2D2D2D] tracking-tight">{m.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FF5F5F] mt-1">{m.role}</p>
                    {m.category !== 'alumni' && <p className="text-[9px] font-bold text-[#2D2D2D]/40 uppercase mt-1">{m.year || "SSTC Bhilai"}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      </AnimatePresence>
    </section>
  );
}
