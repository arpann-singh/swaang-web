"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import { Award, Briefcase, GraduationCap } from "lucide-react";

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "alumni"), orderBy("batch", "desc")), (snap) => {
      setAlumni(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredAlumni = filter === "All" ? alumni : alumni.filter(a => a.category === filter);
  const categories = ["All", "President", "Legend", "Member"];

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center font-black uppercase text-xl tracking-widest">Loading Legends...</div>;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Hall of Fame" subtitle="Our Legacy" />
        
        <p className="max-w-2xl mt-8 text-lg font-bold opacity-80 leading-relaxed mb-16">
          The foundation of Swaang was built by those who came before us. 
          Meet the visionary presidents, legendary actors, and dedicated members who shaped our dramatic society.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-16">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest border-4 border-[var(--border-primary)] transition-all ${filter === cat ? 'bg-[#FF5F5F] text-white shadow-[4px_4px_0px_var(--border-primary)] -translate-y-1' : 'bg-transparent text-[var(--text-primary)] hover:border-[#FF5F5F]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAlumni.map((a, i) => (
            <motion.div 
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-[var(--card-primary)] border-[6px] border-[var(--border-primary)] rounded-[3rem] p-8 shadow-[12px_12px_0px_var(--border-primary)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_#FFD166] transition-all flex flex-col group relative overflow-hidden"
            >
              {a.category === "President" && <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#FFD166]/20 rounded-full blur-2xl group-hover:bg-[#FFD166]/40 transition-all" />}
              {a.category === "Legend" && <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#FF5F5F]/20 rounded-full blur-2xl group-hover:bg-[#FF5F5F]/40 transition-all" />}

              <div className="flex items-start gap-6 mb-8 relative z-10">
                {a.photo ? (
                  <img src={a.photo} alt={a.name} className="w-24 h-24 rounded-[2rem] border-4 border-[var(--border-primary)] object-cover shadow-[4px_4px_0px_var(--border-primary)]" />
                ) : (
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-[var(--border-primary)] bg-gray-100 flex items-center justify-center text-4xl shadow-[4px_4px_0px_var(--border-primary)]">🎓</div>
                )}
                <div className="flex-1 pt-2">
                  <h3 className="font-black text-2xl uppercase leading-none mb-2">{a.name}</h3>
                  <div className="inline-flex items-center gap-2 bg-[var(--border-primary)] text-[var(--bg-primary)] px-3 py-1 rounded-full font-black text-[10px] tracking-widest uppercase mb-3">
                    <GraduationCap size={12} /> {a.batch}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-8 h-8 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] flex items-center justify-center shrink-0">
                    <Award size={16} />
                  </div>
                  <span className="uppercase tracking-widest opacity-80">{a.role}</span>
                </div>
                {a.company && (
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <div className="w-8 h-8 rounded-full bg-[#FF5F5F]/20 text-[#FF5F5F] flex items-center justify-center shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <span className="uppercase tracking-widest opacity-80">{a.company}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto bg-gray-50 dark:bg-black/20 p-6 rounded-3xl border-2 border-[var(--border-primary)]/20 relative z-10">
                <p className="font-bold text-sm leading-relaxed italic opacity-80">"{a.bio}"</p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <h3 className="font-black text-2xl uppercase">No alumni found in this category.</h3>
          </div>
        )}
      </div>
    </main>
  );
}
