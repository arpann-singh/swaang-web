"use client";
import { motion } from "framer-motion";

export default function FacultyHero({ data }: { data: any }) {
  if (!data) return null;

  // These stats are mapped to the sliders we'll add in the admin panel
  const stats = [
    { label: "STRATEGIC SUPPORT", value: data.stat1 || 100, color: "#FFD166" },
    { label: "CREATIVE FREEDOM", value: data.stat2 || 100, color: "#06D6A0" },
    { label: "INSTITUTIONAL SYNERGY", value: data.stat3 || 85, color: "#FF5F5F" },
  ];

  return (
    <section className="py-24 px-6 bg-[#FFF9F0] relative overflow-hidden border-b-8 border-[#2D2D2D]">
      {/* 🔍 THE BLUEPRINT GRID BACKGROUND */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `radial-gradient(#2D2D2D 1px, transparent 1px)`, 
          backgroundSize: '30px 30px' 
        }} 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* LEFT: THE ARCHITECTURAL PHOTO */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-[#2D2D2D]" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-[#2D2D2D]" />

            <div className="bg-white border-4 border-[#2D2D2D] p-3 shadow-[15px_15px_0px_#2D2D2D]">
              <div className="relative group overflow-hidden bg-gray-100 aspect-[4/5] lg:aspect-auto lg:h-[500px]">
                <img 
                  src={data.image || "/faculty-placeholder.jpg"} 
                  alt="Faculty Coordinator" 
                  className="w-full h-full object-cover grayscale-0 hover:grayscale transition-all duration-700"
                />
                <div className="absolute bottom-4 right-4 bg-[#2D2D2D] text-white px-3 py-1 font-mono text-[10px] uppercase tracking-tighter">
                  ID: SWAANG_FACULTY_Coordinator
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: DYNAMIC SYSTEM SPECS */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <span className="bg-[#FF5F5F] text-white px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-widest border-2 border-[#2D2D2D] shadow-[3px_3px_0px_#2D2D2D]">
                Faculty Coordinator
              </span>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-[0.85] mt-6">
                {data.name || "Prof. Name"}
              </h2>
              <p className="font-mono text-sm font-black text-[#FF5F5F] uppercase tracking-widest mt-2">
                // {data.role || "😎"}
              </p>
            </div>

            <p className="text-xl md:text-2xl font-bold text-[#2D2D2D]/80 leading-tight italic border-l-8 border-[#06D6A0] pl-6">
              "{data.citation || "Guiding the visionaries of tomorrow."}"
            </p>

            {/* DYNAMIC PROGRESS BARS */}
            <div className="space-y-5 bg-white border-4 border-[#2D2D2D] p-8 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D]">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#2D2D2D]/50">{stat.label}</span>
                    <span className="font-mono text-xs font-black text-[#2D2D2D]">{stat.value}%</span>
                  </div>
                  <div className="h-4 bg-[#FFF9F0] border-2 border-[#2D2D2D] rounded-full overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.2 }}
                      style={{ backgroundColor: stat.color }}
                      className="h-full border-r-2 border-[#2D2D2D]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}