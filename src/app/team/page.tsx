"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import SectionHeader from "@/components/SectionHeader";
import PageTransition from "@/components/PageTransition";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🧠 Fetches without orderBy to bypass index errors!
    const unsub = onSnapshot(collection(db, "team"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(fetched);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🏛️ Filter and Sort the 3 Groups
  // 1. Presidents (Sorted by Term alphabetically/chronologically)
  const presidents = members
    .filter(m => m.isPresident)
    .sort((a, b) => ((a.term || "") > (b.term || "") ? 1 : -1));

  // 2. Active Team (Sorted by most recently added)
  const activeTeam = members
    .filter(m => !m.isPresident && (m.status === "current" || !m.status))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // 3. Alumni Legacy (Sorted by most recently added)
  const alumni = members
    .filter(m => !m.isPresident && m.status === "alumni")
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest text-[#2D2D2D]">Loading Ensemble...</div>;

  return (
    <PageTransition>
      <main className="bg-[#FFF9F0] pt-40 pb-40 min-h-screen">
        <SectionHeader title="The Ensemble" subtitle="Our Creative Backbone" emoji="🎭" color="#06D6A0" />
        
        <div className="container mx-auto px-6 space-y-32">
          
          {/* 👑 THE PRESIDENTS SECTION */}
          {presidents.length > 0 && (
            <section className="bg-[#FFD166] p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] border-8 border-[#2D2D2D] shadow-[12px_12px_0px_#2D2D2D]">
              <div className="flex flex-col items-center text-center mb-16">
                <span className="text-4xl md:text-5xl mb-4">👑</span>
                <h3 className="font-cinzel text-4xl md:text-6xl font-black text-[#2D2D2D] uppercase tracking-tighter leading-none">
                  The Presidents
                </h3>
                <p className="font-black uppercase tracking-[0.3em] text-[#2D2D2D]/60 mt-4 text-xs md:text-sm">Leaders of the Stage</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {presidents.map(m => {
                  const img = m.image || m.photo || m.imageUrl;
                  return (
                    <div key={m.id} className="group text-center w-48 md:w-64">
                      <div className="w-40 h-40 md:w-56 md:h-56 mx-auto rounded-full border-8 border-[#2D2D2D] overflow-hidden shadow-[8px_8px_0px_#2D2D2D] bg-white group-hover:-translate-y-3 group-hover:shadow-[15px_15px_0px_#2D2D2D] transition-all duration-300 relative">
                        {img ? (
                           <img src={img} className="w-full h-full object-cover" alt={m.name || m.fullName} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-100 font-black text-5xl">👑</div>
                        )}
                      </div>
                      <div className="bg-[#2D2D2D] text-[#FFF9F0] border-4 border-[#2D2D2D] py-2 px-4 rounded-xl -mt-6 relative z-10 inline-block shadow-[4px_4px_0px_#FF5F5F] group-hover:bg-[#FF5F5F] transition-colors">
                        <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">{m.term || "Term Unknown"}</span>
                      </div>
                      <h4 className="font-black mt-6 text-xl md:text-2xl text-[#2D2D2D] uppercase tracking-tighter leading-tight">
                        {m.name || m.fullName}
                      </h4>
                      <p className="text-[9px] md:text-[10px] font-black text-[#2D2D2D]/70 uppercase tracking-[0.2em] mt-1">President</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 🎭 ACTIVE MEMBERS SECTION */}
          <section>
            <div className="flex items-center gap-4 mb-16">
               <div className="h-12 w-3 bg-[#FF5F5F] rounded-full" />
               <h3 className="font-cinzel text-4xl md:text-5xl font-black text-[#2D2D2D] uppercase tracking-tighter">Active Ensemble</h3>
            </div>
            
            {activeTeam.length === 0 ? (
               <p className="font-black uppercase text-[#2D2D2D]/40 text-lg border-4 border-dashed border-[#2D2D2D]/20 p-12 text-center rounded-[2rem]">No active members found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                {activeTeam.map(m => {
                  const img = m.image || m.photo || m.imageUrl;
                  return (
                    <div key={m.id} className="group text-center">
                      <div className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-[2rem] md:rounded-[3rem] border-4 border-[#2D2D2D] overflow-hidden shadow-[6px_6px_0px_#06D6A0] md:shadow-[10px_10px_0px_#06D6A0] bg-white group-hover:-translate-y-2 group-hover:shadow-[10px_10px_0px_#FF5F5F] transition-all duration-300">
                        {img ? (
                           <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={m.name || m.fullName} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-100 font-black text-4xl">🎭</div>
                        )}
                      </div>
                      <h4 className="font-black mt-6 md:mt-8 text-lg md:text-xl text-[#2D2D2D] uppercase tracking-tighter leading-tight">
                        {m.name || m.fullName}
                      </h4>
                      <p className="text-[9px] md:text-[10px] font-black text-[#FF5F5F] uppercase tracking-[0.3em] mt-2">
                        {m.role}
                      </p>
                      <p className="text-[8px] md:text-[9px] font-bold text-[#2D2D2D]/50 mt-1">
                        {m.branch} {m.year}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 🎓 THE ALUMNI LEGACY SECTION */}
          {alumni.length > 0 && (
            <section className="bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] border-4 border-[#2D2D2D] shadow-[8px_8px_0px_#2D2D2D] md:shadow-[15px_15px_0px_#2D2D2D]">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-10 w-2 bg-[#06D6A0] rounded-full" />
                <h3 className="font-cinzel text-2xl md:text-3xl font-black text-[#2D2D2D] uppercase tracking-tighter">The Alumni Legacy</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
                {alumni.map(m => {
                  const img = m.image || m.photo || m.imageUrl;
                  return (
                    <div key={m.id} className="text-center opacity-70 hover:opacity-100 transition-opacity group">
                      <div className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full border-2 border-[#2D2D2D] overflow-hidden grayscale group-hover:grayscale-0 transition-all bg-gray-100">
                        {img ? (
                          <img src={img} className="w-full h-full object-cover" alt={m.name || m.fullName} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-2xl">🎓</div>
                        )}
                      </div>
                      <h4 className="font-bold mt-4 text-xs md:text-sm text-[#2D2D2D] uppercase tracking-tighter leading-tight">
                        {m.name || m.fullName}
                      </h4>
                      <p className="text-[7px] md:text-[8px] font-black text-[#2D2D2D]/40 uppercase tracking-widest mt-1">
                        {m.role}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
