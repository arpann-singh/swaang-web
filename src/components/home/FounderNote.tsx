"use client";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function FounderNote({ data }: { data: any }) {
  const DirectorCard = ({ name, note, img, color, role, index }: any) => {
    // 🎭 Rotations to create the "Scrapbook" feel
    const rotations = ["-rotate-2", "rotate-0", "rotate-2"];
    const hoverRotations = ["hover:-rotate-1", "hover:rotate-1", "hover:rotate-1"];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`relative group flex flex-col h-full transition-transform duration-300 ${rotations[index]} ${hoverRotations[index]}`}
      >
        {/* 📸 STACKED PAPER EFFECT (Brutalist Layer) */}
        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-all" />
        
        {/* 🎭 MAIN CONTENT CARD */}
        <div className="bg-[#FFF9F0] border-8 border-black p-6 md:p-8 h-full flex flex-col shadow-[8px_8px_0px_#FF5F5F]">
          
          {/* CSS Masking Tape */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white border-2 border-black/10 shadow-sm -rotate-3 z-30 opacity-90 mix-blend-multiply" />

          <div className="relative mb-8 aspect-square w-full">
            <div className={`absolute inset-0 ${color} border-4 border-black translate-x-3 translate-y-3 -z-10`} />
            <div className="relative h-full w-full border-4 border-black overflow-hidden bg-gray-200 grayscale group-hover:grayscale-0 transition-all duration-700">
               {img ? (
                 <img 
                   src={img} 
                   className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-all duration-700" 
                   alt={name}
                 />
               ) : (
                 <div className="h-full w-full flex items-center justify-center font-mono font-black text-black opacity-30 text-2xl uppercase -rotate-12 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]">MISSING</div>
               )}
            </div>
            
            {/* Role Tag (Typewriter Tape) */}
            <div className={`absolute -bottom-4 -right-4 bg-black text-white border-4 border-black px-4 py-2 font-mono font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_${color}]`}>
              {role}
            </div>
          </div>

          <div className="space-y-4 flex-1 mt-4">
            <div className="flex flex-col gap-2 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_black]">
              <h4 className="text-xl md:text-2xl font-black uppercase tracking-widest text-black leading-none border-b-4 border-black pb-2 mb-2">
                {name || "DIRECTOR"} :
              </h4>
              <p className="text-sm font-mono font-bold text-black leading-relaxed uppercase">
                {note || "THE STAGE IS WHERE WE FIND OUR TRUEST SELVES."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  return (
    <section className="py-24 md:py-40 px-6 bg-transparent border-b-8 border-black relative overflow-hidden">
      
      {/* 🏙️ MASSIVE CASTING CALL WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-16 pointer-events-none opacity-10 overflow-hidden -rotate-3 z-0">
         <h1 className="text-[12vw] font-black uppercase whitespace-nowrap leading-none text-black">
           CASTING CALL // CASTING CALL // CASTING CALL //
         </h1>
         <h1 className="text-[12vw] font-black uppercase whitespace-nowrap leading-none text-black -ml-40">
           AUDITION TAPES // AUDITION TAPES //
         </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-10">
          <div className="max-w-3xl">
            <span className="bg-black text-[#FFD166] px-6 py-2 border-4 border-black font-mono font-black uppercase text-[12px] tracking-[0.3em] shadow-[6px_6px_0px_#FF5F5F] mb-6 inline-block">
              EXECUTIVE BOARD
            </span>
            <h2 className="text-[11vw] sm:text-7xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.85] whitespace-nowrap mt-4">
              THE <br /> <span className="text-white" style={{ WebkitTextStroke: '2px black' }}>FOUNDERS</span>
            </h2>
          </div>
          <p className="md:max-w-xs font-mono font-black text-sm uppercase tracking-widest text-black bg-white border-4 border-black p-4 shadow-[6px_6px_0px_black] leading-relaxed">
            THE CREATIVE VISIONARIES WHO LAID THE FOUNDATION FOR SWAANG'S DRAMATIC LEGACY.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-10 lg:gap-14 pt-10">
          <DirectorCard 
            index={0} 
            role="Founder & Director" 
            name={data?.founderName} 
            note={data?.founderNote} 
            img={data?.founderImage} 
            color="bg-[#FF5F5F]" 
          />
          <DirectorCard 
            index={1} 
            role="Co-Founder" 
            name={data?.coFounder1Name} 
            note={data?.coFounder1Note} 
            img={data?.coFounder1Image} 
            color="bg-[#06D6A0]" 
          />
          <DirectorCard 
            index={2} 
            role="Co-Founder" 
            name={data?.coFounder2Name} 
            note={data?.coFounder2Note} 
            img={data?.coFounder2Image} 
            color="bg-[#FFD166]" 
          />
        </div>
      </div>
    </section>
  );
}