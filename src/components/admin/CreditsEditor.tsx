"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function CreditsEditor() {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      const docSnap = await getDoc(doc(db, "settings", "credits"));
      if (docSnap.exists() && docSnap.data().list) {
        setDevelopers(docSnap.data().list);
      }
      setLoading(false);
    };
    fetchCredits();
  }, []);

  const syncCredits = async () => {
    try {
      await setDoc(doc(db, "settings", "credits"), { list: developers });
      alert("Technical Cast Synced! 🎬");
    } catch (err) {
      alert("Sync Error: " + err);
    }
  };

  const addDeveloper = () => {
    setDevelopers([...developers, { name: "", role: "", department: "", contributions: "", github: "", linkedin: "", theme: "green" }]);
  };

  const updateDev = (index: number, field: string, value: string) => {
    const updated = [...developers];
    updated[index][field] = value;
    setDevelopers(updated);
  };

  const removeDev = (index: number) => {
    const updated = [...developers];
    updated.splice(index, 1);
    setDevelopers(updated);
  };

  if (loading) return <div className="p-12 text-center font-black animate-pulse">Loading Cast...</div>;

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto pb-40 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center border-b-8 border-black pb-8 gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Credits Hub</h1>
          <p className="text-[#06D6A0] font-bold uppercase text-[10px] tracking-[0.4em]">System Architects & Engineers</p>
        </div>
        <div className="flex gap-4">
          <button onClick={addDeveloper} className="bg-white text-black border-4 border-black px-8 py-4 font-black uppercase rounded-2xl shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            + Add Dev
          </button>
          <button onClick={syncCredits} className="bg-[#06D6A0] border-4 border-black px-12 py-4 font-black uppercase rounded-2xl shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            Sync Credits
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {developers.map((dev, index) => (
          <div key={index} className="bg-white border-4 border-black rounded-[2rem] p-8 shadow-[12px_12px_0px_#2D2D2D] relative group">
            <button onClick={() => removeDev(index)} className="absolute -top-4 -right-4 bg-[#FF5F5F] text-white w-10 h-10 rounded-full border-4 border-black font-black hover:scale-110 transition-transform z-10">X</button>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input className="border-2 border-black p-3 rounded-xl font-bold" placeholder="Name (e.g. Arpan)" value={dev.name || ""} onChange={(e) => updateDev(index, 'name', e.target.value)} />
                <input className="border-2 border-black p-3 rounded-xl font-bold" placeholder="Dept (e.g. B.Tech CSE)" value={dev.department || ""} onChange={(e) => updateDev(index, 'department', e.target.value)} />
              </div>
              <input className="w-full border-2 border-black p-3 rounded-xl font-bold" placeholder="Role (e.g. Lead Architect)" value={dev.role || ""} onChange={(e) => updateDev(index, 'role', e.target.value)} />
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40">Contributions (Comma Separated)</label>
                <textarea className="w-full border-2 border-black p-3 rounded-xl font-bold h-24" placeholder="Built UI, Managed DB, Setup API..." value={dev.contributions || ""} onChange={(e) => updateDev(index, 'contributions', e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input className="border-2 border-black p-3 rounded-xl font-mono text-xs" placeholder="GitHub URL" value={dev.github || ""} onChange={(e) => updateDev(index, 'github', e.target.value)} />
                <input className="border-2 border-black p-3 rounded-xl font-mono text-xs" placeholder="LinkedIn URL" value={dev.linkedin || ""} onChange={(e) => updateDev(index, 'linkedin', e.target.value)} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40">Card Glow Theme</label>
                <select className="w-full border-2 border-black p-3 rounded-xl font-bold appearance-none bg-gray-50" value={dev.theme || "green"} onChange={(e) => updateDev(index, 'theme', e.target.value)}>
                  <option value="green">Neon Green</option>
                  <option value="red">Stage Red</option>
                  <option value="yellow">Spotlight Yellow</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        
        {developers.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center p-12 border-4 border-dashed border-black/20 rounded-[2rem] text-black/40 font-black uppercase">
            No Developers Added Yet. Click "+ Add Dev" to begin.
          </div>
        )}
      </div>
    </div>
  );
}
