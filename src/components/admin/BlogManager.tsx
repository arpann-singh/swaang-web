"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Trash2, Edit2, PenTool, Upload } from "lucide-react";

export default function BlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    coverImage: "",
    content: "",
    author: "",
    status: "Draft" // Draft, Published
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "blog_posts"), orderBy("createdAt", "desc")), (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      const res = await fetch(`https://api.imgbb.com/1/upload?key=67f185db21d743a131bda4f8102ff94a`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setForm({ ...form, coverImage: data.data.url });
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
        await addDoc(collection(db, "blog_posts"), { ...form, createdAt: new Date(), updatedAt: new Date() });
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
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this post?")) {
      await deleteDoc(doc(db, "blog_posts", id));
    }
  };

  if (loading) return <div className="text-center p-10 font-black uppercase text-xl">Loading Blog...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-brand-border rounded-2xl shadow-[4px_4px_0px_#06D6A0]">
          <PenTool size={32} className="text-[#06D6A0]" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">The Blog</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Write Behind The Curtain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card-primary)] border-4 border-[var(--border-primary)] p-6 md:p-8 rounded-[2rem] shadow-[8px_8px_0px_var(--border-primary)] mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <input required type="text" placeholder="Post Title" value={form.title} onChange={handleTitleChange} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-black text-2xl uppercase outline-none focus:border-[#FF5F5F] text-black" />
            <p className="text-xs font-bold text-gray-500 mt-2 ml-2">URL: /blog/{form.slug}</p>
          </div>
          
          <input required type="text" placeholder="Author Name" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] text-black" />
          
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] text-black appearance-none">
            <option value="Draft">Draft (Hidden)</option>
            <option value="Published">Published (Public)</option>
          </select>

          <div className="md:col-span-2 relative">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="blog-cover" />
            <label htmlFor="blog-cover" className={`flex items-center justify-center gap-3 w-full border-2 border-dashed border-brand-border p-8 rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors text-black ${form.coverImage ? 'bg-green-50 border-green-500' : 'bg-gray-50'}`}>
              <Upload size={24} />
              {isUploading ? "Uploading..." : form.coverImage ? "Cover Image Uploaded! (Click to change)" : "Upload Cover Image"}
            </label>
            {form.coverImage && (
                <div className="mt-4 p-2 border-2 border-[var(--border-primary)] rounded-xl w-48 h-24 overflow-hidden relative mx-auto">
                    <img src={form.coverImage} className="object-cover w-full h-full" alt="Cover preview" />
                </div>
            )}
          </div>
        </div>

        <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Content (Supports simple HTML & Line Breaks)</p>
            <textarea required placeholder="Write your post here..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full h-96 bg-gray-50 border-2 border-brand-border p-6 rounded-xl font-medium text-base outline-none focus:border-[#FF5F5F] resize-y text-black" />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={isUploading} className="flex-1 bg-[#06D6A0] text-brand-text py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all">
            {editingId ? "Update Post" : "Save Post"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm({ title: "", slug: "", coverImage: "", content: "", author: "", status: "Draft" }); setEditingId(null); }} className="px-6 bg-gray-100 text-brand-text py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map(p => (
          <div key={p.id} className="bg-[var(--card-primary)] border-4 border-[var(--border-primary)] rounded-[2rem] p-4 shadow-[6px_6px_0px_var(--border-primary)] flex gap-4 items-center relative group">
            {p.coverImage ? (
                <img src={p.coverImage} alt={p.title} className="w-24 h-24 rounded-xl border-2 border-[var(--border-primary)] object-cover" />
            ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-[var(--border-primary)] bg-gray-100 flex items-center justify-center">📰</div>
            )}
            
            <div className="flex-1 min-w-0">
                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase mb-1 border border-black ${p.status === 'Published' ? 'bg-[#06D6A0] text-black' : 'bg-gray-200 text-gray-500'}`}>
                    {p.status}
                </span>
                <h3 className="font-black text-lg uppercase leading-tight truncate">{p.title}</h3>
                <p className="text-xs font-bold text-gray-500 truncate mt-1">By {p.author}</p>
            </div>

            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(p)} className="p-2 bg-[#FFD166] text-black rounded-lg border-2 border-black hover:scale-110"><Edit2 size={14}/></button>
              <button onClick={() => handleDelete(p.id)} className="p-2 bg-[#FF5F5F] text-white rounded-lg border-2 border-black hover:scale-110"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
