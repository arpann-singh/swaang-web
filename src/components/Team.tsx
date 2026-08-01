"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

export default function Team() {
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "team"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (parseInt(b.joiningYear) || 9999) - (parseInt(a.joiningYear) || 9999));
      setMembers(fetched);
    });
    return () => unsub();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesTab = activeTab === "all" || m.category === activeTab;
    const matchesSearch = 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.branch?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <section className="py-20 px-6 max-w-[85rem] mx-auto min-h-screen">
      
      {/* HEADER & SEARCH SECTION */}
      <div className="flex flex-col mb-16 gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-[var(--border-primary)] pb-6">
           <div>
              <h2 className="text-6xl md:text-[6rem] lg:text-[7rem] font-black uppercase tracking-tighter text-[var(--text-primary)] leading-[0.85] font-cinzel">
                Ensemble
              </h2>
              <p className="font-black uppercase tracking-[0.4em] text-[#FF5F5F] text-xs md:text-sm mt-4">The Swaang Collective</p>
           </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white border-4 border-[var(--border-primary)] p-4 shadow-[8px_8px_0px_var(--border-primary)] rounded-3xl">
           
           <div className="relative w-full lg:w-[400px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/30">
                 <Search size={20} strokeWidth={3} />
              </div>
              <input 
                 type="text" 
                 placeholder="SEARCH NAME OR ROLE..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-transparent focus:border-[var(--border-primary)] focus:bg-white rounded-2xl outline-none font-black uppercase tracking-widest text-[10px] transition-colors"
              />
           </div>

           <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
             {['all', 'president', 'active', 'alumni'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-1 lg:flex-none px-6 py-4 border-2 border-[var(--border-primary)] font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] transition-all rounded-2xl ${
                   activeTab === tab 
                     ? 'bg-[#06D6A0] text-[var(--text-primary)] shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] translate-y-1' 
                     : 'bg-white text-[var(--text-primary)] hover:bg-[#FFD166] hover:-translate-y-1 shadow-[4px_4px_0px_var(--border-primary)]'
                 }`}
               >
                 {tab === 'all' ? 'Full Roster' : tab + "s"}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* COMPACT PREMIUM OVERLAY GRID */}
      {filteredMembers.length === 0 ? (
         <div className="w-full py-32 flex flex-col items-center justify-center border-4 border-dashed border-[var(--border-primary)]/20 bg-black/5 rounded-[3rem]">
            <span className="text-6xl mb-4">🎭</span>
            <h3 className="font-black uppercase tracking-widest text-[var(--border-primary)]/50 text-xl">No Members Found</h3>
         </div>
      ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
           <AnimatePresence>
             {filteredMembers.map((member) => (
               <motion.div
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ duration: 0.3 }}
                 key={member.id}
                 className="group relative aspect-[3/4] bg-[#1A1A1A] border-4 border-[var(--border-primary)] shadow-[8px_8px_0px_var(--border-primary)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_#FF5F5F] transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer"
               >
                 {/* Background Image */}
                 {member.image ? (
                    <img 
                       src={member.image} 
                       alt={member.name}
                       className="absolute inset-0 w-full h-full object-cover grayscale-0 lg:grayscale opacity-100 lg:opacity-80 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                    />
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                       <span className="text-6xl mb-4">🎭</span>
                       <span className="font-mono uppercase tracking-[0.2em] text-[10px]">No Photo</span>
                    </div>
                 )}

                 {/* Top Category Badge */}
                 <div className="absolute top-4 right-4 z-20">
                    <span className={`px-4 py-1.5 font-black uppercase tracking-widest text-[9px] rounded-full border-2 border-[var(--border-primary)] shadow-[3px_3px_0px_rgba(0,0,0,0.5)] ${
                       member.category === 'president' ? 'bg-[#FFD166] text-black' : 
                       member.category === 'active' ? 'bg-[#06D6A0] text-black' : 
                       'bg-[#94A3B8] text-white'
                    }`}>
                       {member.category}
                    </span>
                 </div>

                 {/* Bottom Overlay Info Panel */}
                 <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end">
                    
                    {/* Primary Info (Always visible, shifts up slightly on hover on desktop) */}
                    <div className="transform translate-y-0 lg:translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                       <h3 className="font-cinzel text-3xl font-black uppercase text-white leading-none tracking-tighter mb-2 group-hover:text-[#06D6A0] transition-colors">
                          {member.name}
                       </h3>
                       <p className="font-mono uppercase tracking-[0.25em] text-white/70 font-black text-[9px] line-clamp-1">
                          {member.role || 'Ensemble'} {member.branch && <span className="text-white/30">| {member.branch}</span>}
                       </p>
                    </div>

                    {/* Secondary Info (Always visible on mobile, slides in on hover on desktop) */}
                    <div className="opacity-100 max-h-[50px] lg:opacity-0 lg:max-h-0 group-hover:max-h-[50px] group-hover:opacity-100 transition-all duration-300 ease-in-out mt-3 border-t-2 border-white/10 pt-3 flex justify-between items-center">
                       
                       {/* Timeline */}
                       <div className="flex gap-2">
                          {member.joiningYear && (
                             <span className="text-[9px] font-black uppercase text-white/90 bg-white/10 px-2 py-1 rounded backdrop-blur-md">IN: {member.joiningYear}</span>
                          )}
                          {member.passoutYear && (
                             <span className="text-[9px] font-black uppercase text-white/50 bg-white/5 px-2 py-1 rounded backdrop-blur-md">OUT: {member.passoutYear}</span>
                          )}
                       </div>

                       {/* Socials */}
                       <div className="flex gap-3">
                          {member.instagram && (
                             <a href={member.instagram} target="_blank" className="text-white hover:text-[#E4405F] hover:scale-110 transition-transform">
                               <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                             </a>
                          )}
                          {member.linkedin && (
                             <a href={member.linkedin} target="_blank" className="text-white hover:text-[#0077B5] hover:scale-110 transition-transform">
                                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                             </a>
                          )}
                       </div>
                    </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
         </div>
      )}
    </section>
  );
}