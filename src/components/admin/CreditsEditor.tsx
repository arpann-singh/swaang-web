"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Plus, Save, Trash2, Clapperboard, Loader2 } from "lucide-react";

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
    setDevelopers([
      ...developers,
      {
        name: "",
        role: "",
        department: "",
        contributions: "",
        github: "",
        linkedin: "",
        theme: "green",
      },
    ]);
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

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Loading Technical Cast...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      <header className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="adm-eyebrow">System Architects & Engineers</p>
          <h1 className="adm-title mt-1">Credits Hub</h1>
          <p className="adm-muted mt-1">
            Manage the technical cast and platform engineering credits displayed on /credits.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={addDeveloper}
            className="adm-btn adm-btn-secondary flex-1 md:flex-none"
          >
            <Plus size={15} />
            <span>Add Dev</span>
          </button>
          <button
            type="button"
            onClick={syncCredits}
            className="adm-btn adm-btn-primary flex-1 md:flex-none"
          >
            <Save size={15} />
            <span>Sync Credits</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {developers.map((dev, index) => (
          <div key={index} className="adm-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-adm-line pb-3">
              <span className="adm-badge adm-badge-accent font-mono">
                Architect #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeDev(index)}
                className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                title="Remove developer"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="adm-label">Name</label>
                  <input
                    className="adm-input"
                    placeholder="Name (e.g. Arpan)"
                    value={dev.name || ""}
                    onChange={(e) => updateDev(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="adm-label">Department</label>
                  <input
                    className="adm-input"
                    placeholder="Dept (e.g. B.Tech CSE)"
                    value={dev.department || ""}
                    onChange={(e) => updateDev(index, "department", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="adm-label">Role</label>
                <input
                  className="adm-input"
                  placeholder="Role (e.g. Lead Architect)"
                  value={dev.role || ""}
                  onChange={(e) => updateDev(index, "role", e.target.value)}
                />
              </div>

              <div>
                <label className="adm-label">Contributions (Comma Separated)</label>
                <textarea
                  className="adm-input"
                  placeholder="Built UI, Managed DB, Setup API..."
                  value={dev.contributions || ""}
                  onChange={(e) => updateDev(index, "contributions", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="adm-label">GitHub URL</label>
                  <input
                    className="adm-input text-xs"
                    placeholder="https://github.com/..."
                    value={dev.github || ""}
                    onChange={(e) => updateDev(index, "github", e.target.value)}
                  />
                </div>
                <div>
                  <label className="adm-label">LinkedIn URL</label>
                  <input
                    className="adm-input text-xs"
                    placeholder="https://linkedin.com/in/..."
                    value={dev.linkedin || ""}
                    onChange={(e) => updateDev(index, "linkedin", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="adm-label">Card Glow Theme</label>
                <select
                  className="adm-input"
                  value={dev.theme || "green"}
                  onChange={(e) => updateDev(index, "theme", e.target.value)}
                >
                  <option value="green">Neon Green</option>
                  <option value="red">Stage Red</option>
                  <option value="yellow">Spotlight Yellow</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {developers.length === 0 && (
          <div className="col-span-full adm-card p-12 text-center">
            <Clapperboard size={36} className="mx-auto text-adm-fg-3 mb-2" />
            <p className="adm-h3">No Developers Added Yet</p>
            <p className="adm-muted mt-1">Click "+ Add Dev" above to add credits.</p>
          </div>
        )}
      </div>
    </div>
  );
}
