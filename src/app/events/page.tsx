"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import SectionHeader from "@/components/SectionHeader";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(query(collection(db, "events"), orderBy("date", "desc")));
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase text-[#2D2D2D]">Curtains Rising...</div>;

  return (
    <PageTransition>
      <main className="bg-[#FFF9F0] pt-40 min-h-screen">
        <SectionHeader title="Productions" subtitle="Live on the Stage" emoji="🎬" color="#FF5F5F" />
        
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {events.map((ev) => (
            <div 
              key={ev.id} 
              className="bg-white border-4 border-[#2D2D2D] p-6 rounded-[3rem] shadow-[12px_12px_0px_#2D2D2D] hover:-translate-y-3 hover:shadow-[20px_20px_0px_#2D2D2D] transition-all duration-500 group"
            >
              {/* POSTER AREA */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border-2 border-[#2D2D2D] mb-8">
                <img src={ev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ev.title} />
                
                {/* TEASER OVERLAY */}
                {ev.teaserUrl && (
                  <button 
                    onClick={() => setActiveVideo(ev.teaserUrl)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-white border-4 border-[#2D2D2D] w-16 h-16 rounded-full flex items-center justify-center shadow-[4px_4px_0px_#2D2D2D] active:scale-90 transition-transform">
                       <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#FF5F5F] border-b-[10px] border-b-transparent ml-1" />
                    </div>
                  </button>
                )}

                <div className="absolute top-4 left-4">
                  <span className="bg-[#FFD166] border-2 border-[#2D2D2D] px-4 py-1 rounded-full text-[9px] font-black uppercase shadow-[3px_3px_0px_#2D2D2D]">
                    {ev.status}
                  </span>
                </div>
              </div>
              
              <h3 className="font-playfair text-3xl font-black text-[#2D2D2D] mb-4 tracking-tighter italic">{ev.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                {ev.description || "No synopsis available."}
              </p>
              
              {/* ACTION BUTTONS */}
              <div className="pt-6 border-t-4 border-[#2D2D2D]/5 flex flex-wrap gap-4">
                {ev.playbillUrl && (
                  <a 
                    href={ev.playbillUrl} 
                    target="_blank" 
                    className="flex-1 text-center bg-[#06D6A0] text-[#2D2D2D] border-2 border-[#2D2D2D] px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_#2D2D2D] active:translate-y-1 active:shadow-none transition-all"
                  >
                    View Playbill (PDF)
                  </a>
                )}
                {ev.teaserUrl && (
                  <button 
                    onClick={() => setActiveVideo(ev.teaserUrl)}
                    className="flex-1 bg-white text-[#2D2D2D] border-2 border-[#2D2D2D] px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_#2D2D2D] active:translate-y-1 active:shadow-none transition-all"
                  >
                    Watch Teaser
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* VIDEO MODAL */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-[#FFF9F0]/90 backdrop-blur-md flex items-center justify-center p-6"
              onClick={() => setActiveVideo(null)}
            >
              <div className="relative w-full max-w-4xl aspect-video bg-white border-8 border-[#2D2D2D] rounded-[3rem] overflow-hidden shadow-[30px_30px_0px_#2D2D2D]">
                <iframe 
                  src={activeVideo.replace("watch?v=", "embed/")} 
                  className="w-full h-full"
                  allowFullScreen
                />
                <button className="absolute top-6 right-6 bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] w-12 h-12 rounded-full font-black shadow-[4px_4px_0px_#2D2D2D]">X</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-40" />
        <Footer />
      </main>
    </PageTransition>
  );
}
