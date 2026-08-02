"use client";
import { Users, Mail, PlayCircle, Clock } from "lucide-react";
import CrewActivityFeed from "./CrewActivityFeed";

export default function CommandCenter({ stats }: { stats: any }) {
  return (
    <div className="space-y-8 text-left pb-12 w-full">
      <div className="border-b-8 border-[#FFF9F0]/20 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-6xl font-cinzel font-black tracking-tighter uppercase text-[#FFF9F0]">Master Hub</h2>
          <p className="text-[10px] md:text-xs font-mono font-black uppercase tracking-[0.4em] text-[#06D6A0] mt-2">Swaang Operations Grid</p>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(14rem,auto)]">
        
        {/* BIG PRODUCTION CARD */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-black text-white border-8 border-[#FFD166] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:shadow-[8px_8px_0px_#FFD166] transition-all shadow-[16px_16px_0px_#FFD166]">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,209,102,0.1)_25%,transparent_25%,transparent_50%,rgba(255,209,102,0.1)_50%,rgba(255,209,102,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] pointer-events-none opacity-20" />
          <div className="absolute -right-10 -bottom-10 text-[18rem] opacity-5 text-white font-black leading-none group-hover:scale-110 transition-transform pointer-events-none">🎭</div>
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="w-16 h-16 bg-[#FFD166] flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_black] group-hover:shadow-none group-hover:translate-y-1 transition-all">
               <PlayCircle size={32} className="text-black" />
            </div>
            <span className="font-mono font-black uppercase text-[10px] tracking-[0.3em] bg-[#FFD166] text-black px-4 py-2 border-2 border-black">Live Status</span>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-4 break-words group-hover:text-[#FFD166] transition-colors">{stats.activeShow}</h3>
            <p className="font-mono font-black uppercase text-[10px] tracking-widest text-[#FFD166] opacity-80">&gt; Current Mainstage Production</p>
          </div>
        </div>

        {/* CALL TIME CARD */}
        <div className="md:col-span-1 lg:col-span-2 bg-[#FF5F5F] text-black border-8 border-black shadow-[12px_12px_0px_black] p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[16px_16px_0px_black] transition-all group">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-black text-[#FF5F5F] p-4 border-4 border-black group-hover:scale-110 transition-transform shadow-[4px_4px_0px_white]">
                <Clock size={28} strokeWidth={4} />
              </div>
              <span className="font-mono font-black uppercase text-[10px] tracking-widest bg-white px-2 py-1 border-2 border-black">Next Up</span>
           </div>
           <div className="mt-auto">
              <p className="text-3xl lg:text-4xl font-black tracking-tighter leading-tight mb-2 break-words">{stats.nextCall}</p>
              <p className="font-mono font-black uppercase text-[10px] tracking-widest opacity-80">&gt; Next Scheduled Call</p>
           </div>
        </div>

        {/* CREW STAT CARD */}
        <div className="md:col-span-1 bg-[#06D6A0] text-black border-8 border-black shadow-[12px_12px_0px_black] p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[16px_16px_0px_black] transition-all group">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-black text-[#06D6A0] p-4 border-4 border-black group-hover:scale-110 transition-transform shadow-[4px_4px_0px_white]">
                <Users size={28} strokeWidth={4} />
              </div>
           </div>
           <div className="mt-auto">
              <p className="font-mono text-7xl font-black tracking-tighter leading-none mb-2 group-hover:scale-105 origin-left transition-transform">{stats.crewCount}</p>
              <p className="font-mono font-black uppercase text-[10px] tracking-widest opacity-80">&gt; Total Active Crew</p>
           </div>
        </div>

        {/* INBOX STAT CARD */}
        <div className="md:col-span-1 bg-[#FFF9F0] text-black border-8 border-black shadow-[12px_12px_0px_black] p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[16px_16px_0px_black] transition-all group">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-black text-[#FFF9F0] p-4 border-4 border-black group-hover:scale-110 transition-transform shadow-[4px_4px_0px_#FFD166]">
                <Mail size={28} strokeWidth={4} />
              </div>
           </div>
           <div className="mt-auto">
              <p className="font-mono text-7xl font-black tracking-tighter leading-none mb-2 group-hover:scale-105 origin-left transition-transform">{stats.unreadCount}</p>
              <p className="font-mono font-black uppercase text-[10px] tracking-widest opacity-80">&gt; Unread Inquiries</p>
           </div>
        </div>

        {/* ACTIVITY FEED (Spans full width at bottom of bento) */}
        <div className="md:col-span-2 lg:col-span-4 mt-2">
          <CrewActivityFeed />
        </div>

      </div>
    </div>
  );
}