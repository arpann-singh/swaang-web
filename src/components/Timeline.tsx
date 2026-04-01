"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const Timeline = () => {
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      const snap = await getDocs(query(collection(db, "timeline"), orderBy("year", "asc")));
      setMilestones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchTimeline();
  }, []);

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {milestones.map((m, i) => (
          <div key={m.id} className="relative p-8 bg-white border-4 border-[#2D2D2D] rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D] hover:-translate-y-1 transition-all">
            <div className="absolute -top-5 left-8 bg-[#06D6A0] border-2 border-[#2D2D2D] px-4 py-1 rounded-full shadow-[4px_4px_0px_#2D2D2D]">
              <span className="font-black text-white text-sm">{m.year}</span>
            </div>
            <h4 className="font-cinzel font-black text-[#2D2D2D] text-lg mt-2 mb-3 uppercase tracking-tighter">{m.title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
