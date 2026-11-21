"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Trash2, Edit2, UserPlus, Upload, GraduationCap, Loader2 } from "lucide-react";

export default function AlumniManager() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    batch: "",
    role: "",
    company: "",
    photo: "",
    bio: "",
    category: "Legend", // Legend, President, Member
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "alumni"), orderBy("batch", "desc")), (snap) => {
      setAlumni(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "67f185db21d743a131bda4f8102ff94a";
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm({ ...form, photo: data.data.url });
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "alumni", editingId), form);
      } else {
        await addDoc(collection(db, "alumni"), { ...form, createdAt: new Date() });
      }
      setForm({ name: "", batch: "", role: "", company: "", photo: "", bio: "", category: "Legend" });
      setEditingId(null);
    } catch (err) {
      alert("Error saving alumni");
    }
  };

  const handleEdit = (a: any) => {
    setForm(a);
    setEditingId(a.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this alumni record?")) {
      await deleteDoc(doc(db, "alumni", id));
    }
  };

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Loading Alumni Hall of Fame...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-adm-accent/15 border border-adm-accent/35 flex items-center justify-center text-adm-accent-text shrink-0">
            <UserPlus size={20} />
          </div>
          <div>
            <p className="adm-eyebrow">Manage Alumni Network</p>
            <h1 className="adm-title mt-0.5">Hall of Fame</h1>
          </div>
        </div>
        <span className="adm-badge adm-badge-accent">{alumni.length} Alumni Records</span>
      </div>

      <form onSubmit={handleSubmit} className="adm-card p-5 sm:p-7 space-y-5">
        <div className="border-b border-adm-line pb-3">
          <h2 className="adm-h2">{editingId ? "Edit Alumnus Profile" : "Add to Hall of Fame"}</h2>
          <p className="adm-muted">Honor graduated Swaang legends, past presidents, and notable members</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="adm-label">Alumnus Name *</label>
            <input
              required
              type="text"
              placeholder="Alumnus Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label">Batch *</label>
            <input
              required
              type="text"
              placeholder="Batch (e.g. 2018-2022)"
              value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label">Role in Swaang *</label>
            <input
              required
              type="text"
              placeholder="Role in Swaang (e.g. President, Lead Actor)"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label">Current Company / Status (Optional)</label>
            <input
              type="text"
              placeholder="Current Company / Status"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="adm-input"
            >
              <option value="Legend">Swaang Legend</option>
              <option value="President">Past President</option>
              <option value="Member">Notable Member</option>
            </select>
          </div>

          <div>
            <label className="adm-label">Profile Photo</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="alumni-photo" />
            <label
              htmlFor="alumni-photo"
              className={`adm-btn w-full cursor-pointer ${
                form.photo ? "adm-btn-success" : "adm-btn-secondary"
              }`}
            >
              <Upload size={15} />
              <span>
                {isUploading ? "Uploading..." : form.photo ? "Photo Uploaded (Click to change)" : "Upload Profile Photo"}
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="adm-label">Short Bio / Impact *</label>
          <textarea
            required
            placeholder="Short Bio / Impact"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="adm-input"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-adm-line">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({ name: "", batch: "", role: "", company: "", photo: "", bio: "", category: "Legend" });
                setEditingId(null);
              }}
              className="adm-btn adm-btn-secondary"
            >
              Cancel
            </button>
          )}
          <button type="submit" disabled={isUploading} className="adm-btn adm-btn-primary">
            {editingId ? "Update Alumnus" : "Add to Hall of Fame"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alumni.map((a) => (
          <div key={a.id} className="adm-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {a.photo ? (
                    <img
                      src={a.photo}
                      alt={a.name}
                      className="w-16 h-16 rounded-xl border border-adm-line object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-adm-line bg-adm-surface-2 flex items-center justify-center text-adm-accent-text shrink-0">
                      <GraduationCap size={26} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-lg text-adm-fg truncate">{a.name}</h3>
                    <p className="text-xs font-mono text-adm-accent-text">{a.batch}</p>
                    <span className="adm-badge adm-badge-success mt-1">{a.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(a)}
                    className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-adm-fg-3">Role</p>
                  <p className="text-sm font-medium text-adm-fg">{a.role}</p>
                </div>
                {a.company && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-adm-fg-3">Now At</p>
                    <p className="text-sm font-medium text-adm-fg">{a.company}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-adm-line">
              <p className="text-xs text-adm-fg-2 italic line-clamp-3">"{a.bio}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
