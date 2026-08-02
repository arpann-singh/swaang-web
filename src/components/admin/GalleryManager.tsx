"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, doc, deleteDoc, updateDoc, 
  serverTimestamp, onSnapshot, query, orderBy 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Home, Trash2, X, Check } from "lucide-react";

const GalleryManager = () => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    description: "",
    showOnHome: false
  });

  const IMGBB_API_KEY = "098e6a70fbe6f7594e40f4641a1998b0";

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleBulkUpload = async (e: any) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    for (const file of files as File[]) {
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
            title: newPhoto.title || `Archive ${new Date().toLocaleDateString()}`,
            description: newPhoto.description || "Awaiting admin curation.",
            showOnHome: newPhoto.showOnHome,
            status: "Pending Curation",
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Bulk item failed:", error);
      }
    }
    
    setUploading(false);
    setNewPhoto({ title: "", description: "", showOnHome: false });
    alert("Bulk Staging Complete! 🎞️");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    try {
      await updateDoc(doc(db, "gallery", editingPhoto.id), {
        title: editingPhoto.title,
        description: editingPhoto.description,
        status: "Curated"
      });
      setEditingPhoto(null);
    } catch (err) {
      alert("Update failed.");
    }
  };

  const toggleHomeVisibility = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "gallery", id), { showOnHome: !current });
  };

  const handleDelete = async (id: string) => {
    if (confirm("REMOVE FROM ARCHIVES? THIS CANNOT BE UNDONE.")) {
      await deleteDoc(doc(db, "gallery", id));
    }
  };

  return (
    <div className="space-y-12 pb-40">
      <div className="border-b-8 border-black pb-4 mb-4 flex items-center">
         <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black bg-[#FFD166] px-6 py-3 border-4 border-black inline-block shadow-[8px_8px_0px_black]">The Gallery</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-1">
          
          {/* 🔥 DYNAMIC FORM: SWITCHES BETWEEN UPLOAD AND EDIT */}
          {!editingPhoto ? (
            <div className="bg-[#FFF9F0] border-8 border-black p-8 shadow-[12px_12px_0px_#06D6A0] space-y-6 sticky top-10">
              <div className="border-b-8 border-black pb-4">
                <h2 className="font-mono font-black uppercase text-black bg-[#06D6A0] inline-block px-2 py-1 tracking-widest border-2 border-black text-sm">Bulk Upload (Crew)</h2>
              </div>
              
              <div className="space-y-4">
                  <input type="text" placeholder="GENERAL TITLE (OPTIONAL)" value={newPhoto.title} onChange={e => setNewPhoto({...newPhoto, title: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
                  
                  <textarea placeholder="General Description" value={newPhoto.description} onChange={e => setNewPhoto({...newPhoto, description: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-bold h-24 resize-none shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-black text-white border-4 border-black shadow-[4px_4px_0px_black]">
                <input type="checkbox" checked={newPhoto.showOnHome} onChange={e => setNewPhoto({...newPhoto, showOnHome: e.target.checked})} className="w-6 h-6 accent-[#FFD166] cursor-pointer" />
                <label className="text-[10px] font-mono font-black uppercase tracking-widest">Show on Homepage</label>
              </div>

              <label className={`block text-center cursor-pointer bg-[#06D6A0] text-black border-4 border-black py-4 font-black uppercase text-sm shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_black] hover:bg-[#FFD166] transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading ? "PROCESSING BULK..." : "SELECT MULTIPLE PHOTOS"}
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
              </label>
            </div>
          ) : (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-[#FFD166] border-8 border-black p-8 shadow-[12px_12px_0px_#FF5F5F] space-y-6 sticky top-10">
              <div className="border-b-8 border-black pb-4">
                <h2 className="font-mono font-black uppercase text-black bg-[#FF5F5F] inline-block px-2 py-1 tracking-widest border-2 border-black text-sm">Curate Archive</h2>
              </div>
              <div className="aspect-video border-4 border-black bg-black">
                <img src={editingPhoto.url} className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-4">
                  <input required type="text" value={editingPhoto.title} onChange={e => setEditingPhoto({...editingPhoto, title: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
                  <textarea value={editingPhoto.description} onChange={e => setEditingPhoto({...editingPhoto, description: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-bold h-32 resize-none shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
              </div>

              <div className="flex gap-4">
                <button onClick={handleUpdate} className="flex-1 bg-black text-[#06D6A0] border-4 border-black py-4 font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_#06D6A0] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                  <Check size={16} strokeWidth={3} /> SAVE
                </button>
                <button onClick={() => setEditingPhoto(null)} className="flex-1 bg-white text-black border-4 border-black py-4 font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[#FF5F5F] hover:text-white transition-all flex items-center justify-center gap-2">
                  <X size={16} strokeWidth={3} /> ABORT
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {gallery.map((img) => (
              <motion.div layout key={img.id} className="bg-white border-8 border-black overflow-hidden shadow-[12px_12px_0px_black] group flex flex-col hover:-translate-y-2 hover:shadow-[16px_16px_0px_black] transition-all">
                <div className="relative aspect-video border-b-8 border-black bg-black">
                  <img src={img.url} className="w-full h-full object-cover transition-all" alt={img.title} />
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => setEditingPhoto(img)} className="p-3 bg-[#06D6A0] border-4 border-black shadow-[4px_4px_0px_black] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all text-black" title="Edit Data">
                      <Pencil size={16} strokeWidth={3} />
                    </button>
                    <button onClick={() => toggleHomeVisibility(img.id, img.showOnHome)} className={`p-3 border-4 border-black shadow-[4px_4px_0px_black] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all text-black ${img.showOnHome ? "bg-[#FFD166]" : "bg-white"}`} title="Toggle Homepage">
                      <Home size={16} strokeWidth={3} />
                    </button>
                    <button onClick={() => handleDelete(img.id)} className="p-3 bg-white border-4 border-black shadow-[4px_4px_0px_black] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:bg-[#FF5F5F] hover:text-white transition-all text-black" title="Delete Image">
                      <Trash2 size={16} strokeWidth={3} />
                    </button>
                  </div>

                  {img.status === "Pending Curation" && (
                    <div className="absolute bottom-4 left-4 bg-[#FF5F5F] border-2 border-black text-black font-mono text-[10px] font-black px-2 py-1 uppercase tracking-widest shadow-[2px_2px_0px_black]">NEEDS TITLE</div>
                  )}
                </div>
                
                <div className="p-6 flex-1 bg-[#FFF9F0]">
                  <h3 className="font-black uppercase text-xl text-black tracking-tight line-clamp-1">{img.title}</h3>
                  <p className="text-xs font-mono font-black text-gray-600 mt-2 line-clamp-2 uppercase leading-relaxed">{img.description || "NO_DESCRIPTION_PROVIDED"}</p>
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