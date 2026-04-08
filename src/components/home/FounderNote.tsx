"use client";
import { motion } from "framer-motion";

export default function FounderNote({ data }: { data: any }) {
  const DirectorCard = ({ name, note, img, color, role }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex flex-col group"
    >
      <div className="relative mb-6 aspect-[4/5] w-full">
        <div className={`absolute inset-0 ${color} translate-x-4 translate-y-4 rounded-[2rem] border-4 border-black`} />
        <div className="relative h-full w-full border-4 border-black rounded-[2rem] overflow-hidden bg-gray-200">
           {img ? (
             <img src={img} className="w-full h-full object-cover grayscale-0 group-hover:grayscale transition-all duration-500" />
           ) : (
             <div className="h-full w-full flex items-center justify-center font-black opacity-20 text-4xl uppercase -rotate-12">No Photo</div>
           )}
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{role}</span>
        <h4 className="text-3xl font-black uppercase tracking-tighter">{name || "Name TBD"}</h4>
        <p className="text-sm font-bold opacity-60 leading-tight italic">"{note || "Message coming soon..."}"</p>
      </div>
    </motion.div>
  );

  return (
    <section className="py-24 md:py-40 px-6 bg-white border-b-[12px] border-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-8xl font-black uppercase mb-20 tracking-tighter border-b-8 border-black inline-block">The Founders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-12">
          <DirectorCard role="Founder & Director" name={data.founderName} note={data.founderNote} img={data.founderImage} color="bg-[#FF5F5F]" />
          <DirectorCard role="Co-Founder" name={data.coFounder1Name} note={data.coFounder1Note} img={data.coFounder1Image} color="bg-[#06D6A0]" />
          <DirectorCard role="Co-Founder" name={data.coFounder2Name} note={data.coFounder2Note} img={data.coFounder2Image} color="bg-[#FFD166]" />
        </div>
      </div>
    </section>
  );
}