"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Plus,
  Trash2,
  FileText,
  KeyRound,
  Lightbulb,
  Users,
  Save,
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";

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
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Accessing Audition Resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      {/* Header */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} className="text-adm-accent-text" />
            <span className="adm-eyebrow">/auditions/resources Hub</span>
          </div>
          <h1 className="adm-title">Audition Prep Resources</h1>
          <p className="adm-muted mt-1">
            Manage practice monologues, character breakdowns, audition tips & candidate access passkey.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <a
            href="/auditions/resources"
            target="_blank"
            rel="noreferrer"
            className="adm-btn adm-btn-secondary"
          >
            <ExternalLink size={14} />
            <span>View Live</span>
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="adm-btn adm-btn-primary flex-1 md:flex-none"
          >
            <Save size={15} />
            <span>{saving ? "Saving..." : "Save Resources"}</span>
          </button>
        </div>
      </div>

      {/* 🔐 ACCESS PASSKEY CONFIG */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-adm-danger/12 border border-adm-danger/30 text-adm-danger flex items-center justify-center shrink-0">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="adm-h2">Audition Portal Passkey</h2>
            <p className="adm-muted mt-0.5">
              If left blank, /auditions/resources is open to the public. If set, candidates must enter this passcode.
            </p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="e.g. SWAANG2026 (or blank)"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="adm-input font-mono font-bold uppercase text-center tracking-widest"
          />
        </div>
      </div>

      {/* 📜 SECTION 1: PRACTICE MONOLOGUES */}
      <div className="adm-card p-5 sm:p-7 space-y-5">
        <div className="border-b border-adm-line pb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText size={19} className="text-adm-accent-text" />
            <h2 className="adm-h2">Audition Monologues ({monologues.length})</h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setMonologues([...monologues, { title: "", genre: "Dramatic", text: "", pdfUrl: "" }])
            }
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <Plus size={14} />
            <span>Add Monologue</span>
          </button>
        </div>

        {monologues.length === 0 ? (
          <p className="adm-muted p-6 text-center">
            No monologues added yet. Click "+ Add Monologue" to provide script excerpts for auditionees.
          </p>
        ) : (
          <div className="space-y-4">
            {monologues.map((mono, idx) => (
              <div key={idx} className="adm-panel p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="adm-badge adm-badge-accent font-mono">
                    Monologue #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMonologues(monologues.filter((_, i) => i !== idx))}
                    className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                    title="Delete Monologue"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="adm-label">Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Court Martial - Col. Surat Singh Soliloquy"
                      value={mono.title}
                      onChange={(e) => {
                        const copy = [...monologues];
                        copy[idx].title = e.target.value;
                        setMonologues(copy);
                      }}
                      className="adm-input"
                    />
                  </div>

                  <div>
                    <label className="adm-label">Genre / Mood</label>
                    <input
                      type="text"
                      placeholder="e.g. High Dramatic / Confrontational"
                      value={mono.genre}
                      onChange={(e) => {
                        const copy = [...monologues];
                        copy[idx].genre = e.target.value;
                        setMonologues(copy);
                      }}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="adm-label">Monologue Script Text</label>
                  <textarea
                    rows={3}
                    placeholder="Enter script lines or cues..."
                    value={mono.text}
                    onChange={(e) => {
                      const copy = [...monologues];
                      copy[idx].text = e.target.value;
                      setMonologues(copy);
                    }}
                    className="adm-input"
                  />
                </div>

                <div>
                  <label className="adm-label">PDF / Script Download Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or direct document link"
                    value={mono.pdfUrl || ""}
                    onChange={(e) => {
                      const copy = [...monologues];
                      copy[idx].pdfUrl = e.target.value;
                      setMonologues(copy);
                    }}
                    className="adm-input text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎭 SECTION 2: CHARACTER BREAKDOWNS */}
      <div className="adm-card p-5 sm:p-7 space-y-5">
        <div className="border-b border-adm-line pb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users size={19} className="text-adm-success" />
            <h2 className="adm-h2">Character Breakdowns ({breakdowns.length})</h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setBreakdowns([...breakdowns, { role: "", play: "", description: "", traits: "" }])
            }
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <Plus size={14} />
            <span>Add Character</span>
          </button>
        </div>

        {breakdowns.length === 0 ? (
          <p className="adm-muted p-6 text-center">
            No character breakdowns added yet. Add roles for upcoming plays to guide candidate auditions.
          </p>
        ) : (
          <div className="space-y-4">
            {breakdowns.map((item, idx) => (
              <div key={idx} className="adm-panel p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="adm-badge adm-badge-success font-mono">
                    Role #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBreakdowns(breakdowns.filter((_, i) => i !== idx))}
                    className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="adm-label">Character Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Captain Bikash Roy"
                      value={item.role}
                      onChange={(e) => {
                        const copy = [...breakdowns];
                        copy[idx].role = e.target.value;
                        setBreakdowns(copy);
                      }}
                      className="adm-input"
                    />
                  </div>

                  <div>
                    <label className="adm-label">Production / Play *</label>
                    <input
                      type="text"
                      placeholder="e.g. Court Martial"
                      value={item.play}
                      onChange={(e) => {
                        const copy = [...breakdowns];
                        copy[idx].play = e.target.value;
                        setBreakdowns(copy);
                      }}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="adm-label">Key Persona Traits</label>
                  <input
                    type="text"
                    placeholder="e.g. Stern, morally conflicted, sharp vocal projection"
                    value={item.traits || ""}
                    onChange={(e) => {
                      const copy = [...breakdowns];
                      copy[idx].traits = e.target.value;
                      setBreakdowns(copy);
                    }}
                    className="adm-input"
                  />
                </div>

                <div>
                  <label className="adm-label">Character Synopsis & Expectations</label>
                  <textarea
                    rows={2}
                    placeholder="Provide context on this character's journey in the production..."
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...breakdowns];
                      copy[idx].description = e.target.value;
                      setBreakdowns(copy);
                    }}
                    className="adm-input"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 💡 SECTION 3: AUDITION TIPS */}
      <div className="adm-card p-5 sm:p-7 space-y-5">
        <div className="border-b border-adm-line pb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lightbulb size={19} className="text-adm-accent-text" />
            <h2 className="adm-h2">Director's Audition Tips ({tips.length})</h2>
          </div>

          <button
            type="button"
            onClick={() => setTips([...tips, ""])}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <Plus size={14} />
            <span>Add Tip</span>
          </button>
        </div>

        {tips.length === 0 ? (
          <p className="adm-muted p-6 text-center">
            No director tips configured. Add tips on projection, body language, and memorization.
          </p>
        ) : (
          <div className="space-y-2.5">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 items-center">
                <span className="adm-badge adm-badge-accent font-mono shrink-0">
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
                  className="adm-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => setTips(tips.filter((_, i) => i !== idx))}
                  className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
