"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Plus, Trash2, FileText, Link as LinkIcon, Save } from "lucide-react";

export default function ResourcesManager() {
  const [monologues, setMonologues] = useState<any[]>([]);
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      const docRef = doc(db, "settings", "audition_resources");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMonologues(data.monologues || []);
        setBreakdowns(data.breakdowns || []);
        setTips(data.tips || []);
        setPasskey(data.passkey || "");
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "audition_resources"), {
        monologues,
        breakdowns,
        tips,
        passkey
      });
      alert("Resources saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving resources.");
    } finally {
      setSaving(false);
    }
  };



  if (loading) return <div className="p-8 font-black uppercase tracking-widest animate-pulse">Loading Resources...</div>;

  return (
    <div className="bg-white border-4 border-[var(--border-primary)] p-6 md:p-10 rounded-[3rem] shadow-[15px_15px_0px_var(--border-primary)]">
      <div className="flex justify-between items-center mb-10 border-b-4 border-[var(--border-primary)] pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Resource Manager</h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Control public audition resources</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-[#06D6A0] border-4 border-[var(--border-primary)] p-4 md:px-8 rounded-2xl flex items-center gap-2 font-black uppercase text-xs shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
          <Save size={18} />
          <span className="hidden md:inline">{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* --- ACCESS CONTROL --- */}
      <div className="mb-12 bg-gray-50 border-2 border-[var(--border-primary)] p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-black uppercase">Portal Security Passkey</h3>
          <p className="text-sm font-bold text-gray-500 mt-1">If set, only users with this code can view the resources.</p>
        </div>
        <input 
          type="text" 
          placeholder="e.g. SWAANG24 (Leave blank for public)" 
          value={passkey} 
          onChange={(e) => setPasskey(e.target.value)} 
          className="w-full md:w-auto flex-1 p-4 border-2 border-[var(--border-primary)] rounded-xl font-black uppercase text-center"
        />
      </div>

      <div className="space-y-16">
        {/* --- MONOLOGUES --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black uppercase flex items-center gap-3"><FileText /> Monologues</h3>
            <button onClick={() => setMonologues([...monologues, { title: "", genre: "", text: "", pdfUrl: "" }])} className="bg-[#FFD166] border-2 border-[var(--border-primary)] p-2 rounded-xl shadow-[2px_2px_0px_var(--border-primary)]">
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-6">
            {monologues.map((mono, idx) => (
              <div key={idx} className="bg-gray-50 border-2 border-[var(--border-primary)] p-6 rounded-3xl relative">
                <button onClick={() => setMonologues(monologues.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:scale-110 transition-transform">
                  <Trash2 size={20} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Title" value={mono.title} onChange={(e) => { const n = [...monologues]; n[idx].title = e.target.value; setMonologues(n); }} className="w-full p-3 border-2 border-[var(--border-primary)] rounded-xl font-bold" />
                  <input type="text" placeholder="Genre (e.g., Dramatic)" value={mono.genre} onChange={(e) => { const n = [...monologues]; n[idx].genre = e.target.value; setMonologues(n); }} className="w-full p-3 border-2 border-[var(--border-primary)] rounded-xl font-bold" />
                </div>
                <textarea placeholder="Monologue Text (Optional if PDF is provided)" value={mono.text} onChange={(e) => { const n = [...monologues]; n[idx].text = e.target.value; setMonologues(n); }} className="w-full p-3 border-2 border-[var(--border-primary)] rounded-xl h-24 mb-4 resize-none font-medium" />
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <LinkIcon size={16} />
                    </div>
                    <input 
                      type="url" 
                      placeholder="External PDF Link (e.g., Google Drive)" 
                      value={mono.pdfUrl || ""} 
                      onChange={(e) => { const n = [...monologues]; n[idx].pdfUrl = e.target.value; setMonologues(n); }} 
                      className="w-full p-3 pl-10 border-2 border-[var(--border-primary)] rounded-xl font-medium" 
                    />
                  </div>
                  {mono.pdfUrl && (
                    <a href={mono.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 font-bold text-xs underline shrink-0">Test Link</a>
                  )}
                </div>
              </div>
            ))}
            {monologues.length === 0 && <p className="text-gray-400 font-bold text-sm italic">No monologues added yet.</p>}
          </div>
        </section>

        {/* --- BREAKDOWNS --- */}
        <section>
          <div className="flex items-center justify-between mb-6 border-t-4 border-[var(--border-primary)]/10 pt-10">
            <h3 className="text-2xl font-black uppercase">Character Breakdowns</h3>
            <button onClick={() => setBreakdowns([...breakdowns, { role: "", desc: "" }])} className="bg-[#06D6A0] border-2 border-[var(--border-primary)] p-2 rounded-xl shadow-[2px_2px_0px_var(--border-primary)]">
              <Plus size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakdowns.map((brk, idx) => (
              <div key={idx} className="bg-white border-2 border-[var(--border-primary)] p-4 rounded-2xl relative">
                <button onClick={() => setBreakdowns(breakdowns.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:scale-110">
                  <Trash2 size={16} />
                </button>
                <input type="text" placeholder="Role Name" value={brk.role} onChange={(e) => { const n = [...breakdowns]; n[idx].role = e.target.value; setBreakdowns(n); }} className="w-full p-2 border-b-2 border-gray-200 font-black uppercase outline-none mb-2" />
                <textarea placeholder="Role Description" value={brk.desc} onChange={(e) => { const n = [...breakdowns]; n[idx].desc = e.target.value; setBreakdowns(n); }} className="w-full p-2 outline-none resize-none font-medium h-20" />
              </div>
            ))}
          </div>
        </section>

        {/* --- TIPS --- */}
        <section>
          <div className="flex items-center justify-between mb-6 border-t-4 border-[var(--border-primary)]/10 pt-10">
            <h3 className="text-2xl font-black uppercase">Director's Tips</h3>
            <button onClick={() => setTips([...tips, ""])} className="bg-[#FF5F5F] border-2 border-[var(--border-primary)] p-2 rounded-xl shadow-[2px_2px_0px_var(--border-primary)] text-white">
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" placeholder="Enter tip..." value={tip} onChange={(e) => { const n = [...tips]; n[idx] = e.target.value; setTips(n); }} className="w-full p-4 border-2 border-[var(--border-primary)] rounded-xl font-medium" />
                <button onClick={() => setTips(tips.filter((_, i) => i !== idx))} className="bg-gray-100 border-2 border-[var(--border-primary)] p-4 rounded-xl text-red-500 hover:bg-red-50">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
