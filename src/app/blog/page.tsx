"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
        query(collection(db, "blog_posts"), orderBy("createdAt", "desc")), 
        (snap) => {
            const allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
            const publishedPosts = allPosts.filter(p => p.status === "Published");
            setPosts(publishedPosts);
            setLoading(false);
        }
    );
    return () => unsub();
  }, []);

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center font-black uppercase text-xl tracking-widest">Loading Entries...</div>;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="The Blog" subtitle="Behind The Curtain" />
        
        <p className="max-w-2xl mt-8 text-lg font-bold opacity-80 leading-relaxed mb-16">
          Stories, rehearsal diaries, and insights from the members of Swaang. Step into our world.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {posts.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-[var(--card-primary)] border-[6px] border-[var(--border-primary)] rounded-[3rem] shadow-[12px_12px_0px_var(--border-primary)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_#06D6A0] transition-all flex flex-col overflow-hidden group cursor-pointer"
            >
              <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                {p.coverImage && (
                    <div className="w-full h-64 border-b-[6px] border-[var(--border-primary)] overflow-hidden relative">
                        <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    </div>
                )}
                
                <div className="p-8 flex-1 flex flex-col">
                    <h3 className="font-black text-3xl uppercase leading-tight mb-4 group-hover:text-[#FF5F5F] transition-colors">{p.title}</h3>
                    
                    {/* Excerpt - taking first 150 chars of content */}
                    <p className="font-bold opacity-70 mb-8 line-clamp-3">
                        {p.content.replace(/<[^>]*>?/gm, '')}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t-4 border-[var(--border-primary)]/10">
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-60">
                            <span className="flex items-center gap-2"><User size={14}/> {p.author}</span>
                            <span className="flex items-center gap-2"><Clock size={14}/> {p.createdAt?.toDate().toLocaleDateString() || "Recent"}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#FFD166] border-2 border-[var(--border-primary)] flex items-center justify-center text-[var(--border-primary)] group-hover:rotate-[-45deg] transition-transform">
                            <ArrowRight size={18} strokeWidth={3} />
                        </div>
                    </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 opacity-50 border-4 border-dashed border-[var(--border-primary)] rounded-[3rem]">
            <h3 className="font-black text-2xl uppercase mb-2">The stage is being set</h3>
            <p className="font-bold">No entries published yet. Check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
