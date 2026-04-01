"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, doc, deleteDoc, updateDoc, 
  onSnapshot, query, orderBy 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const TeamManager = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const IMGBB_API_KEY = "098e6a70fbe6f7594e40f4641a1998b0"; // 👈 PASTE YOUR KEY HERE

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    branch: "",
    year: "",
    status: "current",
    showOnHome: false
  });

  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePhotoUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: body,
      });
      const data = await res.json();
      if (data.success) setFormData({ ...formData, image: data.data.url });
    } catch (err) {
      alert("Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      image: member.image,
      branch: member.branch || "",
      year: member.year || "",
      status: member.status || "current",
      showOnHome: member.showOnHome || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload a photo first!");
    try {
      if (editingId) {
        await updateDoc(doc(db, "team", editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "team"), { ...formData, isArtistOfMonth: false });
      }
      setFormData({ name: "", role: "", image: "", branch: "", year: "", status: "current", showOnHome: false });
    } catch (err) {
      alert("Error saving artist profile.");
    }
  };

  // Logic for Artist of the Month (Only 1 at a time)
  const toggleAOTM = async (id: string, current: boolean) => {
    if (!current) {
      for (const m of team) {
        if (m.isArtistOfMonth) await updateDoc(doc(db, "team", m.id), { isArtistOfMonth: false });
      }
    }
    await updateDoc(doc(db, "team", id), { isArtistOfMonth: !current });
  };

  // Logic for Home Visibility (Multiple allowed)
  const toggleHomeVisibility = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "team", id), { showOnHome: !current });
  };

  if (loading) return <div className="p-10 font-black text-gray-400">Loading the Ensemble...</div>;

  return (
    <div className="space-y-12">
      <div className="border-b-4 border-[#2D2D2D] pb-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-[#2D2D2D]">Ensemble Directory</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#2D2D2D] space-y-5 sticky top-10">
            <h2 className="font-black uppercase text-[#06D6A0] tracking-widest text-sm">
              {editingId ? "Update Member" : "New Member"}
            </h2>
            <div className="relative group w-full h-44 bg-[#FFF9F0] border-4 border-dashed border-[#2D2D2D] rounded-3xl overflow-hidden flex items-center justify-center">
              {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="preview" /> : <span className="text-[10px] font-black uppercase opacity-30">{uploading ? "Uploading..." : "Click to Upload Photo"}</span>}
              <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
            <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold bg-[#FFF9F0]" />
            <input required type="text" placeholder="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Branch" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs" />
              <input type="text" placeholder="Year" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={uploading} className="flex-1 bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
                {editingId ? "Save Profile" : "Onboard"}
              </button>
              {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:"", role:"", image:"", branch:"", year:"", status:"current", showOnHome:false})}} className="bg-gray-200 border-4 border-[#2D2D2D] px-4 rounded-xl font-black uppercase text-xs">X</button>}
            </div>
          </form>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <AnimatePresence>
            {team.map((m) => (
              <motion.div layout key={m.id} className="bg-white border-4 border-[#2D2D2D] p-5 rounded-[2rem] shadow-[6px_6px_0px_#2D2D2D] flex flex-col md:flex-row items-center gap-5">
                <img src={m.image} alt={m.name} className={`w-16 h-16 rounded-full object-cover border-4 border-[#2D2D2D] ${m.isArtistOfMonth ? "border-[#FF5F5F]" : ""}`} />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-black uppercase tracking-tight">{m.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                    {m.isArtistOfMonth && <span className="bg-[#FF5F5F] text-white text-[8px] font-black px-2 py-0.5 rounded border border-[#2D2D2D]">🏆 AOTM</span>}
                    {m.showOnHome && <span className="bg-[#FFD166] text-[#2D2D2D] text-[8px] font-black px-2 py-0.5 rounded border border-[#2D2D2D]">🏠 HOME</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => toggleAOTM(m.id, m.isArtistOfMonth)} className={`px-3 py-2 rounded-xl border-2 border-[#2D2D2D] font-black text-[9px] uppercase shadow-[2px_2px_0px_#2D2D2D] ${m.isArtistOfMonth ? "bg-[#FF5F5F] text-white" : "bg-white"}`}>🏆 AOTM</button>
                  <button onClick={() => toggleHomeVisibility(m.id, m.showOnHome)} className={`px-3 py-2 rounded-xl border-2 border-[#2D2D2D] font-black text-[9px] uppercase shadow-[2px_2px_0px_#2D2D2D] ${m.showOnHome ? "bg-[#FFD166]" : "bg-white"}`}>🏠 HOME</button>
                  <button onClick={() => handleEdit(m)} className="bg-white border-2 border-[#2D2D2D] px-3 py-2 rounded-xl text-[9px] font-black uppercase">Edit</button>
                  <button onClick={() => deleteDoc(doc(db, "team", m.id))} className="bg-white text-red-500 border-2 border-red-500 p-2 rounded-xl">🗑️</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default TeamManager;
