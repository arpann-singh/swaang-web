"use client";
import { Users, Mail, PlayCircle, Clock } from "lucide-react";
import CrewActivityFeed from "./CrewActivityFeed";

export default function CommandCenter({ stats }: { stats: any }) {
  const cards = [
    { label: "Total Active Crew", value: stats.crewCount, icon: Users, color: "bg-[#FF5F5F]" },
    { label: "Unread Inquiries", value: stats.unreadCount, icon: Mail, color: "bg-[#FFD166]" },
    { label: "Current Production", value: stats.activeShow, icon: PlayCircle, color: "bg-[#06D6A0]" },
    { label: "Next Call Time", value: stats.nextCall, icon: Clock, color: "bg-white" },
  ];

  return (
    <div className="space-y-10 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} border-4 border-[#2D2D2D] p-6 rounded-[2.5rem] shadow-[8px_8px_0px_#2D2D2D] flex flex-col justify-between h-48`}>
            <div className="flex justify-between items-start">
              <card.icon size={32} className="text-[#2D2D2D]" />
              <span className="font-black uppercase text-[10px] tracking-widest opacity-60">Live Stat</span>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tighter leading-none mb-2">{card.value}</p>
              <p className="font-black uppercase text-[10px] tracking-wider opacity-80">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Placeholder for Crew Activity Feed */}
      <CrewActivityFeed />
    </div>
  );
}