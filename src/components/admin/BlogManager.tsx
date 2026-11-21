"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Trash2, Edit2, PenTool, Upload, Newspaper, Loader2 } from "lucide-react";

export default function BlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    coverImage: "",
    content: "",
    author: "",
    status: "Draft", // Draft, Published
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "blog_posts"), orderBy("createdAt", "desc")), (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
        setForm({ ...form, coverImage: data.data.url });
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm({ ...form, title, slug: generateSlug(title) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "blog_posts", editingId), { ...form, updatedAt: new Date() });
      } else {
        await addDoc(collection(db, "blog_posts"), {
          ...form,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      setForm({ title: "", slug: "", coverImage: "", content: "", author: "", status: "Draft" });
      setEditingId(null);
    } catch (err) {
      alert("Error saving post");
    }
  };

  const handleEdit = (p: any) => {
    setForm(p);
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this post?")) {
      await deleteDoc(doc(db, "blog_posts", id));
    }
  };

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Loading Blog Articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-adm-success/12 border border-adm-success/30 flex items-center justify-center text-adm-success shrink-0">
            <PenTool size={20} />
          </div>
          <div>
            <p className="adm-eyebrow">Write Behind The Curtain</p>
            <h1 className="adm-title mt-0.5">Articles & Blog</h1>
          </div>
        </div>
        <span className="adm-badge adm-badge-neutral">{posts.length} Posts</span>
      </div>

      <form onSubmit={handleSubmit} className="adm-card p-5 sm:p-7 space-y-5">
        <div className="border-b border-adm-line pb-3">
          <h2 className="adm-h2">{editingId ? "Edit Blog Post" : "Compose New Post"}</h2>
          <p className="adm-muted">Articles published here appear on /blog and /blog/[slug]</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="adm-label">Post Title *</label>
            <input
              required
              type="text"
              placeholder="Post Title"
              value={form.title}
              onChange={handleTitleChange}
              className="adm-input font-semibold text-base"
            />
            <p className="adm-hint font-mono">URL: /blog/{form.slug || "..."}</p>
          </div>

          <div>
            <label className="adm-label">Author Name *</label>
            <input
              required
              type="text"
              placeholder="Author Name"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="adm-input"
            />
          </div>

          <div>
            <label className="adm-label">Publication Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="adm-input"
            >
              <option value="Draft">Draft (Hidden)</option>
              <option value="Published">Published (Public)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="adm-label">Cover Image</label>
            <div className="adm-panel p-4 flex flex-col sm:flex-row items-center gap-4">
              {form.coverImage && (
                <div className="w-36 h-20 rounded-xl border border-adm-line overflow-hidden shrink-0">
                  <img src={form.coverImage} className="object-cover w-full h-full" alt="Cover preview" />
                </div>
              )}
              <div className="flex-1 w-full">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="blog-cover" />
                <label
                  htmlFor="blog-cover"
                  className={`adm-btn w-full cursor-pointer ${
                    form.coverImage ? "adm-btn-success" : "adm-btn-secondary"
                  }`}
                >
                  <Upload size={16} />
                  <span>
                    {isUploading
                      ? "Uploading..."
                      : form.coverImage
                      ? "Cover Image Uploaded (Click to change)"
                      : "Upload Cover Image"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="adm-label">Content (Supports simple HTML & Line Breaks) *</label>
          <textarea
            required
            placeholder="Write your post here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="adm-input min-h-64"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-adm-line">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({ title: "", slug: "", coverImage: "", content: "", author: "", status: "Draft" });
                setEditingId(null);
              }}
              className="adm-btn adm-btn-secondary"
            >
              Cancel
            </button>
          )}
          <button type="submit" disabled={isUploading} className="adm-btn adm-btn-primary">
            {editingId ? "Update Post" : "Save Post"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((p) => (
          <div key={p.id} className="adm-card p-4 flex gap-4 items-center">
            {p.coverImage ? (
              <img
                src={p.coverImage}
                alt={p.title}
                className="w-20 h-20 rounded-xl border border-adm-line object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl border border-adm-line bg-adm-surface-2 flex items-center justify-center text-adm-fg-3 shrink-0">
                <Newspaper size={24} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <span
                className={`adm-badge mb-1 ${
                  p.status === "Published" ? "adm-badge-success" : "adm-badge-neutral"
                }`}
              >
                {p.status}
              </span>
              <h3 className="font-display font-bold text-base text-adm-fg leading-snug truncate">
                {p.title}
              </h3>
              <p className="text-xs text-adm-fg-3 truncate mt-0.5">By {p.author}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleEdit(p)}
                className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
