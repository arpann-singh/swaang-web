"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Plus, Trash2, FileText, KeyRound, Lightbulb, Users, Save, Sparkles, ExternalLink } from "lucide-react";

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
      await setDoc(
        doc(db, "settings", "audition_resources"),
        {
          monologues,
          breakdowns,
          tips,
          passkey: passkey.trim(),
        },
        { merge: true }
      );
      alert("Audition Prep Resources saved & published! 🎭");
    } catch (err) {
      console.error(err);
      alert("Error saving resources.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 font-mono font-black uppercase tracking-widest text-[#FFF9F0] flex items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-black border-t-[#FFD166] animate-spin" />
        // ACCESSING.AUDITION_RESOURCES... //
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-20 w-full font-mono">
      {/* Header */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#FFD166] text-black border-2 border-black shadow-[2px_2px_0px_black]">
              <Sparkles size={20} />
            </span>
            <span className="font-black text-xs uppercase tracking-widest bg-black text-[#FFD166] px-3 py-1 border-2 border-black">
              /auditions/resources HUB
            </span>
          </div>
          <h1 className="font-cinzel text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            Audition Resources
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-black/70 mt-2">
            Manage practice monologues, character breakdowns, audition tips & candidate access passkey.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <a
            href="/auditions/resources"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-4 bg-white border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_black] hover:bg-gray-100 transition-all"
          >
            <ExternalLink size={14} />
            View Live
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 md:flex-none bg-[#06D6A0] text-black border-4 border-black px-8 py-4 font-black uppercase text-xs shadow-[6px_6px_0px_black] hover:bg-[#FFD166] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Resources"}
          </button>
        </div>
      </div>

      {/* 🔐 ACCESS PASSKEY CONFIG */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 shadow-[8px_8px_0px_black] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#FF5F5F] text-white border-2 border-black shadow-[2px_2px_0px_black] shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Audition Portal Passkey
            </h2>
            <p className="text-xs font-bold text-black/60 uppercase mt-1">
              If left blank, /auditions/resources is open to the public. If set, candidates must enter this passcode.
            </p>
          </div>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="e.g. SWAANG2026 (or blank)"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="w-full bg-white border-4 border-black p-3.5 font-black text-sm uppercase text-center tracking-widest shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
          />
        </div>
      </div>

      {/* 📜 SECTION 1: PRACTICE MONOLOGUES */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] space-y-6">
        <div className="border-b-4 border-black pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={22} className="text-[#FF5F5F]" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Audition Monologues ({monologues.length})
            </h2>
          </div>

          <button
            onClick={() => setMonologues([...monologues, { title: "", genre: "Dramatic", text: "", pdfUrl: "" }])}
            className="bg-[#FFD166] text-black border-2 border-black px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_black] hover:bg-black hover:text-[#FFD166] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} /> Add Monologue
          </button>
        </div>

        {monologues.length === 0 ? (
          <p className="text-xs text-gray-500 font-bold uppercase p-4 text-center">
            No monologues added yet. Click "+ Add Monologue" to provide script excerpts for auditionees.
          </p>
        ) : (
          <div className="space-y-4">
            {monologues.map((mono, idx) => (
              <div
                key={idx}
                className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_black] relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-black text-[#FFD166] px-2 py-0.5 text-[10px] font-black uppercase">
                    MONOLOGUE #{idx + 1}
                  </span>
                  <button
                    onClick={() => setMonologues(monologues.filter((_, i) => i !== idx))}
                    className="p-1.5 text-black hover:text-[#FF5F5F] hover:bg-red-50 border border-black transition-all cursor-pointer"
                    title="Delete Monologue"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-black uppercase text-black mb-1">Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Court Martial - Col. Surat Singh Soliloquy"
                      value={mono.title}
                      onChange={(e) => {
                        const copy = [...monologues];
                        copy[idx].title = e.target.value;
                        setMonologues(copy);
                      }}
                      className="w-full bg-[#FFF9F0] border-2 border-black p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-black uppercase text-black mb-1">Genre / Mood</label>
                    <input
                      type="text"
                      placeholder="e.g. High Dramatic / Confrontational"
                      value={mono.genre}
                      onChange={(e) => {
                        const copy = [...monologues];
                        copy[idx].genre = e.target.value;
                        setMonologues(copy);
                      }}
                      className="w-full bg-[#FFF9F0] border-2 border-black p-2.5 font-bold"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-black uppercase text-black mb-1">Monologue Script Text</label>
                  <textarea
                    rows={3}
                    placeholder="Enter script lines or cues..."
                    value={mono.text}
                    onChange={(e) => {
                      const copy = [...monologues];
                      copy[idx].text = e.target.value;
                      setMonologues(copy);
                    }}
                    className="w-full bg-[#FFF9F0] border-2 border-black p-2.5 font-bold resize-none"
                  />
                </div>

                <div className="text-xs">
                  <label className="block font-black uppercase text-black mb-1">PDF / Script Download Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or direct document link"
                    value={mono.pdfUrl || ""}
                    onChange={(e) => {
                      const copy = [...monologues];
                      copy[idx].pdfUrl = e.target.value;
                      setMonologues(copy);
                    }}
                    className="w-full bg-[#FFF9F0] border-2 border-black p-2 font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎭 SECTION 2: CHARACTER BREAKDOWNS */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] space-y-6">
        <div className="border-b-4 border-black pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={22} className="text-[#06D6A0]" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Character Breakdowns ({breakdowns.length})
            </h2>
          </div>

          <button
            onClick={() => setBreakdowns([...breakdowns, { role: "", play: "", description: "", traits: "" }])}
            className="bg-[#06D6A0] text-black border-2 border-black px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_black] hover:bg-black hover:text-[#06D6A0] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} /> Add Character
          </button>
        </div>

        {breakdowns.length === 0 ? (
          <p className="text-xs text-gray-500 font-bold uppercase p-4 text-center">
            No character breakdowns added yet. Add roles for upcoming plays to guide candidate auditions.
          </p>
        ) : (
          <div className="space-y-4">
            {breakdowns.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_black] relative space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-black text-[#06D6A0] px-2 py-0.5 text-[10px] font-black uppercase">
                    ROLE #{idx + 1}
                  </span>
                  <button
                    onClick={() => setBreakdowns(breakdowns.filter((_, i) => i !== idx))}
                    className="p-1.5 text-black hover:text-[#FF5F5F] hover:bg-red-50 border border-black transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black uppercase text-black mb-1">Character Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Captain Bikash Roy"
                      value={item.role}
                      onChange={(e) => {
                        const copy = [...breakdowns];
                        copy[idx].role = e.target.value;
                        setBreakdowns(copy);
                      }}
                      className="w-full bg-[#FFF9F0] border-2 border-black p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-black uppercase text-black mb-1">Production / Play *</label>
                    <input
                      type="text"
                      placeholder="e.g. Court Martial"
                      value={item.play}
                      onChange={(e) => {
                        const copy = [...breakdowns];
                        copy[idx].play = e.target.value;
                        setBreakdowns(copy);
                      }}
                      className="w-full bg-[#FFF9F0] border-2 border-black p-2.5 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black uppercase text-black mb-1">Key Persona Traits</label>
                  <input
                    type="text"
                    placeholder="e.g. Stern, morally conflicted, sharp vocal projection"
                    value={item.traits || ""}
                    onChange={(e) => {
                      const copy = [...breakdowns];
                      copy[idx].traits = e.target.value;
                      setBreakdowns(copy);
                    }}
                    className="w-full bg-[#FFF9F0] border-2 border-black p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-black mb-1">Character Synopsis & Expectations</label>
                  <textarea
                    rows={2}
                    placeholder="Provide context on this character's journey in the production..."
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...breakdowns];
                      copy[idx].description = e.target.value;
                      setBreakdowns(copy);
                    }}
                    className="w-full bg-[#FFF9F0] border-2 border-black p-2.5 font-bold resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 💡 SECTION 3: AUDITION TIPS */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] space-y-6">
        <div className="border-b-4 border-black pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb size={22} className="text-[#FFD166]" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Director's Audition Tips ({tips.length})
            </h2>
          </div>

          <button
            onClick={() => setTips([...tips, ""])}
            className="bg-[#FFD166] text-black border-2 border-black px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_black] hover:bg-black hover:text-[#FFD166] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} /> Add Tip
          </button>
        </div>

        {tips.length === 0 ? (
          <p className="text-xs text-gray-500 font-bold uppercase p-4 text-center">
            No director tips configured. Add tips on projection, body language, and memorization.
          </p>
        ) : (
          <div className="space-y-3">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="w-8 h-8 bg-black text-[#FFD166] border border-black flex items-center justify-center font-black text-xs shrink-0">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  placeholder="e.g. Focus on vocal clarity and projection rather than volume."
                  value={tip}
                  onChange={(e) => {
                    const copy = [...tips];
                    copy[idx] = e.target.value;
                    setTips(copy);
                  }}
                  className="flex-1 bg-white border-2 border-black p-2.5 font-bold text-xs"
                />
                <button
                  onClick={() => setTips(tips.filter((_, i) => i !== idx))}
                  className="p-2 border-2 border-black bg-white hover:bg-[#FF5F5F] hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
