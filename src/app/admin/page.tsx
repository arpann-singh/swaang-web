"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { ShieldCheck, Sun, Moon, ArrowLeft, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("swaang_admin_theme") as "dark" | "light" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("swaang_admin_theme", next);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("ERROR: INVALID CREDENTIALS. ACCESS DENIED.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className={`adm ${theme === "dark" ? "adm-dark" : "adm-light"} min-h-screen flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200`}>
        {/* Top Bar */}
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
          <Link href="/" className="adm-btn adm-btn-ghost adm-btn-sm">
            <ArrowLeft size={15} />
            <span>Return to Public Site</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={14} className="text-adm-accent-text" /> : <Moon size={14} />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </header>

        {/* Centered Auth Card */}
        <div className="my-auto py-8 flex items-center justify-center">
          <div className="max-w-md w-full adm-card overflow-hidden">
            <div className="px-6 py-4 bg-adm-surface-2 border-b border-adm-line flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-adm-accent/15 border border-adm-accent/35 flex items-center justify-center text-adm-accent-text">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <h1 className="font-mono font-bold text-xs uppercase tracking-widest text-adm-fg">Sys.Auth</h1>
                  <p className="text-[11px] text-adm-fg-3">Swaang Studio Console</p>
                </div>
              </div>
              <span className="adm-badge adm-badge-accent">Restricted Area</span>
            </div>

            <div className="p-6 sm:p-8">
              <p className="adm-eyebrow mb-1">Directorate Portal</p>
              <h2 className="adm-title mb-2">Security Clearance</h2>
              <p className="adm-muted mb-6">
                Sign in with your authorized administrator credentials to access the Swaang operations suite.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="adm-label">Email Identity</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="adm-input pl-10"
                      placeholder="admin@swaang.club"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="adm-label">Access Code (Password)</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="adm-input pl-10 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-adm-fg-3 hover:text-adm-fg p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-adm-danger/40 bg-adm-danger/10 p-3 flex items-center gap-2.5 text-adm-danger text-xs font-semibold">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="adm-btn adm-btn-primary adm-btn-lg w-full mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying Clearance...</span>
                    </>
                  ) : (
                    <span>Initialize Session</span>
                  )}
                </button>
              </form>
            </div>

            <div className="border-t border-adm-line px-6 py-3.5 bg-adm-surface-2 flex items-center justify-between text-xs">
              <span className="text-adm-fg-3">Swaang Dramatic Society • SSTC</span>
              <Link href="/" className="adm-link">
                Abort & Return
              </Link>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-adm-fg-3 py-2">
          Protected by Firebase Authentication & Administrative Clearance Rules
        </footer>
      </div>
    </PageTransition>
  );
}
