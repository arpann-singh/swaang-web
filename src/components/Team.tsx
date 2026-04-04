"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import MemberModal from "./MemberModal";

export default function Team() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "team")), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTeam(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  const presidents = team.filter(m => (m.category || 'active') === 'president');
  const activeEnsemble = team.filter(m => (m.category || 'active') === 'active' && m.isActive !== false);
  const alumni = team.filter(m => (m.category || 'active') === 'alumni');

  return (
    <section className="pb-32 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- THE DIRECTORATE (NOIR BOX) --- */}
        {presidents.length > 0 && (
          <div className="bg-[#1A1A1A] text-[#FFF9F0] p-8 md:p-20 rounded-[3.5rem] border-[10px] border-[#2D2D2D] shadow-[25px_25px_0px_rgba(0,0,0,0.1)] mb-40 relative">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-24 text-center">
              <h2 className="font-black text-5xl md:text-8xl tracking-tighter uppercase italic">THE PRESIDENTS</h2>
              <span className="bg-[#2D2D2D] text-[#FFD166] px-6 py-2 rounded-full font-black text-xs uppercase border-2 border-[#FFD166]/20">Leadership</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-x-24 gap-y-32 max-w-5xl mx-auto">
              {presidents.map((m) => (
                <motion.div key={m.id} onClick={() => setSelectedMember(m)} className="flex flex-col items-center group cursor-pointer text-center relative">
                  {m.isCurrentPresident && (
                    <div className="absolute -top-4 -right-4 z-30 bg-[#FFD166] border-4 border-[#2D2D2D] px-4 py-2 rounded-xl font-black text-[#2D2D2D] text-[10px] md:text-xs uppercase shadow-[4px_4px_0px_#2D2D2D] -rotate-6">
                      Current Leader ★
                    </div>
                  )}
                  <div className="relative mb-8 w-full max-w-[340px] aspect-square">
                    <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[3.5rem] bg-[#FFD166] border-4 border-black group-hover:translate-x-1 group-hover:translate-y-1 transition-all" />
                    <div className="relative h-full w-full rounded-[3.5rem] border-[6px] border-[#2D2D2D] overflow-hidden bg-[#2D2D2D] flex items-center justify-center">
                      {m.image ? <img src={m.image} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" /> : <span className="text-6xl opacity-20">🎭</span>}
                    </div>
                  </div>
                  <h4 className="font-black uppercase text-3xl md:text-5xl text-[#FFD166] tracking-tight">{m.name}</h4>
                  <p className="font-black uppercase tracking-widest text-[#FFF9F0]/80 text-sm">{m.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* --- ACTIVE ENSEMBLE --- */}
        <div className="space-y-16 mb-40">
           <h2 className="font-black text-4xl md:text-6xl tracking-tighter uppercase text-[#2D2D2D]">ACTIVE ENSEMBLE</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
             {activeEnsemble.map(m => (
               <div key={m.id} onClick={() => setSelectedMember(m)} className="flex flex-col items-center group cursor-pointer text-center">
                 <div className="relative mb-6 w-full max-w-[200px] aspect-square">
                   <div className="absolute inset-0 bg-[#06D6A0] translate-x-3 translate-y-3 rounded-[3rem] border-2 border-black" />
                   <div className="relative h-full w-full rounded-[3rem] border-4 border-[#2D2D2D] overflow-hidden bg-white flex items-center justify-center">
                     {m.image ? <img src={m.image} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100" /> : <span className="text-4xl opacity-20">🎭</span>}
                   </div>
                 </div>
                 <h4 className="font-black uppercase text-xl text-[#2D2D2D] tracking-tight">{m.name}</h4>
                 <p className="text-[10px] font-black uppercase text-[#FF5F5F] tracking-widest">{m.role}</p>
               </div>
             ))}
           </div>
        </div>

        {/* --- ALUMNI LEGACY --- */}
        <div className="space-y-16">
           <h2 className="font-black text-4xl md:text-6xl tracking-tighter uppercase text-[#2D2D2D]">ALUMNI LEGACY</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 opacity-80">
             {alumni.map(m => (
               <div key={m.id} onClick={() => setSelectedMember(m)} className="flex flex-col items-center group cursor-pointer text-center">
                 <div className="relative mb-6 w-full max-w-[180px] aspect-square">
                   <div className="absolute inset-0 bg-gray-200 translate-x-2 translate-y-2 rounded-[3rem] border-2 border-[#2D2D2D]" />
                   <div className="relative h-full w-full rounded-[3rem] border-4 border-[#2D2D2D] overflow-hidden bg-white grayscale flex items-center justify-center">
                     {m.image ? <img src={m.image} className="h-full w-full object-cover" /> : <span className="text-3xl opacity-20">🎭</span>}
                   </div>
                 </div>
                 <h4 className="font-black uppercase text-lg text-[#2D2D2D]">{m.name}</h4>
                 <p className="text-[9px] font-bold text-[#2D2D2D]/40 uppercase tracking-widest">{m.tenure} • {m.passoutYear}</p>
               </div>
             ))}
           </div>
        </div>

      </div>

      <AnimatePresence>
        {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      </AnimatePresence>
    </section>
  );
}
