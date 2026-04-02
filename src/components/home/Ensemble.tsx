"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Ensemble({ team }: { team: any[] }) {
  return (
    <section className="py-24 md:py-40 px-6 bg-[#FFF9F0] border-b-[12px] border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎭 Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 md:mb-32 gap-8">
          <h2 className="font-cinzel text-6xl md:text-9xl font-black uppercase leading-none tracking-tighter">
            The <br/> 
            <span className="bg-[#FF5F5F] text-white px-6 shadow-[8px_8px_0px_#2D2D2D] inline-block mt-2">
              Ensemble
            </span>
          </h2>
          
          <Link href="/members" className="group relative inline-block">
            <div className="absolute inset-0 bg-[#2D2D2D] translate-x-2 translate-y-2 rounded-xl group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
            <div className="relative z-10 bg-white border-4 border-[#2D2D2D] px-8 py-4 font-black uppercase tracking-widest rounded-xl group-hover:-translate-y-1 transition-transform text-xs md:text-sm">
              Meet the Full Cast 🎭
            </div>
          </Link>
        </div>
        
        {/* 👥 The Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-16 md:gap-y-24 gap-x-8 md:gap-x-12">
          {team.slice(0, 5).map((m, index) => {
            // Checks both 'photo' and 'image' fields from Firebase
            const memberImage = m.photo || m.image;

            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center group text-center"
              >
                <div className="relative mb-6 w-full max-w-[180px] aspect-square">
                  <div className="absolute inset-0 bg-[#06D6A0] translate-x-3 translate-y-3 rounded-full transition-transform group-hover:translate-x-1 group-hover:translate-y-1 border-2 border-black" />
                  <div className="relative h-full w-full rounded-full border-4 border-[#2D2D2D] overflow-hidden bg-gray-200">
                    {memberImage ? (
                      <img 
                        src={memberImage} 
                        alt={m.name}
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black opacity-20 text-xl uppercase">
                        Actor
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="font-black uppercase text-lg md:text-xl group-hover:text-[#FF5F5F] transition-colors leading-tight">
                  {m.name || "Performer"}
                </h4>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mt-1">
                  {m.role || "Member"}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
