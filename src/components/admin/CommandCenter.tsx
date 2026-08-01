"use client";
import { Users, Mail, PlayCircle, Clock } from "lucide-react";
import CrewActivityFeed from "./CrewActivityFeed";

export default function CommandCenter({ stats }: { stats: any }) {
  return (
    <div className="space-y-8 text-left pb-12 w-full">
      <div className="border-b-8 border-[var(--border-primary)] pb-6 mb-8">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-[var(--text-primary)]">Master Hub</h2>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2">Swaang Operations Grid</p>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(14rem,auto)]">
        
        {/* BIG PRODUCTION CARD */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-[#2D2D2D] text-white border-8 border-[var(--border-primary)] rounded-[3rem] shadow-[15px_15px_0px_#FFD166] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:shadow-[5px_5px_0px_#FFD166] hover:translate-y-2 transition-all">
          <div className="absolute -right-10 -bottom-10 text-[18rem] opacity-5 text-white font-black leading-none group-hover:scale-110 transition-transform pointer-events-none">🎭</div>
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="w-16 h-16 bg-[#FFD166] rounded-2xl flex items-center justify-center border-4 border-[var(--border-primary)] shadow-[4px_4px_0px_var(--border-primary)] group-hover:shadow-none group-hover:translate-y-1 transition-all">
               <PlayCircle size={32} className="text-[var(--text-primary)]" />
            </div>
            <span className="font-black uppercase text-[9px] tracking-[0.3em] bg-white/10 px-4 py-2 rounded-full border border-white/20">Live Status</span>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-4 break-words group-hover:text-[#FFD166] transition-colors">{stats.activeShow}</h3>
            <p className="font-black uppercase text-[10px] tracking-widest text-[#FFD166]">Current Mainstage Production</p>
          </div>
        </div>

        {/* CALL TIME CARD */}
        <div className="md:col-span-1 lg:col-span-2 bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] rounded-[2.5rem] shadow-[8px_8px_0px_var(--border-primary)] p-6 md:p-8 flex flex-col justify-between hover:translate-y-1 hover:shadow-none transition-all group">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-white text-[#FF5F5F] p-3 rounded-xl border-2 border-[var(--border-primary)] group-hover:scale-110 transition-transform">
                <Clock size={24} strokeWidth={3} />
              </div>
              <span className="font-black uppercase text-[9px] tracking-widest opacity-60">Next Up</span>
           </div>
           <div className="mt-auto">
              <p className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter leading-tight mb-2 break-words">{stats.nextCall}</p>
              <p className="font-black uppercase text-[9px] tracking-widest opacity-80">Next Scheduled Call</p>
           </div>
        </div>

        {/* CREW STAT CARD */}
        <div className="md:col-span-1 bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] rounded-[2.5rem] shadow-[8px_8px_0px_var(--border-primary)] p-6 md:p-8 flex flex-col justify-between hover:translate-y-1 hover:shadow-none transition-all group">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-white p-3 rounded-xl border-2 border-[var(--border-primary)] group-hover:scale-110 transition-transform">
                <Users size={24} strokeWidth={3} />
              </div>
           </div>
           <div className="mt-auto">
              <p className="text-6xl font-black tracking-tighter leading-none mb-1 group-hover:scale-105 origin-left transition-transform">{stats.crewCount}</p>
              <p className="font-black uppercase text-[10px] tracking-widest opacity-60">Total Active Crew</p>
           </div>
        </div>

        {/* INBOX STAT CARD */}
        <div className="md:col-span-1 bg-[#FFD166] text-[var(--border-primary)] border-4 border-[var(--border-primary)] rounded-[2.5rem] shadow-[8px_8px_0px_var(--border-primary)] p-6 md:p-8 flex flex-col justify-between hover:translate-y-1 hover:shadow-none transition-all group">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-white p-3 rounded-xl border-2 border-[var(--border-primary)] group-hover:scale-110 transition-transform">
                <Mail size={24} strokeWidth={3} />
              </div>
           </div>
           <div className="mt-auto">
              <p className="text-6xl font-black tracking-tighter leading-none mb-1 group-hover:scale-105 origin-left transition-transform">{stats.unreadCount}</p>
              <p className="font-black uppercase text-[10px] tracking-widest opacity-60">Unread Inquiries</p>
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