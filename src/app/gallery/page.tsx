"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";

const GalleryCard = ({ photo, index, layoutClass, colorTheme }: { photo: any, index: number, layoutClass: string, colorTheme: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isSmall = layoutClass.includes("md:col-span-1 md:row-span-1");

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setIsFlipped(!isFlipped)}
      className={`${layoutClass} group min-h-[350px] md:min-h-0 [perspective:1000px] cursor-pointer`}
    >
      <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* 📸 FRONT SIDE */}
        <div className="absolute inset-0 [backface-visibility:hidden] border-4 border-[#2D2D2D] rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_#2D2D2D] bg-gray-200">
          <img 
            src={photo.url} 
            alt={photo.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
          />
          <div className={`absolute bg-[#FFD166] text-[#2D2D2D] border-2 border-[#2D2D2D] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${isSmall ? 'bottom-2 right-2 px-2 py-1.5 rounded-lg' : 'bottom-4 right-4 px-4 py-2 rounded-xl shadow-[4px_4px_0px_#2D2D2D]'}`}>
            <span className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">Flip ⤾</span>
          </div>
        </div>

        {/* 📝 BACK SIDE */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] ${colorTheme} border-4 border-[#2D2D2D] rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D] ${isSmall ? 'p-5' : 'p-8'} flex flex-col items-center justify-center text-center overflow-y-auto scrollbar-hide`}>
          <h3 className={`${isSmall ? 'text-xl' : 'text-3xl'} font-black uppercase tracking-tighter mb-4 border-b-4 border-current/20 pb-4 w-full`}>
            {photo.title}
          </h3>
          <p className="font-bold text-sm italic opacity-90 mb-6 leading-relaxed">
            {photo.description || "Captured in the heat of performance."}
          </p>
          <span className="mt-auto font-black uppercase tracking-widest text-[9px] opacity-60 border-2 border-current/20 px-3 py-1 rounded-full">Return</span>
        </div>

      </div>
    </motion.div>
  );
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getBentoLayout = (index: number) => {
    const pattern = ["md:col-span-2 md:row-span-2", "md:col-span-1 md:row-span-1", "md:col-span-1 md:row-span-1", "md:col-span-2 md:row-span-1", "md:col-span-1 md:row-span-2", "md:col-span-1 md:row-span-1"];
    return pattern[index % 6];
  };

  const backColors = ["bg-[#FFD166] text-[#2D2D2D]", "bg-[#06D6A0] text-[#2D2D2D]", "bg-[#FF5F5F] text-white", "bg-[#2D2D2D] text-white"];

  return (
    <main className="min-h-screen bg-[#FFF9F0] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-20">
          <h1 className="font-cinzel text-6xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
            The <span className="text-[#FF5F5F]">Archives</span>
          </h1>
        </div>

        {loading ? (
          <div className="text-center font-black animate-pulse uppercase">Syncing Records...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:auto-rows-[250px]">
            {photos.map((photo, index) => (
              <GalleryCard key={photo.id} photo={photo} index={index} layoutClass={getBentoLayout(index)} colorTheme={backColors[index % 4]} />
            ))}
          </div>
        )}

        <div className="mt-24 text-center">
          <Link href="/" className="inline-block bg-[#2D2D2D] text-[#FFF9F0] font-black uppercase px-12 py-4 rounded-full shadow-[6px_6px_0px_#FF5F5F] hover:translate-x-1 hover:translate-y-1 transition-all">
            Return to Stage
          </Link>
        </div>
      </div>
    </main>
  );
}