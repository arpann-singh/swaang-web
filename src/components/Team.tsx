"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Team() {
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "team"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (parseInt(a.joiningYear) || 9999) - (parseInt(b.joiningYear) || 9999));
      setMembers(fetched);
    });
    return () => unsub();
  }, []);

  const getCategoryStyles = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'president':
        return "bg-[#FFD166] text-[#2D2D2D] border-[#2D2D2D]";
      case 'active':
        return "bg-[#06D6A0] text-[#2D2D2D] border-[#2D2D2D]";
      case 'alumni':
        return "bg-[#94A3B8] text-white border-[#2D2D2D]";
      default:
        return "bg-[#2D2D2D] text-white border-white";
    }
  };

  const filteredMembers = activeTab === "all" 
    ? members 
    : members.filter(m => m.category === activeTab);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#2D2D2D]">
          The <span className="text-[#FF5F5F]">Ensemble</span>
        </h2>
        
        <div className="flex flex-wrap justify-center bg-white border-4 border-[#2D2D2D] p-2 rounded-2xl shadow-[4px_4px_0px_#2D2D2D] gap-1">
          {['all', 'president', 'active', 'alumni'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs md:text-sm transition-all ${
                activeTab === tab ? 'bg-[#2D2D2D] text-white' : 'hover:bg-gray-100 text-[#2D2D2D]'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredMembers.map((member) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={member.id}
            className={`group bg-white border-4 border-[#2D2D2D] rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_#2D2D2D] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_#FF5F5F] ${
              member.category === 'president' ? 'ring-8 ring-[#FFD166]/30' : ''
            }`}
          >
            {/* Image Container */}
            <div className="h-80 w-full border-b-4 border-[#2D2D2D] overflow-hidden bg-gray-100 relative">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-10 font-black">SWAANG</div>
              )}
              
              <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-lg transition-colors ${getCategoryStyles(member.category)}`}>
                {member.category}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-none">
                  {member.name}
                </h3>
                {member.joiningYear && (
                  <span className="bg-[#2D2D2D] text-white px-3 py-1 rounded-md text-[9px] font-black uppercase shadow-[2px_2px_0px_#FF5F5F] shrink-0">
                    Est. {member.joiningYear}
                  </span>
                )}
              </div>

              <p className="text-[#FF5F5F] font-black uppercase text-[11px] md:text-xs tracking-widest mb-6 leading-tight">
                {member.role} {member.branch && <span className="opacity-40 mx-1">|</span>} {member.branch && `${member.branch}`}
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {member.category === 'active' && member.year && (
                  <div className="bg-[#06D6A0]/10 border-2 border-[#06D6A0] px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_#06D6A0]">
                    <p className="text-[8px] font-black uppercase leading-none opacity-60 mb-0.5">Academic Status</p>
                    <p className="text-xs font-black uppercase text-[#2D2D2D]">{member.year} Year</p>
                  </div>
                )}

                {(member.category === 'president' || member.category === 'alumni') && (
                  <>
                    {member.tenure && (
                      <div className="bg-[#FFD166] border-2 border-[#2D2D2D] px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_#2D2D2D]">
                        <p className="text-[8px] font-black uppercase leading-none opacity-60 mb-0.5">Tenure</p>
                        <p className="text-xs font-black uppercase text-[#2D2D2D]">{member.tenure}</p>
                      </div>
                    )}
                    {member.passoutYear && (
                      <div className="bg-[#06D6A0] border-2 border-[#2D2D2D] px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_#06D6A0]">
                        <p className="text-[8px] font-black uppercase leading-none opacity-60 mb-0.5">Graduation</p>
                        <p className="text-xs font-black uppercase text-[#2D2D2D]">{member.passoutYear}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="text-[#2D2D2D] text-sm md:text-base font-medium line-clamp-3 italic mb-8 leading-relaxed opacity-80">
                "{member.description || "The stage is a mirror, and I am the reflection."}"
              </p>

              {/* 🔥 UPDATED: Social Links with SVG Icons */}
              <div className="flex gap-4">
                {member.instagram && (
                  <a href={member.instagram} target="_blank" className="w-10 h-10 rounded-xl border-2 border-[#2D2D2D] flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all hover:scale-110 shadow-[3px_3px_0px_#2D2D2D]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" className="w-10 h-10 rounded-xl border-2 border-[#2D2D2D] flex items-center justify-center hover:bg-[#0077B5] hover:text-white transition-all hover:scale-110 shadow-[3px_3px_0px_#2D2D2D]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" className="w-10 h-10 rounded-xl border-2 border-[#2D2D2D] flex items-center justify-center hover:bg-[#2D2D2D] hover:text-white transition-all hover:scale-110 shadow-[3px_3px_0px_#2D2D2D]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}