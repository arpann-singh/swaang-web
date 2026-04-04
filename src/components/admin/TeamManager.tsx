"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, addDoc, deleteDoc, 
  doc, updateDoc, serverTimestamp 
} from "firebase/firestore";

export default function TeamManager() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    instagram: "",
    image: "",
    order: 0
  });

  useEffect(() => {
    // 🔌 LIVE WIRE: Watch the team collection
    const unsub = onSnapshot(collection(db, "team"), (snap) => {
      // 🔥 FIXED: Added "as any" to satisfy the TypeScript compiler during build
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      
      // 🔥 FIXED: Explicitly typed a, b as "any" to prevent build errors on 'createdAt'
      fetched.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setTeam(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Team Fetch Error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return alert("Name and Role are required!");

    try {
      await addDoc(collection(db, "team"), {
        ...formData,
        createdAt: Date.now(),
        timestamp: serverTimestamp()
      });
      setFormData({ name: "", role: "", instagram: "", image: "", order: 0 });
      alert("Ensemble member added! 🎭");
    } catch (err) {
      alert("Failed to add member.");
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Remove this member from the ensemble?")) return;
    try {
      await deleteDoc(doc(db, "team", id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (loading) return <div className="p-10 font-black text-gray-400">Syncing Ensemble...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 border-b-8 border-[#2D2D2D] pb-4">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">The Ensemble</h2>
        <p className="font-black uppercase tracking-[0.3em] text-[#FF5F5F] text-[10px] mt-1">Cast & Crew Directory</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* ADD MEMBER FORM */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#2D2D2D] space-y-4 sticky top-10">
            <h3 className="font-black uppercase text-sm tracking-widest text-gray-400 mb-4">Add New Member</h3>
            
            <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold" />
            <input required type="text" placeholder="Role (e.g. Actor / Director)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold" />
            <input type="text" placeholder="Instagram Username" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold" />
            <input type="url" placeholder="Photo URL (ImgBB Link)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold" />
            
            <button type="submit" className="w-full bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
              Add to Ensemble
            </button>
          </form>
        </div>

        {/* TEAM LIST */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map(member => (
            <div key={member.id} className="bg-white border-4 border-[#2D2D2D] p-6 rounded-[2rem] shadow-[6px_6px_0px_#2D2D2D] flex gap-6 items-center">
              <div className="w-20 h-20 bg-gray-100 border-4 border-[#2D2D2D] rounded-2xl overflow-hidden shrink-0 shadow-[4px_4px_0px_#2D2D2D]">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-black uppercase text-lg tracking-tighter truncate">{member.name}</h4>
                <p className="font-bold text-[10px] uppercase text-[#FF5F5F] tracking-widest">{member.role}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => deleteMember(member.id)} className="bg-red-50 text-red-500 border-2 border-[#2D2D2D] px-3 py-1 rounded-lg font-black text-[9px] uppercase hover:bg-red-500 hover:text-white transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {team.length === 0 && <p className="col-span-full text-center py-20 font-black text-gray-300 uppercase">The Stage is empty.</p>}
        </div>
      </div>
    </div>
  );
}
