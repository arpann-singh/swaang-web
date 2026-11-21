"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Star,
  GraduationCap,
  Edit3,
  Trash2,
  X,
  Upload,
  Users,
  Loader2,
} from "lucide-react";

interface TeamManagerProps {
  initialSearch?: string;
}

export default function TeamManager({ initialSearch = "" }: TeamManagerProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "alumni" | "faculty">("active");

  const [graduatingId, setGraduatingId] = useState<string | null>(null);
  const [gradData, setGradData] = useState({ passoutYear: "", tenure: "" });

  const [facultyForm, setFacultyForm] = useState<any>({
    name: "",
    role: "",
    citation: "",
    image: "",
    stat1: 100,
    stat2: 100,
    stat3: 100,
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
    isCurrentPresident: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const unsubTeam = onSnapshot(collection(db, "team"), (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      fetched.sort(
        (a, b) => (parseInt(a.joiningYear) || 9999) - (parseInt(b.joiningYear) || 9999)
      );
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

  const filteredTeam = team.filter(
    (m) =>
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
    } catch (err) {
      alert("Update failed.");
    }
  };

  const handleGraduate = async () => {
    if (!graduatingId) return;
    try {
      await updateDoc(doc(db, "team", graduatingId), {
        category: "alumni",
        passoutYear: gradData.passoutYear,
        tenure: gradData.tenure,
        isActive: false,
        isCurrentPresident: false,
      });
      setGraduatingId(null);
      setGradData({ passoutYear: "", tenure: "" });
      alert("Member Graduated! 🎓");
    } catch (err) {
      alert("Error.");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "team" | "faculty"
  ) => {
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
        if (target === "team") setFormData((prev) => ({ ...prev, image: json.data.url }));
        else setFacultyForm((prev: any) => ({ ...prev, image: json.data.url }));
      }
    } catch (err) {
      alert("Upload error.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "team", editingId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "team"), { ...formData, createdAt: Date.now() });
      }
      setFormData(initialForm);
      setIsFormOpen(false);
      alert("Success! 🎭");
    } catch (err) {
      alert("Save error.");
    }
  };

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Syncing Personnel Data...</span>
      </div>
    );
  }

  const visibleMembers = filteredTeam.filter(
    (m) =>
      m.category === activeTab ||
      (activeTab === "active" && m.category === "president")
  );

  return (
    <div className="space-y-6 text-left w-full">
      {/* --- HEADER --- */}
      <div className="adm-card p-5 sm:p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <p className="adm-eyebrow">Manage Swaang Talent</p>
          <h2 className="adm-title mt-1">Personnel Desk (Crew Roster)</h2>
          <p className="adm-muted mt-1">
            Manage active ensemble members, society leaders, alumni transitions, and the faculty coordinator blueprint.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          {activeTab !== "faculty" && (
            <div className="w-full sm:w-72 relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Name, Role, or Branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="adm-input pl-9"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData(initialForm);
              setIsFormOpen(true);
            }}
            className="adm-btn adm-btn-primary"
          >
            <Plus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="adm-seg">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          data-active={activeTab === "active" ? "true" : "false"}
          className="adm-seg-item"
        >
          Ensemble / Active
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("alumni")}
          data-active={activeTab === "alumni" ? "true" : "false"}
          className="adm-seg-item"
        >
          Alumni / Seniors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("faculty")}
          data-active={activeTab === "faculty" ? "true" : "false"}
          className="adm-seg-item"
        >
          Faculty Blueprint 🏛️
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      {activeTab === "faculty" ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="adm-card p-6 sm:p-8 max-w-5xl space-y-6"
        >
          <div className="border-b border-adm-line pb-4">
            <span className="adm-eyebrow">Executive Coordinator Blueprint</span>
            <h3 className="adm-h2 mt-0.5">Faculty Blueprint Settings</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="adm-label">Official Identity (Faculty Name)</label>
                <input
                  type="text"
                  placeholder="Faculty Name"
                  value={facultyForm.name || ""}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="adm-input"
                />
              </div>
              <div>
                <label className="adm-label">Position</label>
                <input
                  type="text"
                  placeholder="Position (e.g. Faculty Coordinator)"
                  value={facultyForm.role || ""}
                  onChange={(e) => setFacultyForm({ ...facultyForm, role: e.target.value })}
                  className="adm-input"
                />
              </div>
              <div>
                <label className="adm-label">Backbone Citation (The Quote)</label>
                <textarea
                  placeholder="Backbone Citation (The Quote)"
                  value={facultyForm.citation || ""}
                  onChange={(e) =>
                    setFacultyForm({ ...facultyForm, citation: e.target.value })
                  }
                  className="adm-input"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <p className="adm-label">Blueprint Impact Stats (%)</p>

                <div className="adm-panel p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-adm-accent-text">
                    <span>Strategic Support</span>
                    <span>{facultyForm.stat1}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={facultyForm.stat1 || 100}
                    onChange={(e) =>
                      setFacultyForm({ ...facultyForm, stat1: parseInt(e.target.value) })
                    }
                    className="adm-range"
                  />
                </div>

                <div className="adm-panel p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-adm-success">
                    <span>Creative Freedom</span>
                    <span>{facultyForm.stat2}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={facultyForm.stat2 || 100}
                    onChange={(e) =>
                      setFacultyForm({ ...facultyForm, stat2: parseInt(e.target.value) })
                    }
                    className="adm-range"
                  />
                </div>

                <div className="adm-panel p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-adm-danger">
                    <span>Institutional Synergy</span>
                    <span>{facultyForm.stat3}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={facultyForm.stat3 || 100}
                    onChange={(e) =>
                      setFacultyForm({ ...facultyForm, stat3: parseInt(e.target.value) })
                    }
                    className="adm-range"
                  />
                </div>
              </div>

              <div className="adm-panel p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-adm-surface border border-adm-line overflow-hidden shrink-0 flex items-center justify-center">
                  {facultyForm.image ? (
                    <img
                      src={facultyForm.image}
                      className="w-full h-full object-cover"
                      alt="Faculty"
                    />
                  ) : (
                    <span className="text-xs text-adm-fg-3">No Image</span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-adm-fg-2">Faculty Portrait Image</p>
                  <label className="adm-btn adm-btn-secondary adm-btn-sm cursor-pointer">
                    <Upload size={14} />
                    <span>{uploading ? "Uploading..." : "Replace Visual"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "faculty")}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFacultySave}
            className="adm-btn adm-btn-primary w-full"
          >
            Push Changes to System
          </button>
        </motion.div>
      ) : (
        /* PERSONNEL GRID */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {visibleMembers.map((m) => (
            <div
              key={m.id}
              className={`adm-card p-5 flex flex-col justify-between gap-4 transition-all ${
                m.isSpotlight ? "border-adm-accent" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-18 h-18 rounded-xl border border-adm-line bg-adm-surface-2 overflow-hidden shrink-0 flex items-center justify-center">
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users size={22} className="text-adm-fg-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-bold text-lg text-adm-fg truncate">
                      {m.name}
                    </h4>
                    <span className="adm-badge adm-badge-neutral font-mono text-[10px] shrink-0">
                      Est. {m.joiningYear || "—"}
                    </span>
                  </div>
                  <p className="text-xs text-adm-fg-3 truncate mt-0.5">
                    {m.email || "No Email Bound"}
                  </p>
                  <p className="text-xs font-semibold text-adm-accent-text mt-1">
                    {m.role} {m.branch && `• ${m.branch} ${m.year}`}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.isSpotlight && (
                      <span className="adm-badge adm-badge-accent text-[10px]">
                        ★ Spotlighted
                      </span>
                    )}
                    {m.isCurrentPresident && (
                      <span className="adm-badge adm-badge-success text-[10px]">
                        👑 Leader
                      </span>
                    )}
                    {m.category === "alumni" && (
                      <span className="adm-badge adm-badge-neutral text-[10px]">
                        🎓 Graduated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-adm-line">
                {(m.category === "president" || activeTab === "active") && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleField(m.id, "isCurrentPresident", m.isCurrentPresident)
                    }
                    className={`adm-btn adm-btn-sm col-span-2 text-xs ${
                      m.isCurrentPresident ? "adm-btn-primary" : "adm-btn-secondary"
                    }`}
                  >
                    👑 Leader
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleField(m.id, "isSpotlight", m.isSpotlight)}
                  className={`adm-btn adm-btn-sm col-span-2 text-xs ${
                    m.isSpotlight ? "adm-btn-primary" : "adm-btn-secondary"
                  }`}
                >
                  <Star size={12} />
                  <span>Spotlight</span>
                </button>

                {(activeTab === "active" || m.category === "president") && (
                  <button
                    type="button"
                    onClick={() => setGraduatingId(m.id)}
                    className="adm-btn adm-btn-success adm-btn-sm col-span-2 text-xs"
                  >
                    <GraduationCap size={13} />
                    <span>Graduate</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(m.id);
                    setFormData({ ...initialForm, ...m });
                    setIsFormOpen(true);
                  }}
                  className="adm-btn adm-btn-secondary adm-btn-sm col-span-1 text-xs"
                >
                  <Edit3 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Delete this member?"))
                      await deleteDoc(doc(db, "team", m.id));
                  }}
                  className="adm-btn adm-btn-danger adm-btn-sm col-span-1 text-xs"
                >
                  <Trash2 size={12} />
                  <span>Del</span>
                </button>
              </div>
            </div>
          ))}
          {visibleMembers.length === 0 && (
            <div className="col-span-full adm-card p-12 text-center">
              <Users size={36} className="mx-auto text-adm-fg-3 mb-2" />
              <p className="adm-h3">No Personnel Found</p>
            </div>
          )}
        </motion.div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div
              initial={{ y: 20, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.96, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl adm-card p-6 sm:p-8 my-auto"
              style={{ boxShadow: "var(--adm-shadow-lg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-5 text-left max-h-[82vh] overflow-y-auto pr-1"
              >
                <div className="flex items-start justify-between border-b border-adm-line pb-4">
                  <div>
                    <p className="adm-eyebrow">Swaang Identity Registry</p>
                    <h2 className="adm-title text-2xl mt-0.5">
                      {editingId ? "Edit Profile" : "Add Personnel"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="adm-label">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="adm-input font-semibold"
                    />
                  </div>
                  <div>
                    <label className="adm-label">Official Email (For Crew Login) *</label>
                    <input
                      required
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="adm-input"
                    />
                  </div>
                </div>

                {/* Category & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="adm-label">Category</label>
                    <select
                      value={formData.category || "active"}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="adm-input"
                    >
                      <option value="active">Ensemble / Active</option>
                      <option value="president">President / Core</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                  <div>
                    <label className="adm-label">Role *</label>
                    <input
                      required
                      type="text"
                      placeholder="Role (e.g. Actor)"
                      value={formData.role || ""}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="adm-input"
                    />
                  </div>
                  <div>
                    <label className="adm-label">Seniority (Joining Year) *</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 2023"
                      value={formData.joiningYear || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, joiningYear: e.target.value })
                      }
                      className="adm-input"
                    />
                  </div>
                </div>

                {/* Conditional Details based on Category */}
                <AnimatePresence mode="wait">
                  {formData.category === "active" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4 p-4 adm-panel overflow-hidden"
                    >
                      <div>
                        <label className="adm-label">Branch</label>
                        <input
                          type="text"
                          placeholder="e.g. IT"
                          value={formData.branch || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, branch: e.target.value })
                          }
                          className="adm-input"
                        />
                      </div>
                      <div>
                        <label className="adm-label">Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 3rd"
                          value={formData.year || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                          }
                          className="adm-input"
                        />
                      </div>
                    </motion.div>
                  )}
                  {(formData.category === "president" ||
                    formData.category === "alumni") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4 p-4 adm-panel overflow-hidden"
                    >
                      <div>
                        <label className="adm-label">Tenure</label>
                        <input
                          type="text"
                          placeholder="e.g. 2023-25"
                          value={formData.tenure || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, tenure: e.target.value })
                          }
                          className="adm-input"
                        />
                      </div>
                      <div>
                        <label className="adm-label">Passout Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2026"
                          value={formData.passoutYear || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, passoutYear: e.target.value })
                          }
                          className="adm-input"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="adm-label">Bio One-Liner</label>
                  <textarea
                    placeholder="Bio one-liner..."
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="adm-input"
                  />
                </div>

                {/* Socials */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="adm-label">Instagram Handle</label>
                    <input
                      type="text"
                      placeholder="@handle"
                      value={formData.instagram || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      className="adm-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="adm-label">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin: e.target.value })
                      }
                      className="adm-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="adm-label">GitHub URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/..."
                      value={formData.github || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, github: e.target.value })
                      }
                      className="adm-input text-xs"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="adm-panel p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-adm-surface border border-adm-line overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users size={24} className="text-adm-fg-3" />
                    )}
                  </div>
                  <label className="adm-btn adm-btn-secondary w-full cursor-pointer">
                    <Upload size={15} />
                    <span>{uploading ? "Uploading..." : "Upload Identity Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "team")}
                    />
                  </label>
                </div>

                <div className="pt-3 border-t border-adm-line flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="adm-btn adm-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="adm-btn adm-btn-primary"
                  >
                    {editingId ? "Save Changes" : "Confirm Personnel"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GRADUATE MODAL --- */}
      <AnimatePresence>
        {graduatingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGraduatingId(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="adm-card p-6 sm:p-8 max-w-md w-full relative z-10 space-y-5"
              style={{ boxShadow: "var(--adm-shadow-lg)" }}
            >
              <div>
                <p className="adm-eyebrow">Alumni Transition</p>
                <h3 className="adm-title text-2xl mt-0.5">Graduate to Alumni? 🎓</h3>
              </div>
              <div className="space-y-3.5 text-left">
                <div>
                  <label className="adm-label">Tenure</label>
                  <input
                    type="text"
                    placeholder="Tenure (e.g. 2022-25)"
                    value={gradData.tenure}
                    onChange={(e) => setGradData({ ...gradData, tenure: e.target.value })}
                    className="adm-input"
                  />
                </div>
                <div>
                  <label className="adm-label">Passout Year</label>
                  <input
                    type="text"
                    placeholder="Passout Year (e.g. 2026)"
                    value={gradData.passoutYear}
                    onChange={(e) =>
                      setGradData({ ...gradData, passoutYear: e.target.value })
                    }
                    className="adm-input"
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setGraduatingId(null)}
                    className="adm-btn adm-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGraduate}
                    className="adm-btn adm-btn-primary flex-1"
                  >
                    Confirm Graduation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}