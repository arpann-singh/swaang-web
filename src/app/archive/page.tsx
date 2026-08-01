"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/ui/Footer";
import { Play, Info, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductionsArchive() {
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hoveredProd, setHoveredProd] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "production_archive"), (snap) => {
      const prods = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setProductions(prods.sort((a, b) => parseInt(b.year) - parseInt(a.year)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProds = filter === "all" ? productions : productions.filter(p => p.type === filter);

  // Netflix style grouping by type or just a continuous grid
  const featured = productions[0]; // Assuming newest is featured

  return (
    <main className="bg-[#030303] min-h-screen text-[#E2E8F0] font-sans selection:bg-[#FF5F5F]/30">
      <Header />

      {/* HERO FEATURED (Netflix Hero) */}
      {featured && (
        <section className="relative h-[80vh] w-full flex items-end pb-20 pt-32 px-6 md:px-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {featured.posterUrl ? (
              <img src={featured.posterUrl} className="w-full h-full object-cover opacity-50" />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#1A1A1A] to-[#030303]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-3xl">
            <h4 className="text-[#FF5F5F] font-black uppercase tracking-[0.4em] text-xs mb-2 flex items-center gap-2">
              <span>SWAANG ORIGINAL</span>
              <span className="w-4 h-[1px] bg-[#FF5F5F]" />
              <span>{featured.year}</span>
            </h4>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none text-white drop-shadow-2xl">
              {featured.title}
            </h1>
            <p className="text-sm md:text-base font-medium opacity-80 mb-8 line-clamp-3 md:line-clamp-none max-w-2xl drop-shadow-md">
              {featured.synopsis}
            </p>
            <div className="flex gap-4">
              {featured.trailerUrl && (
                <a href={featured.trailerUrl} target="_blank" className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                  <Play size={18} fill="currentColor" /> Play Trailer
                </a>
              )}
              <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold uppercase text-sm flex items-center gap-2 hover:bg-white/30 transition-colors">
                <Info size={18} /> Cast & Details
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FILTER TABS */}
      <section className="px-6 md:px-16 py-8 relative z-10 -mt-10">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {['all', 'stage', 'nukkad', 'shortfilm'].map(t => (
            <button 
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all border border-white/10 ${filter === t ? 'bg-white text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
              {t === 'all' ? 'All Productions' : t === 'nukkad' ? 'Street Plays' : t}
            </button>
          ))}
        </div>
      </section>

      {/* ARCHIVE GRID */}
      <section className="px-6 md:px-16 pb-32">
        <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-6">Explore the Vault</h3>
        
        {loading ? (
          <div className="flex gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="w-64 h-36 bg-white/5 rounded-md" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredProds.map(prod => (
              <motion.div 
                key={prod.id}
                onHoverStart={() => setHoveredProd(prod.id)}
                onHoverEnd={() => setHoveredProd(null)}
                className="relative aspect-video bg-gray-900 rounded-md overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 hover:scale-105 hover:z-20 transition-all duration-300 shadow-xl"
              >
                {prod.posterUrl ? (
                  <img src={prod.posterUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-black p-4 text-center">
                    <span className="font-black uppercase text-xl leading-tight opacity-50">{prod.title}</span>
                  </div>
                )}

                {/* Hover Details Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 ${hoveredProd === prod.id ? 'opacity-100' : 'opacity-0'}`}>
                  <h4 className="font-black uppercase text-sm leading-none mb-1 text-white">{prod.title}</h4>
                  <p className="text-[8px] font-bold tracking-widest text-[#FF5F5F] uppercase mb-2">{prod.year} • {prod.type}</p>
                  <p className="text-[9px] line-clamp-3 text-gray-300 mb-3 leading-tight">{prod.synopsis}</p>
                  {prod.trailerUrl && (
                    <a href={prod.trailerUrl} target="_blank" className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play size={12} fill="currentColor" className="ml-1" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
