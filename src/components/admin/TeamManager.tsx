"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, addDoc, deleteDoc, 
  doc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface TeamManagerProps {
  initialSearch?: string;
}

export default function TeamManager({ initialSearch = "" }: TeamManagerProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // 🔥 NEW: Layout State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'alumni' | 'faculty'>('active');
  
  const [graduatingId, setGraduatingId] = useState<string | null>(null);
  const [gradData, setGradData] = useState({ passoutYear: "", tenure: "" });

  const [facultyForm, setFacultyForm] = useState<any>({
    name: "", role: "", citation: "", image: "", stat1: 100, stat2: 100, stat3: 100
  });

  const initialForm = {
    name: "",
    email: "", 
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
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const unsubTeam = onSnapshot(collection(db, "team"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (parseInt(a.joiningYear) || 9999) - (parseInt(b.joiningYear) || 9999));
      setTeam(fetched);
      setLoading(false);
    });

    const unsubFaculty = onSnapshot(doc(db, "settings", "faculty"), (d) => {
      if (d.exists()) setFacultyForm(d.data());
    });

    return () => {
      unsubTeam();
      unsubFaculty();
    };
  }, []);

  const filteredTeam = team.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFacultySave = async () => {
    try {
      await updateDoc(doc(db, "settings", "faculty"), facultyForm);
      alert("Faculty Blueprint Updated! 🏛️");
    } catch (err) {
      alert("Faculty Update failed. Ensure 'settings/faculty' exists in DB.");
    }
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'team' | 'faculty') => {
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
      if (json.success) {
        if (target === 'team') setFormData(prev => ({ ...prev, image: json.data.url }));
        else setFacultyForm((prev: any) => ({ ...prev, image: json.data.url }));
      }
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
      setIsFormOpen(false); // Close Modal
      alert("Success! 🎭");
    } catch (err) { alert("Save error."); }
  };

  if (loading) return <div className="p-10 font-black opacity-20 text-left">Syncing Personnel Data...</div>;

  return (
    <div className="space-y-12 bg-[var(--bg-primary)] p-4 md:p-8 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="border-b-8 border-[var(--border-primary)] pb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 text-left">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Personnel Desk</h2>
          <p className="font-black uppercase tracking-[0.3em] text-[#FF5F5F] text-[10px] mt-2">Manage Swaang Talent</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
          {activeTab !== 'faculty' && (
            <div className="w-full md:w-80 relative">
              <input 
                type="text" 
                placeholder="Search Name, Role, or Branch..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-4 border-[var(--border-primary)] p-3 rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_var(--border-primary)] outline-none focus:translate-y-1 focus:shadow-none transition-all"
              />
            </div>
          )}
          <button 
            onClick={() => { setEditingId(null); setFormData(initialForm); setIsFormOpen(true); }}
            className="bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Add Member</span>
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex flex-wrap gap-4 border-b-4 border-dashed border-[var(--border-primary)]/20 pb-4">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all border-4 border-[var(--border-primary)] ${activeTab === 'active' ? 'bg-[#06D6A0] text-[var(--border-primary)] shadow-[4px_4px_0px_var(--border-primary)]' : 'bg-white text-gray-400 hover:text-[var(--border-primary)]'}`}
        >
          Ensemble / Active
        </button>
        <button 
          onClick={() => setActiveTab('alumni')} 
          className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all border-4 border-[var(--border-primary)] ${activeTab === 'alumni' ? 'bg-[#FFD166] text-[var(--border-primary)] shadow-[4px_4px_0px_var(--border-primary)]' : 'bg-white text-gray-400 hover:text-[var(--border-primary)]'}`}
        >
          Alumni / Seniors
        </button>
        <button 
          onClick={() => setActiveTab('faculty')} 
          className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all border-4 border-[var(--border-primary)] ${activeTab === 'faculty' ? 'bg-[#2D2D2D] text-white shadow-[4px_4px_0px_var(--border-primary)]' : 'bg-white text-gray-400 hover:text-[var(--border-primary)]'}`}
        >
          Faculty Blueprint 🏛️
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      {activeTab === 'faculty' ? (
        /* FACULTY SETTINGS (Same component, restyled slightly for full width) */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#2D2D2D] p-8 md:p-12 rounded-[3.5rem] shadow-[15px_15px_0px_#FFD166] text-white relative overflow-hidden text-left max-w-5xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5F5F] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">Official Identity</label>
                  <input type="text" placeholder="Faculty Name" value={facultyForm.name} onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 p-4 rounded-2xl font-bold text-white placeholder:text-white/20 focus:border-[#FFD166] outline-none transition-colors" />
                </div>
                <input type="text" placeholder="Position (e.g. Faculty Coordinator)" value={facultyForm.role} onChange={e => setFacultyForm({...facultyForm, role: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 p-4 rounded-2xl font-bold text-white placeholder:text-white/20 focus:border-[#FFD166] outline-none transition-colors" />
                <textarea placeholder="Backbone Citation (The Quote)" value={facultyForm.citation} onChange={e => setFacultyForm({...facultyForm, citation: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 p-4 rounded-2xl font-bold text-white placeholder:text-white/20 h-24 focus:border-[#FFD166] outline-none transition-colors" />
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="font-black text-[10px] uppercase opacity-40 tracking-widest text-left">Blueprint Impact Stats (%)</p>
                  
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between text-[9px] font-black uppercase text-[#FFD166]">
                      <span>Strategic Support</span>
                      <span>{facultyForm.stat1}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={facultyForm.stat1} onChange={e => setFacultyForm({...facultyForm, stat1: parseInt(e.target.value)})} className="w-full accent-[#FFD166]" />
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex justify-between text-[9px] font-black uppercase text-[#06D6A0]">
                      <span>Creative Freedom</span>
                      <span>{facultyForm.stat2}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={facultyForm.stat2} onChange={e => setFacultyForm({...facultyForm, stat2: parseInt(e.target.value)})} className="w-full accent-[#06D6A0]" />
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex justify-between text-[9px] font-black uppercase text-[#FF5F5F]">
                      <span>Institutional Synergy</span>
                      <span>{facultyForm.stat3}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={facultyForm.stat3} onChange={e => setFacultyForm({...facultyForm, stat3: parseInt(e.target.value)})} className="w-full accent-[#FF5F5F]" />
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-white/5 p-5 rounded-3xl border-2 border-dashed border-white/10">
                   <div className="w-20 h-20 bg-white/10 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20">
                      {facultyForm.image ? <img src={facultyForm.image} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full opacity-20 text-[8px] font-black uppercase">No Data</span>}
                   </div>
                   <div className="space-y-2 text-left">
                     <p className="text-[9px] font-black uppercase opacity-40">System Image</p>
                     <label className="inline-block bg-[#FFF] text-[var(--text-primary)] px-4 py-2 rounded-lg font-black uppercase text-[10px] cursor-pointer hover:bg-[#FFD166] transition-colors">
                       {uploading ? "Uploading..." : "Replace Visual"}
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'faculty')} />
                     </label>
                   </div>
                </div>
              </div>
            </div>

            <button onClick={handleFacultySave} className="mt-12 w-full bg-[#FFD166] text-[var(--text-primary)] py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-[0px_8px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 hover:shadow-none transition-all active:scale-[0.98]">
              Push Changes to System
            </button>
          </div>
        </motion.div>
      ) : (
        /* PERSONNEL GRID */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
          {filteredTeam.filter(m => (m.category === activeTab) || (activeTab === 'active' && m.category === 'president')).map(m => (
            <div key={m.id} className={`bg-white border-4 border-[var(--border-primary)] p-5 rounded-[2rem] flex flex-col gap-4 shadow-[8px_8px_0px_var(--border-primary)] transition-transform hover:-translate-y-1 ${m.isSpotlight ? 'ring-4 ring-[#FFD166]' : ''}`}>
              
              <div className="flex items-start gap-4">
                 <div className="w-20 h-20 rounded-xl border-4 border-[var(--border-primary)] shadow-[4px_4px_0px_var(--border-primary)] overflow-hidden shrink-0">
                   {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-xl opacity-20 bg-gray-100 italic">?</span>}
                 </div>
                 <div className="flex-1 text-left pt-1">
                   <div className="flex items-center gap-2">
                     <h4 className="font-black uppercase text-xl leading-none">{m.name}</h4>
                     <span className="text-[8px] font-black bg-gray-100 px-1.5 py-0.5 rounded border border-black/10 whitespace-nowrap">Est. {m.joiningYear || '—'}</span>
                   </div>
                   <p className="text-[9px] font-mono text-black/40 italic break-all mt-1">{m.email || "No Email Bound"}</p>
                   <p className="text-xs font-bold text-[#FF5F5F] uppercase mt-1">{m.role} {m.branch && `• ${m.branch} ${m.year}`}</p>
                   
                   <div className="flex flex-wrap gap-1 mt-2">
                     {m.isSpotlight && <span className="bg-[#FFD166] text-[var(--text-primary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-[1px_1px_0px_var(--border-primary)]">★ Spotlighted</span>}
                     {m.isCurrentPresident && <span className="bg-[#06D6A0] text-[var(--text-primary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-[1px_1px_0px_var(--border-primary)]">👑 Leader</span>}
                     {m.category === 'alumni' && <span className="bg-gray-200 text-[var(--text-primary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-[1px_1px_0px_var(--border-primary)]">🎓 Graduated</span>}
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-auto border-t-2 border-dashed border-gray-200 pt-4">
                {(m.category === 'president' || activeTab === 'active') && (
                  <button onClick={() => toggleField(m.id, 'isCurrentPresident', m.isCurrentPresident)} className={`py-2 border-2 border-[var(--border-primary)] rounded-lg font-black text-[8px] uppercase tracking-widest transition-colors col-span-2 ${m.isCurrentPresident ? 'bg-[#FFD166] shadow-[2px_2px_0px_var(--border-primary)]' : 'bg-white hover:bg-gray-50'}`}>👑 Leader</button>
                )}
                <button onClick={() => toggleField(m.id, 'isSpotlight', m.isSpotlight)} className={`py-2 border-2 border-[var(--border-primary)] rounded-lg font-black text-[8px] uppercase tracking-widest transition-colors col-span-2 ${m.isSpotlight ? 'bg-[#FF5F5F] text-white shadow-[2px_2px_0px_var(--border-primary)]' : 'bg-white hover:bg-gray-50'}`}>★ Spotlight</button>
                
                {(activeTab === 'active' || m.category === 'president') && (
                  <button onClick={() => setGraduatingId(m.id)} className="py-2 border-2 border-[var(--border-primary)] rounded-lg font-black text-[8px] uppercase tracking-widest bg-[#06D6A0] text-[var(--border-primary)] hover:bg-[#05b88a] transition-colors col-span-2">🎓 Graduate</button>
                )}
                <button onClick={() => { setEditingId(m.id); setFormData({...initialForm, ...m}); setIsFormOpen(true); }} className="py-2 border-2 border-[var(--border-primary)] rounded-lg font-black text-[8px] uppercase tracking-widest bg-white hover:bg-blue-50 transition-colors col-span-1">Edit</button>
                <button onClick={async () => { if(confirm('Delete this member?')) await deleteDoc(doc(db, "team", m.id)) }} className="py-2 border-2 border-[#FF5F5F] text-[#FF5F5F] rounded-lg font-black text-[8px] uppercase tracking-widest bg-white hover:bg-[#FF5F5F] hover:text-white transition-colors col-span-1">Del</button>
              </div>
            </div>
          ))}
          {filteredTeam.filter(m => (m.category === activeTab) || (activeTab === 'active' && m.category === 'president')).length === 0 && (
            <div className="col-span-full p-20 border-4 border-dashed border-[var(--border-primary)]/20 rounded-[3rem] text-center opacity-40 font-black uppercase italic tracking-widest">
              No Personnel Found
            </div>
          )}
        </motion.div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 overflow-y-auto"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white border-8 border-[var(--border-primary)] rounded-[3rem] shadow-[20px_20px_0px_var(--border-primary)] p-6 md:p-12 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] rounded-full font-black text-xl flex items-center justify-center shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all z-10"
              >
                ✕
              </button>

              <form onSubmit={handleSubmit} className="space-y-6 text-left max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="border-b-4 border-dashed border-[var(--border-primary)]/20 pb-4 pr-12">
                   <h2 className="font-black uppercase text-3xl md:text-4xl tracking-tighter text-[var(--text-primary)] leading-none">{editingId ? "Edit Profile" : "Add Personnel"}</h2>
                   <p className="text-[#06D6A0] font-black uppercase text-[10px] tracking-widest mt-2">Swaang Identity Registry</p>
                </div>

                {/* Identity */}
                <div className="space-y-4">
                  <input required type="text" placeholder="Full Name" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-black text-xl focus:border-[#06D6A0] outline-none transition-all" />
                  
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black uppercase opacity-40 ml-2">Official Email (For Crew Login)</label>
                    <input required type="email" placeholder="email@example.com" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-bold focus:border-[#06D6A0] outline-none transition-all" />
                  </div>
                </div>

                {/* Category & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={formData.category || "active"} onChange={e => setFormData({...formData, category: e.target.value})} className="border-2 border-[var(--border-primary)] p-4 rounded-xl font-black text-sm uppercase bg-white cursor-pointer focus:border-[#06D6A0] outline-none">
                    <option value="active">Ensemble / Active</option>
                    <option value="president">President / Core</option>
                    <option value="alumni">Alumni</option>
                  </select>
                  <input required type="text" placeholder="Role (e.g. Actor)" value={formData.role || ""} onChange={e => setFormData({...formData, role: e.target.value})} className="border-2 border-[var(--border-primary)] p-4 rounded-xl font-bold text-sm focus:border-[#06D6A0] outline-none" />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black uppercase opacity-40 ml-2">Seniority (Joining Year)</label>
                  <input required type="number" placeholder="e.g. 2023" value={formData.joiningYear || ""} onChange={e => setFormData({...formData, joiningYear: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-bold focus:border-[#06D6A0] outline-none" />
                </div>

                {/* Conditional Details based on Category */}
                <AnimatePresence mode="wait">
                  {formData.category === 'active' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-4 p-4 bg-[#06D6A0]/10 border-2 border-[#06D6A0] rounded-xl overflow-hidden">
                      <input type="text" placeholder="Branch (e.g. IT)" value={formData.branch || ""} onChange={e => setFormData({...formData, branch: e.target.value})} className="border-2 border-[var(--border-primary)] p-3 rounded-lg text-xs font-bold bg-white" />
                      <input type="text" placeholder="Year (e.g. 3rd)" value={formData.year || ""} onChange={e => setFormData({...formData, year: e.target.value})} className="border-2 border-[var(--border-primary)] p-3 rounded-lg text-xs font-bold bg-white" />
                    </motion.div>
                  )}
                  {(formData.category === 'president' || formData.category === 'alumni') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-4 p-4 bg-[#FFD166]/20 border-2 border-[#FFD166] rounded-xl overflow-hidden">
                      <input type="text" placeholder="Tenure (e.g. 2023-25)" value={formData.tenure || ""} onChange={e => setFormData({...formData, tenure: e.target.value})} className="border-2 border-[var(--border-primary)] p-3 rounded-lg text-xs font-bold bg-white" />
                      <input type="text" placeholder="Passout Year" value={formData.passoutYear || ""} onChange={e => setFormData({...formData, passoutYear: e.target.value})} className="border-2 border-[var(--border-primary)] p-3 rounded-lg text-xs font-bold bg-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea placeholder="Bio one-liner..." value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-medium text-sm h-24 resize-none focus:border-[#06D6A0] outline-none" />
                
                {/* Socials */}
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Insta Handle" value={formData.instagram || ""} onChange={e => setFormData({...formData, instagram: e.target.value})} className="border-2 border-[var(--border-primary)] p-3 rounded-xl text-xs font-bold focus:border-[#06D6A0] outline-none" />
                  <input type="text" placeholder="LinkedIn URL" value={formData.linkedin || ""} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="border-2 border-[var(--border-primary)] p-3 rounded-xl text-xs font-bold focus:border-[#06D6A0] outline-none" />
                  <input type="text" placeholder="GitHub URL" value={formData.github || ""} onChange={e => setFormData({...formData, github: e.target.value})} className="border-2 border-[var(--border-primary)] p-3 rounded-xl text-xs font-bold focus:border-[#06D6A0] outline-none" />
                </div>

                {/* Photo Upload */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl border-2 border-[var(--border-primary)]">
                  <div className="w-20 h-20 bg-white border-4 border-[var(--border-primary)] rounded-xl overflow-hidden shrink-0 shadow-[4px_4px_0px_var(--border-primary)] flex items-center justify-center">
                    {formData.image ? <img src={formData.image} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-2xl opacity-20">📸</span>}
                  </div>
                  <label className="flex-1 w-full cursor-pointer bg-white border-2 border-[var(--border-primary)] p-4 rounded-xl text-center font-black uppercase text-xs hover:bg-[#FFD166] transition-colors shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none">
                    {uploading ? "Uploading..." : "Upload Identity Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'team')} />
                  </label>
                </div>

                <div className="pt-4 border-t-4 border-dashed border-[var(--border-primary)]/20">
                  <button type="submit" disabled={uploading} className="w-full bg-[#06D6A0] text-white border-4 border-[var(--border-primary)] py-5 rounded-2xl font-black uppercase tracking-widest text-lg shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--border-primary)] transition-all">
                    {editingId ? "Save Changes" : "Confirm Personnel"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- GRADUATE MODAL --- */}
      <AnimatePresence>
        {graduatingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-8 border-[var(--border-primary)] p-10 rounded-[3rem] shadow-[20px_20px_0px_#06D6A0] max-w-md w-full text-center">
               <h3 className="font-black text-3xl uppercase mb-6 tracking-tighter">Graduate to Alumni? 🎓</h3>
               <div className="space-y-4 text-left">
                  <input type="text" placeholder="Tenure (e.g. 2022-25)" value={gradData.tenure} onChange={e => setGradData({...gradData, tenure: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-4 rounded-2xl font-bold outline-none focus:border-[#06D6A0]" />
                  <input type="text" placeholder="Passout Year (e.g. 2026)" value={gradData.passoutYear} onChange={e => setGradData({...gradData, passoutYear: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-4 rounded-2xl font-bold outline-none focus:border-[#06D6A0]" />
                  <div className="flex gap-4 pt-4">
                    <button onClick={handleGraduate} className="flex-1 bg-[#06D6A0] text-white border-4 border-[var(--border-primary)] py-4 rounded-2xl font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all">Confirm</button>
                    <button onClick={() => setGraduatingId(null)} className="flex-1 bg-white border-4 border-[var(--border-primary)] py-4 rounded-2xl font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all">Cancel</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}