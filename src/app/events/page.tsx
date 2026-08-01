"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header"; 
import { motion, AnimatePresence } from "framer-motion";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'archive'>('upcoming');
  
  // Unified Modal State
  const [modalContent, setModalContent] = useState<{ type: 'video' | 'pdf', url: string } | null>(null);

  // RSVP State
  const [rsvpModal, setRsvpModal] = useState<any | null>(null);
  const [rsvpForm, setRsvpForm] = useState({ name: "", email: "", phone: "", branch: "" });
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | false>(false);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Helpers
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("watch?v=")) videoId = url.split("watch?v=")[1]?.split("&")[0];
    else if (url.includes("/shorts/")) videoId = url.split("/shorts/")[1]?.split("?")[0];
    else if (url.includes("/live/")) videoId = url.split("/live/")[1]?.split("?")[0];
    else if (url.includes("/embed/")) videoId = url.split("/embed/")[1]?.split("?")[0];

    if (videoId && videoId.length === 11) {
      // Adding playsinline=1 (critical for iOS/iPadOS) and dynamically appending origin to satisfy Safari's strict cross-origin policies
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&origin=${origin}`;
    }
    return url;
  };

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

  const spotlightEvent = events.find(e => e.isSpotlight) || events.find(e => e.status === "Upcoming") || events[0];
  const upcomingEvents = events.filter(e => e.status === "Upcoming" && e.id !== spotlightEvent?.id);
  const archivedEvents = events.filter(e => e.status !== "Upcoming" && e.id !== spotlightEvent?.id);

  useEffect(() => {
    if (!spotlightEvent || spotlightEvent.status !== "Upcoming") return;
    
    // Use the event's exact time, defaulting to 6 PM if not set
    const eventTime = spotlightEvent.time || "18:00";
    const targetDate = new Date(`${spotlightEvent.date}T${eventTime}:00`).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [spotlightEvent]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "rsvps"), {
        eventId: rsvpModal.id,
        eventName: rsvpModal.title,
        userName: rsvpForm.name,
        userEmail: rsvpForm.email,
        userPhone: rsvpForm.phone,
        userBranch: rsvpForm.branch,
        isCheckedIn: false,
        createdAt: serverTimestamp()
      });
      setRsvpSuccess(docRef.id);
      setRsvpForm({ name: "", email: "", phone: "", branch: "" });
    } catch (err) {
      alert("Error submitting RSVP. Please try again.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const EventCard = ({ ev }: { ev: any }) => (
    <div 
      className="bg-white border-4 border-[var(--border-primary)] rounded-[2rem] shadow-[12px_12px_0px_var(--border-primary)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_#FF5F5F] transition-all duration-400 group flex flex-col h-full relative"
    >
      <div className="p-5">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border-4 border-[var(--border-primary)] mb-6">
          {ev.image ? (
             <img src={ev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ev.title} />
          ) : (
             <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl">🎭</div>
          )}
          
          <div className="absolute top-4 left-4">
            <span className="bg-[#FFD166] border-2 border-[var(--border-primary)] px-3 py-1 rounded-md text-[9px] font-black uppercase shadow-[3px_3px_0px_var(--border-primary)]">
              {ev.status}
            </span>
          </div>

          {/* Play Button Overlay Trigger */}
          {(ev.teaserUrl || ev.fullVideoUrl) && (
            <button 
              onClick={() => setModalContent({ 
                type: 'video', 
                url: getEmbedUrl(ev.fullVideoUrl || ev.teaserUrl) 
              })}
              className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]/30 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
            >
              <div className="bg-white border-4 border-[var(--border-primary)] w-16 h-16 rounded-full flex items-center justify-center shadow-[4px_4px_0px_var(--border-primary)] group-hover:scale-110 active:scale-95 transition-transform">
                 <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-[#FF5F5F] border-b-[10px] border-b-transparent ml-1" />
              </div>
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          <h3 className="font-cinzel text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none">{ev.title}</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF5F5F] rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-[#FF5F5F] tracking-widest uppercase">{ev.date}</p>
          </div>
          <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-3 italic">"{ev.description}"</p>
        </div>
      </div>
      
      {/* 🎟️ Perforated Ticket Divider */}
      <div className="relative h-8 flex items-center w-full my-2 overflow-hidden">
        <div className="absolute -left-4 w-8 h-8 bg-[var(--bg-primary)] rounded-full border-4 border-[var(--border-primary)]" />
        <div className="w-full border-t-4 border-dashed border-[var(--border-primary)]/40 mx-4 mt-2" />
        <div className="absolute -right-4 w-8 h-8 bg-[var(--bg-primary)] rounded-full border-4 border-[var(--border-primary)]" />
      </div>

      <div className="p-5 pt-2 flex flex-col gap-4 mt-auto">
        <div className="flex flex-col gap-3">
            {ev.isRsvpEnabled && (
                <button 
                    onClick={() => { setRsvpModal(ev); setRsvpSuccess(false); }}
                    className="w-full bg-[#FFD166] text-[var(--text-primary)] border-4 border-[var(--border-primary)] px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all flex justify-between items-center"
                >
                    <span>RSVP / Tickets</span>
                    <span>🎟️</span>
                </button>
            )}
            {ev.fullVideoUrl && (
                <button 
                    onClick={() => setModalContent({ type: 'video', url: getEmbedUrl(ev.fullVideoUrl) })}
                    className="w-full bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all flex justify-between items-center group-hover:bg-[#06D6A0] group-hover:text-black group-hover:shadow-[4px_4px_0px_var(--border-primary)]"
                >
                    <span>Watch Full Show</span>
                    <span>▶</span>
                </button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {ev.teaserUrl && (
              <button 
                  onClick={() => setModalContent({ type: 'video', url: getEmbedUrl(ev.teaserUrl) })}
                  className="bg-white text-[var(--text-primary)] border-4 border-[var(--border-primary)] px-2 py-2 rounded-xl text-[9px] font-black uppercase shadow-[3px_3px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all"
              >
                  Teaser 🎬
              </button>
              )}
              {ev.playbillUrl && (
              <button 
                  onClick={() => setModalContent({ type: 'pdf', url: getPdfEmbedUrl(ev.playbillUrl) })}
                  className="bg-[#06D6A0] text-[var(--text-primary)] border-4 border-[var(--border-primary)] px-2 py-2 rounded-xl text-[9px] font-black uppercase shadow-[3px_3px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all"
              >
                  Playbill 📄
              </button>
              )}
            </div>
        </div>

        {/* Brutalist Barcode Footer */}
        <div className="flex justify-between items-end mt-4 opacity-30 group-hover:opacity-100 transition-opacity">
           <div className="font-black text-xl tracking-tighter leading-none text-[var(--border-primary)] scale-y-150 origin-bottom flex gap-[2px]">
              <span className="w-1 bg-[var(--border-primary)] h-4"></span>
              <span className="w-0.5 bg-[var(--border-primary)] h-4"></span>
              <span className="w-2 bg-[var(--border-primary)] h-4"></span>
              <span className="w-1 bg-[var(--border-primary)] h-4"></span>
              <span className="w-0.5 bg-[var(--border-primary)] h-4"></span>
              <span className="w-1 bg-[var(--border-primary)] h-4"></span>
              <span className="w-1.5 bg-[var(--border-primary)] h-4"></span>
              <span className="w-0.5 bg-[var(--border-primary)] h-4"></span>
              <span className="w-2 bg-[var(--border-primary)] h-4"></span>
           </div>
           <p className="font-black text-[7px] uppercase tracking-widest text-[var(--border-primary)]">SWG / {ev.id.slice(0,5)}</p>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-black uppercase text-[var(--text-primary)] tracking-widest">
      SETTING THE STAGE...
    </div>
  );

  return (
    <PageTransition>
      <Header />
      <main className="bg-[var(--bg-primary)] min-h-screen pb-32">
        
        {/* 🔥 THE FEATURED HERO SECTION */}
        {spotlightEvent && (
          <div className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden border-b-[12px] border-[var(--border-primary)] pt-20 bg-[var(--bg-primary)]">
            {/* Soft Light Background */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[var(--bg-primary)]" />
              {spotlightEvent.image && <img src={spotlightEvent.image} className="w-full h-full object-cover blur-[100px] opacity-10 scale-110" />}
            </div>
            
            <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
               {/* Poster */}
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="w-full max-w-md mx-auto aspect-[2/3] border-8 border-[var(--border-primary)] rounded-[3rem] overflow-hidden shadow-[20px_20px_0px_#FF5F5F] relative group bg-white"
               >
                  {spotlightEvent.image ? (
                     <img src={spotlightEvent.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                     <div className="w-full h-full bg-white" />
                  )}

                  {/* Hero Play Button Overlay */}
                  {(spotlightEvent.teaserUrl || spotlightEvent.fullVideoUrl) && (
                    <button 
                      onClick={() => setModalContent({ 
                        type: 'video', 
                        url: getEmbedUrl(spotlightEvent.fullVideoUrl || spotlightEvent.teaserUrl) 
                      })}
                      className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="bg-white border-4 border-[var(--border-primary)] w-20 h-20 rounded-full flex items-center justify-center shadow-[6px_6px_0px_var(--border-primary)] active:scale-90 transition-transform">
                        <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[22px] border-l-[#FF5F5F] border-b-[12px] border-b-transparent ml-2" />
                      </div>
                    </button>
                  )}
               </motion.div>
               
               {/* Info */}
               <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-8 text-center lg:text-left"
               >
                  <div>
                     <span className="inline-block bg-[#2D2D2D] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 border-[var(--border-primary)]">
                       {spotlightEvent.status === "Upcoming" ? "Next Up" : "Featured Spotlight"}
                     </span>
                     <h1 className="font-cinzel text-6xl md:text-8xl font-black text-[var(--text-primary)] uppercase leading-[0.9] tracking-tighter drop-shadow-[4px_4px_0px_#FFD166]">
                       {spotlightEvent.title}
                     </h1>
                     <p className="font-black text-xs md:text-sm uppercase tracking-[0.4em] text-[#FF5F5F] mt-4">
                       A Swaang Production • {spotlightEvent.date}
                     </p>
                  </div>
                  
                  <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed max-w-xl border-l-4 border-[#06D6A0] pl-4 italic mx-auto lg:mx-0">
                    "{spotlightEvent.description}"
                  </p>
                  
                  {/* Countdown Timer */}
                  {spotlightEvent.status === "Upcoming" && (
                    <div className="flex gap-4 justify-center lg:justify-start">
                       {[
                         { label: 'Days', value: timeLeft.days },
                         { label: 'Hours', value: timeLeft.hours },
                         { label: 'Mins', value: timeLeft.minutes },
                         { label: 'Secs', value: timeLeft.seconds }
                       ].map(t => (
                         <div key={t.label} className="bg-white border-4 border-[var(--border-primary)] rounded-2xl p-4 min-w-[70px] md:min-w-[80px] text-center shadow-[4px_4px_0px_var(--border-primary)]">
                            <span className="block text-2xl md:text-3xl font-black text-[#FF5F5F] leading-none">{t.value.toString().padStart(2, '0')}</span>
                            <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mt-2">{t.label}</span>
                         </div>
                       ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                    {spotlightEvent.isRsvpEnabled && (
                      <button onClick={() => {setRsvpModal(spotlightEvent); setRsvpSuccess(false)}} className="bg-[#FFD166] text-[var(--border-primary)] border-4 border-[var(--border-primary)] px-8 py-4 rounded-xl text-sm font-black uppercase shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all">
                         Secure Your Ticket 🎟️
                      </button>
                    )}
                    {spotlightEvent.teaserUrl && !spotlightEvent.fullVideoUrl && (
                      <button onClick={() => setModalContent({ type: 'video', url: getEmbedUrl(spotlightEvent.teaserUrl) })} className="bg-white text-[var(--border-primary)] border-4 border-[var(--border-primary)] px-8 py-4 rounded-xl text-sm font-black uppercase shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
                         <span className="text-[#FF5F5F]">▶</span> Watch Trailer
                      </button>
                    )}
                    {spotlightEvent.fullVideoUrl && (
                      <button onClick={() => setModalContent({ type: 'video', url: getEmbedUrl(spotlightEvent.fullVideoUrl) })} className="bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] px-8 py-4 rounded-xl text-sm font-black uppercase shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
                         <span className="text-white">▶</span> Watch Full Production
                      </button>
                    )}
                    {spotlightEvent.playbillUrl && (
                      <button onClick={() => setModalContent({ type: 'pdf', url: getPdfEmbedUrl(spotlightEvent.playbillUrl) })} className="bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] px-8 py-4 rounded-xl text-sm font-black uppercase shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
                         <span>📄</span> View Playbill
                      </button>
                    )}
                  </div>
               </motion.div>
            </div>
          </div>
        )}

        {/* 🔥 TABS & GRID SECTION */}
        <div className="container mx-auto px-6 mt-20">
          <div className="flex justify-center mb-16">
            <div className="inline-flex bg-white border-4 border-[var(--border-primary)] rounded-full p-2 shadow-[8px_8px_0px_var(--border-primary)]">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'upcoming' ? 'bg-[#06D6A0] text-[var(--border-primary)]' : 'text-gray-400 hover:text-[var(--border-primary)]'}`}
              >
                Upcoming Shows
              </button>
              <button 
                onClick={() => setActiveTab('archive')}
                className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'archive' ? 'bg-[#FF5F5F] text-white' : 'text-gray-400 hover:text-[var(--border-primary)]'}`}
              >
                The Archives
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            <AnimatePresence mode="popLayout">
              {(activeTab === 'upcoming' ? upcomingEvents : archivedEvents).map((ev) => (
                <motion.div 
                  key={ev.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventCard ev={ev} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {(activeTab === 'upcoming' ? upcomingEvents : archivedEvents).length === 0 && (
            <div className="text-center py-20 border-4 border-dashed border-[var(--border-primary)]/20 rounded-[3rem]">
               <h3 className="font-cinzel text-3xl font-black uppercase text-gray-400 mb-2">Stage is Empty</h3>
               <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No productions found in this category.</p>
            </div>
          )}
        </div>

        {/* UNIFIED MODAL */}
        <AnimatePresence>
          {modalContent && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[9999] bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
              onClick={() => setModalContent(null)}
            >
              <div 
                className={`relative w-full ${modalContent.type === 'pdf' ? 'max-w-5xl h-[85vh]' : 'max-w-5xl aspect-video'} bg-white border-8 border-[var(--border-primary)] rounded-[2rem] overflow-hidden shadow-[20px_20px_0px_#FF5F5F]`}
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setModalContent(null)} 
                  className="absolute top-4 right-4 z-[210] bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] w-12 h-12 rounded-full font-black text-xl hover:scale-110 transition-transform flex items-center justify-center"
                >
                  ✕
                </button>
                <iframe src={modalContent.url} className="w-full h-full bg-white" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RSVP MODAL */}
        <AnimatePresence>
          {rsvpModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[9999] bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
              onClick={() => !rsvpSuccess && setRsvpModal(null)}
            >
              <div 
                className="relative w-full max-w-lg bg-[var(--card-primary)] border-8 border-[var(--border-primary)] rounded-[3rem] p-8 shadow-[20px_20px_0px_#06D6A0]"
                onClick={e => e.stopPropagation()}
              >
                {!rsvpSuccess && (
                  <button 
                    onClick={() => setRsvpModal(null)} 
                    className="absolute top-6 right-6 z-[210] bg-white text-[var(--text-primary)] border-4 border-[var(--border-primary)] w-10 h-10 rounded-full font-black shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}

                {rsvpSuccess ? (
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-6">
                       <div className="bg-white p-2 rounded-xl border-4 border-[var(--border-primary)] shadow-[4px_4px_0px_var(--border-primary)]">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${rsvpSuccess}`} alt="Your Ticket QR" className="w-32 h-32" />
                       </div>
                    </div>
                    <h3 className="font-cinzel text-4xl font-black uppercase text-[var(--text-primary)] mb-4 drop-shadow-[2px_2px_0px_#06D6A0]">You're In!</h3>
                    <p className="font-bold text-gray-600 mb-8 uppercase tracking-widest text-xs">Present this QR code at the door for {rsvpModal.title}.</p>
                    <button 
                        onClick={() => setRsvpModal(null)}
                        className="bg-[#06D6A0] text-[var(--text-primary)] border-4 border-[var(--border-primary)] px-8 py-3 rounded-xl text-xs font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all"
                    >
                        Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-4 text-left">
                    <h3 className="font-cinzel text-3xl font-black uppercase text-[var(--text-primary)] leading-none mb-2">
                      Get Tickets for<br/><span className="text-[#06D6A0]">{rsvpModal.title}</span>
                    </h3>
                    
                    <input required type="text" placeholder="Full Name" value={rsvpForm.name} onChange={e => setRsvpForm({...rsvpForm, name: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-3 rounded-xl font-bold bg-white outline-none focus:border-[#06D6A0] transition-all" />
                    <input required type="email" placeholder="Email Address" value={rsvpForm.email} onChange={e => setRsvpForm({...rsvpForm, email: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-3 rounded-xl font-bold bg-white outline-none focus:border-[#06D6A0] transition-all" />
                    <input required type="tel" placeholder="Phone Number" value={rsvpForm.phone} onChange={e => setRsvpForm({...rsvpForm, phone: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-3 rounded-xl font-bold bg-white outline-none focus:border-[#06D6A0] transition-all" />
                    <input required type="text" placeholder="Branch & Year (e.g. CSE 3rd Year)" value={rsvpForm.branch} onChange={e => setRsvpForm({...rsvpForm, branch: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-3 rounded-xl font-bold bg-white outline-none focus:border-[#06D6A0] transition-all" />
                    
                    <button type="submit" disabled={rsvpSubmitting} className="w-full bg-[#FFD166] text-[var(--text-primary)] border-4 border-[var(--border-primary)] py-4 rounded-xl text-lg font-black uppercase shadow-[6px_6px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all mt-4">
                      {rsvpSubmitting ? "Securing Ticket..." : "Confirm RSVP"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}
