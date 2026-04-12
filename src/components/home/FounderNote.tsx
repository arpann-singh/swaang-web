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
        {/* 📸 STACKED PAPER EFFECT (Background Layer) */}
        <div className="absolute inset-0 bg-white border-4 border-[#1A1A1A] rounded-[3rem] translate-x-3 translate-y-3 -z-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)]" />
        
        {/* 🎭 MAIN CONTENT CARD */}
        <div className="bg-white border-4 md:border-8 border-[#1A1A1A] p-7 md:p-9 rounded-[3rem] shadow-[10px_10px_0px_#1A1A1A] h-full flex flex-col">
          
          <div className="relative mb-8 aspect-square w-full">
            <div className={`absolute inset-0 ${color} rounded-[2rem] border-4 border-black translate-x-2 translate-y-2 -z-10 opacity-30`} />
            <div className="relative h-full w-full border-4 border-black rounded-[2rem] overflow-hidden bg-gray-100">
               {img ? (
                 <img 
                   src={img} 
                   className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" 
                   alt={name}
                 />
               ) : (
                 <div className="h-full w-full flex items-center justify-center font-black opacity-10 text-4xl uppercase -rotate-12">Archive</div>
               )}
            </div>
            
            {/* Role Tag */}
            <div className={`absolute -bottom-4 -right-2 ${color} text-[#1A1A1A] border-[3px] border-black px-4 py-1 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-[4px_4px_0px_black]`}>
              {role}
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-2">
              <Quote size={20} className="text-[#FF5F5F] shrink-0 mt-1" />
              <div>
                <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[#1A1A1A] leading-none mb-2">
                  {name || "Director Name"}
                </h4>
                <p className="text-sm font-bold opacity-70 leading-snug italic text-[#1A1A1A]">
                  "{note || "The stage is where we find our truest selves."}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="py-24 md:py-40 px-6 bg-[#FFF9F0] border-b-[12px] border-black relative overflow-hidden">
      {/* 🏙️ Decal Background Text */}
      <div className="absolute -top-10 -right-20 text-[250px] font-black opacity-[0.02] pointer-events-none select-none italic uppercase leading-none text-[#1A1A1A]">
        Swaang
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="bg-[#06D6A0] text-[#1A1A1A] px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-[4px_4px_0px_black] mb-6 inline-block">
              Executive Board
            </span>
            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-[#1A1A1A] leading-[0.85]">
              The <br /> <span className="text-transparent" style={{ WebkitTextStroke: '2px #1A1A1A' }}>Founders</span>
            </h2>
          </div>
          <p className="md:max-w-xs font-bold text-xs uppercase tracking-widest opacity-40 leading-relaxed">
            The creative visionaries who laid the foundation for Swaang's dramatic legacy.
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