"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const q = query(collection(db, "blog_posts"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPost({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center font-black uppercase text-xl tracking-widest">Loading Entry...</div>;

  if (!post) return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center">
        <h1 className="font-black text-6xl uppercase tracking-tighter mb-4 text-[#FF5F5F]">404</h1>
        <p className="font-bold text-xl uppercase tracking-widest opacity-50 mb-8">Post not found</p>
        <button onClick={() => router.push('/blog')} className="px-8 py-4 bg-[var(--border-primary)] text-[var(--bg-primary)] rounded-full font-black uppercase tracking-widest shadow-[4px_4px_0px_#FFD166]">Go Back</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-32 pb-24 px-6">
      <article className="max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs opacity-60 hover:opacity-100 hover:text-[#FF5F5F] transition-colors mb-12">
            <ArrowLeft size={16} strokeWidth={3} /> Back to Blog
        </Link>

        {post.coverImage && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-64 md:h-[400px] border-[6px] border-[var(--border-primary)] rounded-[3rem] overflow-hidden mb-12 shadow-[12px_12px_0px_#06D6A0]"
            >
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="font-black text-5xl md:text-7xl uppercase tracking-tighter leading-[0.9] mb-8">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-black uppercase tracking-widest opacity-60 mb-12 py-6 border-y-4 border-[var(--border-primary)]/10">
                <span className="flex items-center gap-2 bg-[var(--card-primary)] px-4 py-2 rounded-full border-2 border-[var(--border-primary)] text-[var(--text-primary)]"><User size={16}/> {post.author}</span>
                <span className="flex items-center gap-2"><Clock size={16}/> {post.createdAt?.toDate().toLocaleDateString() || "Recent"}</span>
            </div>

            {/* Post Content */}
            {/* The content is rendered with white-space pre-wrap to support basic text area line breaks */}
            <div className="prose prose-lg max-w-none font-medium leading-relaxed opacity-90 text-[var(--text-primary)]" style={{ whiteSpace: 'pre-wrap' }}>
                {post.content}
            </div>
        </motion.div>
      </article>
    </main>
  );
}
