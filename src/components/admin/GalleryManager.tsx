"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, doc, deleteDoc, updateDoc, 
  serverTimestamp, onSnapshot, query, orderBy 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const GalleryManager = () => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Form State for New Upload
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    description: "",
    showOnHome: false
  });

  const IMGBB_API_KEY = "098e6a70fbe6f7594e40f4641a1998b0"; // 👈 ENSURE YOUR KEY IS HERE

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await addDoc(collection(db, "gallery"), {
          url: data.data.url,
          title: newPhoto.title || "Untitled Moment",
          description: newPhoto.description || "",
          showOnHome: newPhoto.showOnHome,
          createdAt: serverTimestamp()
        });
        setNewPhoto({ title: "", description: "", showOnHome: false });
        alert("Photo Staged in Gallery! ✨");
      }
    } catch (error) {
      alert("Cloud Upload Failed.");
    } finally {
      setUploading(false);
    }
  };

  const toggleHomeVisibility = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "gallery", id), { showOnHome: !current });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this memory from the archives?")) {
      await deleteDoc(doc(db, "gallery", id));
    }
  };

  return (
    <div className="space-y-12">
      <div className="border-b-4 border-[#2D2D2D] pb-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-[#2D2D2D]">The Gallery</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#06D6A0] mt-2">Curate the Visual Journey</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* --- UPLOAD & METADATA FORM --- */}
        <div className="xl:col-span-1">
          <div className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#2D2D2D] space-y-5 sticky top-10">
            <h2 className="font-black uppercase text-[#06D6A0] tracking-widest text-sm">New Archive Entry</h2>
            
            <input type="text" placeholder="Photo Title" value={newPhoto.title} onChange={e => setNewPhoto({...newPhoto, title: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold bg-[#FFF9F0]" />
            
            <textarea placeholder="Short Description (Event/Context)" value={newPhoto.description} onChange={e => setNewPhoto({...newPhoto, description: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl h-24 font-medium" />

            <div className="flex items-center gap-3 p-3 bg-[#FFD166]/10 border-2 border-dashed border-[#FFD166] rounded-xl">
              <input type="checkbox" checked={newPhoto.showOnHome} onChange={e => setNewPhoto({...newPhoto, showOnHome: e.target.checked})} className="w-5 h-5 accent-[#FFD166]" />
              <label className="text-[10px] font-black uppercase tracking-widest text-[#2D2D2D]">Show on Homepage</label>
            </div>

            <label className={`block text-center cursor-pointer bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              {uploading ? "Uploading..." : "Select & Upload Photo"}
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
          </div>
        </div>

        {/* --- PHOTO GRID WITH METADATA --- */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {gallery.map((img) => (
              <motion.div layout key={img.id} className="bg-white border-4 border-[#2D2D2D] rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_#2D2D2D] group">
                <div className="relative aspect-video border-b-4 border-[#2D2D2D]">
                  <img src={img.url} className="w-full h-full object-cover" alt={img.title} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => toggleHomeVisibility(img.id, img.showOnHome)} className={`p-2 rounded-full border-2 border-[#2D2D2D] shadow-[3px_3px_0px_#2D2D2D] transition-all ${img.showOnHome ? "bg-[#FFD166]" : "bg-white"}`}>
                      🏠
                    </button>
                    <button onClick={() => handleDelete(img.id)} className="p-2 bg-white rounded-full border-2 border-[#2D2D2D] shadow-[3px_3px_0px_#2D2D2D] hover:bg-red-50">
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black uppercase text-lg text-[#2D2D2D] tracking-tight truncate">{img.title}</h3>
                  <p className="text-[10px] font-medium text-gray-500 italic mt-1 line-clamp-2">{img.description || "No description provided."}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
