"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, addDoc, deleteDoc, 
  doc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamManager() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [graduatingId, setGraduatingId] = useState<string | null>(null);
  const [gradData, setGradData] = useState({ passoutYear: "", tenure: "" });

  const initialForm = {
    name: "",
    role: "",
    description: "",
    branch: "",       
    year: "",         
    instagram: "",
    linkedin: "",
    github: "",
    image: "",
    category: "active", 
    tenure: "",       
    passoutYear: "",  
    joiningYear: "", 
    isActive: true,    
    isSpotlight: false,
    isCurrentPresident: false
  };

  const [formData, setFormData] = useState(initialForm);
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "team"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      // 🔥 Sorting by joiningYear (Oldest First)
      fetched.sort((a, b) => (parseInt(a.joiningYear) || 9999) - (parseInt(b.joiningYear) || 9999));
      setTeam(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleField = async (id: string, field: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "team", id), { [field]: !current });
    } catch (err) { alert("Update failed."); }
  };

  const handleGraduate = async () => {
    if (!graduatingId) return;
    try {
      await updateDoc(doc(db, "team", graduatingId), {
        category: "alumni",
        passoutYear: gradData.passoutYear,
        tenure: gradData.tenure,
        isActive: false,
        isCurrentPresident: false
      });
      setGraduatingId(null);
      setGradData({ passoutYear: "", tenure: "" });
      alert("Member Graduated! 🎓");
    } catch (err) { alert("Error."); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) setFormData(prev => ({ ...prev, image: json.data.url }));
    } catch (err) { alert("Upload error."); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "team", editingId), { ...formData, updatedAt: serverTimestamp() });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "team"), { ...formData, createdAt: Date.now() });
      }
      setFormData(initialForm);
      alert("Success! 🎭");
    } catch (err) { alert("Save error."); }
  };

  if (loading) return <div className="p-10 font-black opacity-20">Syncing...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#FFF9F0] min-h-screen">
      <div className="mb-12 border-b-8 border-[#2D2D2D] pb-6">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#2D2D2D]">Personnel Desk</h2>
        <p className="font-black uppercase tracking-[0.3em] text-[#FF5F5F] text-[10px] mt-2">Manage Swaang Talent</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* --- FORM SECTION --- */}
        <div className="xl:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[12px_12px_0px_#2D2D2D] space-y-4 sticky top-10">
            <h3 className="font-black uppercase text-xs text-[#FF5F5F]">{editingId ? "Edit Profile" : "Join Ensemble"}</h3>
            
            <input required type="text" placeholder="Full Name" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold" />
            
            <div className="grid grid-cols-2 gap-3">
              <select value={formData.category || "active"} onChange={e => setFormData({...formData, category: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-black text-[10px] uppercase bg-white">
                <option value="active">Active Member</option>
                <option value="president">President</option>
                <option value="alumni">Alumni</option>
              </select>
              <input required type="text" placeholder="Role (e.g. Actor)" value={formData.role || ""} onChange={e => setFormData({...formData, role: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-sm" />
            </div>

            {/* 🔥 Seniority Tracking Field */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase opacity-40 ml-2">Seniority (Joining Year)</label>
              <input required type="number" placeholder="e.g. 2023" value={formData.joiningYear || ""} onChange={e => setFormData({...formData, joiningYear: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold" />
            </div>

            {formData.category === 'active' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-2 p-3 bg-[#06D6A0]/10 border-2 border-[#06D6A0] rounded-xl overflow-hidden">
                <input type="text" placeholder="Branch (e.g. IT)" value={formData.branch || ""} onChange={e => setFormData({...formData, branch: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg text-[10px] font-bold" />
                <input type="text" placeholder="Year (e.g. 3rd)" value={formData.year || ""} onChange={e => setFormData({...formData, year: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg text-[10px] font-bold" />
              </motion.div>
            )}

            {(formData.category === 'president' || formData.category === 'alumni') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-2 p-3 bg-[#FFD166]/20 border-2 border-[#FFD166] rounded-xl overflow-hidden">
                <input type="text" placeholder="Tenure" value={formData.tenure || ""} onChange={e => setFormData({...formData, tenure: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg text-[10px] font-bold" />
                <input type="text" placeholder="Passout Year" value={formData.passoutYear || ""} onChange={e => setFormData({...formData, passoutYear: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg text-[10px] font-bold" />
              </motion.div>
            )}

            <textarea placeholder="Bio one-liner..." value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-medium text-sm h-16 resize-none" />
            
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Insta" value={formData.instagram || ""} onChange={e => setFormData({...formData, instagram: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg text-[8px]" />
              <input type="text" placeholder="LinkedIn" value={formData.linkedin || ""} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg text-[8px]" />
              <input type="text" placeholder="GitHub" value={formData.github || ""} onChange={e => setFormData({...formData, github: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg text-[8px]" />
            </div>

            <div className="flex items-center gap-4 bg-gray-100 p-3 rounded-xl border-2 border-[#2D2D2D]">
              <div className="w-12 h-12 bg-white border-2 border-[#2D2D2D] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <span className="text-xl opacity-20">🎭</span>}
              </div>
              <label className="flex-1 cursor-pointer bg-white border-2 border-[#2D2D2D] p-2 rounded-lg text-center font-black uppercase text-[10px]">
                {uploading ? "..." : "Upload Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-[#06D6A0] text-white border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 transition-all">
              Save Member
            </button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData(initialForm)}} className="w-full text-[10px] font-black uppercase opacity-40 mt-2">Cancel Edit</button>}
          </form>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="xl:col-span-8 space-y-12">
          {['president', 'active', 'alumni'].map(cat => (
            <div key={cat} className="space-y-4">
              <h3 className="font-black text-2xl uppercase tracking-tighter border-l-8 border-[#2D2D2D] pl-4">{cat}s</h3>
              <div className="grid grid-cols-1 gap-4">
                {team.filter(m => (m.category || 'active') === cat).map(m => (
                  <div key={m.id} className={`bg-white border-4 border-[#2D2D2D] p-4 rounded-2xl flex items-center gap-4 shadow-[6px_6px_0px_#2D2D2D] ${m.isSpotlight ? 'ring-4 ring-[#FFD166]' : ''}`}>
                    <div className="w-16 h-16 rounded-xl border-2 border-[#2D2D2D] overflow-hidden shrink-0">
                      {m.image ? <img src={m.image} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-xl opacity-20 bg-gray-100 italic">?</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black uppercase text-sm leading-none">{m.name}</h4>
                        {/* 🔥 Displaying joining year for admin reference */}
                        <span className="text-[8px] font-black bg-gray-100 px-1.5 py-0.5 rounded border border-black/10">Est. {m.joiningYear || '—'}</span>
                      </div>
                      <p className="text-[10px] font-bold text-[#FF5F5F] uppercase mt-1">{m.role} {m.branch && `• ${m.branch} ${m.year}`}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {m.isSpotlight && <span className="bg-[#FFD166] text-[#2D2D2D] border border-[#2D2D2D] px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-[1px_1px_0px_#2D2D2D]">★ Spotlighted</span>}
                        {m.isCurrentPresident && <span className="bg-[#06D6A0] text-[#2D2D2D] border border-[#2D2D2D] px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-[1px_1px_0px_#2D2D2D]">👑 Leader</span>}
                        {m.category === 'alumni' && <span className="bg-gray-200 text-[#2D2D2D] border border-[#2D2D2D] px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-[1px_1px_0px_#2D2D2D]">🎓 Graduated</span>}
                      </div>

                    </div>
                    <div className="flex gap-2 shrink-0">
                      {cat === 'president' && (
                        <button onClick={() => toggleField(m.id, 'isCurrentPresident', m.isCurrentPresident)} className={`p-2 border-2 border-[#2D2D2D] rounded-lg text-[8px] font-black uppercase ${m.isCurrentPresident ? 'bg-[#FFD166]' : 'bg-white'}`}>★ Leader</button>
                      )}
                      <button onClick={() => toggleField(m.id, 'isSpotlight', m.isSpotlight)} className={`p-2 border-2 border-[#2D2D2D] rounded-lg text-[8px] font-black uppercase ${m.isSpotlight ? 'bg-[#FF5F5F] text-white' : 'bg-white'}`}>Spotlight</button>
                      {cat === 'active' && (
                        <button onClick={() => setGraduatingId(m.id)} className="p-2 border-2 border-[#2D2D2D] rounded-lg text-[8px] font-black uppercase bg-[#06D6A0] text-white">🎓 Graduate</button>
                      )}
                      <button onClick={() => { setEditingId(m.id); setFormData({...initialForm, ...m}); window.scrollTo({top:0, behavior:'smooth'}) }} className="p-2 border-2 border-[#2D2D2D] rounded-lg text-[8px] font-black uppercase bg-white">Edit</button>
                      <button onClick={async () => { if(confirm('Delete this member?')) await deleteDoc(doc(db, "team", m.id)) }} className="p-2 border-2 border-red-500 rounded-lg text-[8px] font-black uppercase bg-red-50 text-red-500">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- GRADUATION MODAL --- */}
      <AnimatePresence>
        {graduatingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2D2D2D]/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-8 border-[#2D2D2D] p-10 rounded-[3rem] shadow-[20px_20px_0px_#06D6A0] max-w-md w-full text-center">
               <h3 className="font-black text-3xl uppercase mb-6 italic">Graduate to Alumni? 🎓</h3>
               <div className="space-y-4">
                  <input type="text" placeholder="Tenure (e.g. 2022-25)" value={gradData.tenure} onChange={e => setGradData({...gradData, tenure: e.target.value})} className="w-full border-4 border-[#2D2D2D] p-3 rounded-2xl font-bold" />
                  <input type="text" placeholder="Passout Year" value={gradData.passoutYear} onChange={e => setGradData({...gradData, passoutYear: e.target.value})} className="w-full border-4 border-[#2D2D2D] p-3 rounded-2xl font-bold" />
                  <div className="flex gap-4 pt-4">
                    <button onClick={handleGraduate} className="flex-1 bg-[#06D6A0] text-white border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase">Confirm</button>
                    <button onClick={() => setGraduatingId(null)} className="flex-1 bg-white border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase">Cancel</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}