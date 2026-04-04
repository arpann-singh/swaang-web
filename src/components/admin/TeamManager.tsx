"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

export default function TeamManager() {
  const [team, setTeam] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    name: "", 
    role: "", 
    branch: "", 
    year: "", 
    image: "", 
    status: "current", 
    showOnHome: false,
    isPresident: false, // 🔥 NEW: President Flag
    term: ""            // 🔥 NEW: President Term
  });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "team"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by creation time in Javascript to avoid Firebase Index errors!
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTeam(fetched);
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: "POST", body: formData
      });
      const data = await res.json();
      if (data.success) setForm({ ...form, image: data.data.url });
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const saveMember = async () => {
    if (!form.name || !form.role) return alert("Name and Role are required!");
    
    try {
      if (editingId) {
        await updateDoc(doc(db, "team", editingId), form);
        setEditingId(null);
      } else {
        const newId = doc(collection(db, "team")).id;
        await setDoc(doc(db, "team", newId), { ...form, createdAt: Date.now() });
      }
      setForm({ name: "", role: "", branch: "", year: "", image: "", status: "current", showOnHome: false, isPresident: false, term: "" });
    } catch (err) {
      alert("Failed to save member.");
    }
  };

  const startEdit = (member: any) => {
    setForm({ 
      name: member.name || member.fullName || "", 
      role: member.role || "", 
      branch: member.branch || "", 
      year: member.year || "", 
      image: member.image || member.photo || member.imageUrl || "", 
      status: member.status || "current",
      showOnHome: member.showOnHome || false,
      isPresident: member.isPresident || false,
      term: member.term || ""
    });
    setEditingId(member.id);
  };

  const toggleHome = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "team", id), { showOnHome: !currentStatus });
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl md:text-5xl font-black uppercase mb-8 border-b-8 border-[#2D2D2D] pb-4 tracking-tighter">Ensemble Directory</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM SIDE */}
        <div className="lg:col-span-5 bg-white border-4 border-[#2D2D2D] p-6 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D] h-fit">
          <h3 className="font-black text-[#06D6A0] uppercase tracking-widest text-sm mb-6">
            {editingId ? "Edit Member" : "New Member"}
          </h3>
          
          <div className="space-y-4">
            <label className="block w-full border-4 border-dashed border-[#2D2D2D]/30 p-8 text-center rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="file" className="hidden" onChange={handleUpload} />
              {uploading ? (
                <span className="font-black uppercase animate-pulse">Uploading...</span>
              ) : form.image ? (
                <img src={form.image} className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-[#2D2D2D]" alt="Preview" />
              ) : (
                <span className="text-[10px] font-black uppercase text-gray-400">Click to Upload Photo</span>
              )}
            </label>

            <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl" />
            <input placeholder="Role (e.g. Actor, Director)" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl" />
            
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Branch" value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl" />
              <input placeholder="Year" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl" />
            </div>

            <select 
              value={form.status} 
              onChange={e => setForm({...form, status: e.target.value})} 
              className="w-full border-2 border-[#2D2D2D] p-4 font-black uppercase text-sm rounded-xl appearance-none cursor-pointer"
            >
              <option value="current">Active Member</option>
              <option value="alumni">Alumni Legacy</option>
            </select>

            {/* 🔥 PRESIDENTIAL CONTROLS */}
            <div className="border-2 border-[#FFD166] bg-yellow-50 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={form.isPresident} 
                  onChange={e => setForm({...form, isPresident: e.target.checked})}
                  className="w-5 h-5 accent-[#FFD166] cursor-pointer"
                />
                <span className="font-black text-[10px] uppercase tracking-widest text-[#2D2D2D]">Club President?</span>
              </div>
              {form.isPresident && (
                <input 
                  placeholder="Term (e.g. 2024-2025)" 
                  value={form.term} 
                  onChange={e => setForm({...form, term: e.target.value})} 
                  className="w-full border-2 border-[#2D2D2D] p-3 font-bold rounded-lg text-sm" 
                />
              )}
            </div>

            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-xl border-2 border-[#2D2D2D]">
              <input 
                type="checkbox" 
                checked={form.showOnHome} 
                onChange={e => setForm({...form, showOnHome: e.target.checked})}
                className="w-5 h-5 accent-[#06D6A0] cursor-pointer"
              />
              <span className="font-black text-[10px] uppercase tracking-widest text-[#2D2D2D]">Show on Homepage</span>
            </div>

            <button onClick={saveMember} className="w-full bg-[#06D6A0] text-[#2D2D2D] font-black uppercase py-4 rounded-xl border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
              {editingId ? "Update Member" : "Onboard Member"}
            </button>
            
            {editingId && (
              <button onClick={() => {setEditingId(null); setForm({ name: "", role: "", branch: "", year: "", image: "", status: "current", showOnHome: false, isPresident: false, term: "" });}} className="w-full text-center text-[10px] font-black uppercase text-red-500 mt-2 hover:underline">
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* LIST SIDE */}
        <div className="lg:col-span-7 space-y-4 max-h-[80vh] overflow-y-auto pr-2 pb-20">
          {team.map(m => (
            <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-4 border-[#2D2D2D] bg-white rounded-[2rem] shadow-[4px_4px_0px_#2D2D2D] gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full border-2 border-[#2D2D2D] overflow-hidden shrink-0">
                  {(m.image || m.photo || m.imageUrl) ? <img src={m.image || m.photo || m.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">🎭</div>}
                </div>
                <div>
                  <h4 className="font-black uppercase text-[#2D2D2D] text-sm leading-tight">{m.name || m.fullName}</h4>
                  <div className="flex gap-2 mt-1">
                    {m.isPresident && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border border-[#2D2D2D] bg-[#FFD166]">👑 President</span>}
                    {!m.isPresident && m.status === 'alumni' && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border border-[#2D2D2D] bg-gray-200">🎓 Alumni</span>}
                    {!m.isPresident && (m.status === 'current' || !m.status) && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border border-[#2D2D2D] bg-[#06D6A0]">🎭 Active</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => toggleHome(m.id, m.showOnHome)} 
                  className={`flex-1 sm:flex-none px-3 py-1.5 border-2 border-[#2D2D2D] rounded-lg font-black text-[9px] uppercase transition-colors ${m.showOnHome ? 'bg-[#FF5F5F] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  🏠 Home
                </button>
                <button onClick={() => startEdit(m)} className="px-3 py-1.5 border-2 border-[#2D2D2D] rounded-lg font-black text-[9px] uppercase bg-gray-100 hover:bg-gray-200">
                  Edit
                </button>
                <button onClick={() => confirm("Remove member?") && deleteDoc(doc(db, "team", m.id))} className="px-3 py-1.5 border-2 border-[#2D2D2D] rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
