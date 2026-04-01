"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import SectionHeader from "@/components/SectionHeader";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const snap = await getDocs(query(collection(db, "team"), orderBy("createdAt", "desc")));
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const currentTeam = members.filter(m => m.status === "current");
  const alumni = members.filter(m => m.status === "alumni");

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest text-[#2D2D2D]">Loading Ensemble...</div>;

  return (
    <PageTransition>
      <main className="bg-[#FFF9F0] pt-40 pb-40 min-h-screen">
        <SectionHeader title="The Ensemble" subtitle="Our Creative Backbone" emoji="🎭" color="#FFD166" />
        
        <div className="container mx-auto px-6 space-y-32">
          {/* ACTORS & CREATIVES */}
          <section>
            <div className="flex items-center gap-4 mb-12">
               <div className="h-10 w-2 bg-[#FF5F5F] rounded-full" />
               <h3 className="font-cinzel text-3xl font-black text-[#2D2D2D] uppercase tracking-tighter">Active Members</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
              {currentTeam.map(m => (
                <div key={m.id} className="group text-center">
                  <div className="w-48 h-48 mx-auto rounded-full border-4 border-[#2D2D2D] overflow-hidden shadow-[10px_10px_0px_#2D2D2D] bg-white group-hover:-translate-y-3 group-hover:shadow-[15px_15px_0px_#2D2D2D] transition-all duration-300">
                    <img src={m.image} className="w-full h-full object-cover" alt={m.name} />
                  </div>
                  <h4 className="font-black mt-8 text-xl text-[#2D2D2D] uppercase tracking-tighter">{m.name}</h4>
                  <p className="text-[10px] font-black text-[#FF5F5F] uppercase tracking-[0.3em] mt-2">{m.role}</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1">{m.branch} {m.year}</p>
                </div>
              ))}
            </div>
          </section>

          {/* THE LEGACY SECTION */}
          <section className="bg-white p-16 rounded-[4rem] border-4 border-[#2D2D2D] shadow-[15px_15px_0px_#2D2D2D]">
            <div className="flex items-center gap-4 mb-12">
               <div className="h-10 w-2 bg-[#FFD166] rounded-full" />
               <h3 className="font-cinzel text-3xl font-black text-[#2D2D2D] uppercase tracking-tighter">The Alumni Legacy</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
              {alumni.map(m => (
                <div key={m.id} className="text-center opacity-80 hover:opacity-100 transition-opacity">
                  <div className="w-28 h-28 mx-auto rounded-full border-2 border-[#2D2D2D] overflow-hidden grayscale hover:grayscale-0 transition-all">
                    <img src={m.image} className="w-full h-full object-cover" alt={m.name} />
                  </div>
                  <h4 className="font-bold mt-4 text-sm text-[#2D2D2D]">{m.name}</h4>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{m.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        {/* Spacer for Footer */}
        <div className="h-40" /> 
        <Footer />
      </main>
    </PageTransition>
  );
}
