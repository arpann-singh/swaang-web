"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import SectionHeader from "@/components/SectionHeader";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const snap = await getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc")));
      setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchGallery();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase text-[#2D2D2D]">Developing Films...</div>;

  return (
    <PageTransition>
      <main className="bg-[#FFF9F0] pt-40 pb-40 min-h-screen">
        <SectionHeader title="Captured" subtitle="Glimpses of Swaang" emoji="📸" color="#06D6A0" />
        
        <div className="container mx-auto px-6 columns-1 md:columns-2 lg:columns-4 gap-8 space-y-8">
          {images.map((img, i) => (
            <div 
              key={img.id} 
              className="break-inside-avoid bg-white border-4 border-[#2D2D2D] rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_#2D2D2D] hover:scale-[1.02] hover:-rotate-1 transition-all duration-300"
            >
              <img src={img.url} className="w-full h-auto border-b-2 border-[#2D2D2D]" alt="Gallery Capture" />
              {img.caption && (
                <div className="p-4 bg-white">
                  <p className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-widest">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="h-40" />
        <Footer />
      </main>
    </PageTransition>
  );
}
