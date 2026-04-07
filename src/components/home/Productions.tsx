"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Productions({ events }: { events: any[] }) {
  return (
    <section className="py-40 px-6 bg-white border-b-[12px] border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <h2 className="font-cinzel text-7xl md:text-9xl font-black uppercase leading-none tracking-tighter">
            The <br/> <span className="bg-[#06D6A0] px-4 shadow-[10px_10px_0px_#2D2D2D]">Playbill</span>
          </h2>
          <Link href="/events" className="group relative inline-block">
            <div className="absolute inset-0 bg-[#2D2D2D] translate-x-2 translate-y-2 rounded-xl group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
            <div className="relative z-10 bg-white border-4 border-[#2D2D2D] px-8 py-4 font-black uppercase tracking-widest rounded-xl group-hover:-translate-y-1 transition-transform">
              Explore All Shows 🎭
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* 🔥 FIXED: Removed .slice(0, 3) to render dynamic list */}
          {events.map((e, i) => (
            <motion.div 
              key={e.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-[#2D2D2D] translate-x-4 translate-y-4 rounded-[3rem]" />
              <div className="relative z-10 bg-white border-4 border-[#2D2D2D] p-6 rounded-[3rem] group-hover:-translate-y-2 transition-transform duration-500">
                 <img src={e.image} className="w-full aspect-[4/5] object-cover rounded-[2rem] border-2 border-[#2D2D2D] mb-6 grayscale-0 group-hover:grayscale transition-all" />
                 <h4 className="text-3xl font-black uppercase tracking-tighter">{e.title}</h4>
                 <p className="text-xs font-bold text-[#FF5F5F] mt-2 uppercase tracking-widest">{e.date} • {e.status}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}