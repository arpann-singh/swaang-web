"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import SectionHeader from "@/components/SectionHeader";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/ui/Footer";
import Header from "@/components/Header"; 
import { motion, AnimatePresence } from "framer-motion";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Unified Modal State for Video & PDF
  const [modalContent, setModalContent] = useState<{ type: 'video' | 'pdf', url: string } | null>(null);

  // Helper: YouTube Embed Fixer
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  // Helper: Drive PDF Embed Fixer
  const getPdfEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      return url.replace(/\/view.*$/, "/preview").replace(/\/edit.*$/, "/preview");
    }
    return url;
  };

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase text-[#2D2D2D] tracking-widest">
      SETTING THE STAGE...
    </div>
  );

  return (
    <PageTransition>
      <Header />
      <main className="bg-[#FFF9F0] pt-40 min-h-screen">
        <SectionHeader title="Productions" subtitle="The Swaang Playbill" emoji="🎬" color="#FF5F5F" />
        
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 pb-32">
          {events.map((ev) => (
            <div 
              key={ev.id} 
              className="bg-white border-4 border-[#2D2D2D] p-6 rounded-[3rem] shadow-[12px_12px_0px_#2D2D2D] hover:-translate-y-3 hover:shadow-[20px_20px_0px_#FF5F5F] transition-all duration-500 group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border-4 border-[#2D2D2D] mb-8">
                {ev.image ? (
                   <img src={ev.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={ev.title} />
                ) : (
                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">🎭</div>
                )}
                
                <div className="absolute top-4 left-4">
                  <span className="bg-[#FFD166] border-2 border-[#2D2D2D] px-4 py-1 rounded-full text-[9px] font-black uppercase shadow-[3px_3px_0px_#2D2D2D]">
                    {ev.status}
                  </span>
                </div>

                {/* Overly Trigger (Teaser Default) */}
                {(ev.teaserUrl || ev.fullVideoUrl) && (
                  <button 
                    onClick={() => setModalContent({ 
                      type: 'video', 
                      url: getEmbedUrl(ev.fullVideoUrl || ev.teaserUrl) 
                    })}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-white border-4 border-[#2D2D2D] w-16 h-16 rounded-full flex items-center justify-center shadow-[4px_4px_0px_#2D2D2D] active:scale-90 transition-transform">
                       <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#FF5F5F] border-b-[10px] border-b-transparent ml-1" />
                    </div>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-cinzel text-3xl font-black text-[#2D2D2D] tracking-tighter uppercase leading-none">{ev.title}</h3>
                <p className="text-[10px] font-black text-[#FF5F5F] tracking-widest uppercase">{ev.date}</p>
                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3 italic">"{ev.description}"</p>
              </div>
              
              {/* ACTION BUTTONS */}
              <div className="pt-8 border-t-4 border-[#2D2D2D]/5 mt-8 flex flex-col gap-4">
                <div className="flex gap-4">
                    {ev.playbillUrl && (
                    <button 
                        onClick={() => setModalContent({ type: 'pdf', url: getPdfEmbedUrl(ev.playbillUrl) })}
                        className="flex-1 text-center bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#2D2D2D] px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_#2D2D2D] active:translate-y-1 transition-all"
                    >
                        Playbill 📄
                    </button>
                    )}
                    {ev.teaserUrl && (
                    <button 
                        onClick={() => setModalContent({ type: 'video', url: getEmbedUrl(ev.teaserUrl) })}
                        className="flex-1 bg-white text-[#2D2D2D] border-4 border-[#2D2D2D] px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_#2D2D2D] active:translate-y-1 transition-all"
                    >
                        Teaser 🎬
                    </button>
                    )}
                </div>

                {/* 🔥 NEW FULL PRODUCTION BUTTON */}
                {ev.fullVideoUrl && (
                    <button 
                        onClick={() => setModalContent({ type: 'video', url: getEmbedUrl(ev.fullVideoUrl) })}
                        className="w-full bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] px-4 py-4 rounded-xl text-[11px] font-black uppercase shadow-[6px_6px_0px_#2D2D2D] active:translate-y-1 active:shadow-none transition-all"
                    >
                        Watch Full Production 🎬✨
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* UNIFIED MODAL */}
        <AnimatePresence>
          {modalContent && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[200] bg-[#2D2D2D]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
              onClick={() => setModalContent(null)}
            >
              <div 
                className={`relative w-full ${modalContent.type === 'pdf' ? 'max-w-5xl h-[85vh]' : 'max-w-4xl aspect-video'} bg-white border-8 border-[#2D2D2D] rounded-[3rem] overflow-hidden shadow-[30px_30px_0px_#2D2D2D]`}
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setModalContent(null)} 
                  className="absolute top-6 right-6 z-[210] bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] w-12 h-12 rounded-full font-black shadow-[4px_4px_0px_#2D2D2D]"
                >
                  ✕
                </button>
                <iframe src={modalContent.url} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}
