"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";

// 🃏 THE FLIP CARD COMPONENT
const GalleryCard = ({ photo, index, layoutClass, colorTheme }: { photo: any, index: number, layoutClass: string, colorTheme: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 🧠 Check if this specific card is given a small grid slot
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
            src={photo.url || photo.imageUrl} 
            alt={photo.title || "Swaang Gallery Photo"} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* 🎯 RESPONSIVE HOVER BADGE */}
          <div className={`absolute bg-[#FFD166] text-[#2D2D2D] border-2 border-[#2D2D2D] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${
            isSmall 
              ? 'bottom-2 right-2 px-2 py-1.5 rounded-lg shadow-[2px_2px_0px_#2D2D2D]' 
              : 'bottom-4 right-4 px-4 py-2 rounded-xl shadow-[4px_4px_0px_#2D2D2D]'
          }`}>
            <span className={`font-black uppercase tracking-widest flex items-center ${isSmall ? 'text-[8px] gap-1' : 'text-[10px] md:text-xs gap-2'}`}>
              Click to know more <span className={isSmall ? 'text-xs' : 'text-base'}>⤾</span>
            </span>
          </div>
        </div>

        {/* 📝 BACK SIDE */}
        {/* 🔥 Added invisible scrollbar classes: [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] ${colorTheme} border-4 border-[#2D2D2D] rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D] ${isSmall ? 'p-4 md:p-5' : 'p-6 md:p-8'} flex flex-col items-center justify-center text-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          
          <div className={`${isSmall ? 'w-5 h-5 mb-4' : 'w-8 h-8 mb-6'} bg-white/20 rounded-full flex items-center justify-center border-2 border-current shrink-0`}>
            <div className={`${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-current rounded-full animate-pulse`} />
          </div>
          
          <h3 className={`${isSmall ? 'text-xl' : 'text-2xl md:text-3xl lg:text-4xl'} font-black uppercase tracking-tighter mb-4 border-b-4 border-current/20 pb-4 w-full shrink-0`}>
            {photo.title || "Untitled File"}
          </h3>
          
          <p className={`font-bold ${isSmall ? 'text-xs' : 'text-sm md:text-base'} leading-relaxed italic opacity-90 mb-6`}>
            {photo.description || photo.caption || "No description provided."}
          </p>

          <span className={`mt-auto font-black uppercase tracking-widest opacity-60 border-2 border-current/20 rounded-full shrink-0 ${isSmall ? 'text-[7px] px-2 py-1' : 'text-[9px] px-3 py-1'}`}>
            Click to return
          </span>
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
    const pattern = [
      "md:col-span-2 md:row-span-2", 
      "md:col-span-1 md:row-span-1", 
      "md:col-span-1 md:row-span-1", 
      "md:col-span-2 md:row-span-1", 
      "md:col-span-1 md:row-span-2", 
      "md:col-span-1 md:row-span-1", 
    ];
    return pattern[index % 6];
  };

  const backColors = [
    "bg-[#FFD166] text-[#2D2D2D]", 
    "bg-[#06D6A0] text-[#2D2D2D]", 
    "bg-[#FF5F5F] text-[#FFF9F0]", 
    "bg-[#2D2D2D] text-[#FFF9F0]"  
  ];

  return (
    <main className="min-h-screen bg-[#FFF9F0] pt-32 pb-20 px-6 text-[#2D2D2D]">
      <div className="max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-[#2D2D2D]/20" />
            <p className="font-black uppercase tracking-[0.4em] text-[10px] md:text-sm text-[#FF5F5F]">Captured Moments</p>
            <div className="h-[2px] w-12 bg-[#2D2D2D]/20" />
          </div>
          <h1 className="font-cinzel text-5xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(45,45,45,0.1)]">
            The <br className="md:hidden"/> <span className="text-black/40 italic">Archives</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="text-center text-[#06D6A0] font-black uppercase animate-pulse text-2xl">Developing Photos...</div>
        ) : photos.length === 0 ? (
          <div className="text-center text-[#2D2D2D]/30 font-black uppercase text-xl border-4 border-dashed border-[#2D2D2D]/20 py-20 rounded-[3rem]">
            The gallery is currently empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:auto-rows-[250px]">
            {photos.map((photo, index) => (
              <GalleryCard 
                key={photo.id} 
                photo={photo} 
                index={index} 
                layoutClass={getBentoLayout(index)} 
                colorTheme={backColors[index % 4]} 
              />
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-24 text-center">
          <Link href="/" className="inline-block bg-[#2D2D2D] text-[#FFF9F0] border-4 border-[#2D2D2D] font-black uppercase px-12 py-4 rounded-full shadow-[6px_6px_0px_#FF5F5F] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all tracking-widest text-sm">
            Return to Stage
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
