"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, useSpring, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🛑 THE KILL SWITCH: Keeps the header hidden inside the Admin Panel
  if (pathname?.startsWith("/admin")) return null;

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  // Smooth progress bar (Scroll Progress)
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });



  const navLinks = [
    { href: "/events", label: "Events", isLive: true },
    { href: "/team", label: "Ensemble" },
    { href: "/gallery", label: "Gallery" },
    { href: "/alumni", label: "Alumni" },
    { href: "/blog", label: "Blog" },
    { href: "/credits", label: "Credits" },
  ];

  return (
    <>
      <motion.header 
        variants={{
          visible: { y: 0 }
        }}
        animate="visible"
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-2 md:top-6 left-0 right-0 z-[100] px-3 md:px-8 pointer-events-none transition-all duration-300"
        style={{ marginTop: 'var(--ticker-height, 0px)' }}
      >
        <div className="w-full max-w-[98%] md:max-w-[95%] xl:max-w-7xl mx-auto flex flex-col items-center pointer-events-auto">
          
          {/* MAIN NAVBAR */}
          <nav className="w-full bg-[var(--card-primary)]/90 md:bg-[var(--card-primary)]/75 backdrop-blur-3xl border-2 md:border-4 border-[var(--border-primary)] rounded-2xl md:rounded-[2rem] px-3 md:px-6 h-14 md:h-20 flex justify-between items-center shadow-[4px_4px_0px_var(--border-primary)] md:shadow-[6px_6px_0px_var(--border-primary)] transition-colors duration-300 relative overflow-hidden gap-2 md:gap-4">
            
            {/* Scroll Progress Bar at the very bottom edge */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[2px] md:h-[3px] bg-[#FF5F5F] origin-left z-0 opacity-80"
              style={{ scaleX }}
            />

            {/* 🏢 LOGOS SECTION */}
            <div className="flex items-center z-10 shrink-0">
              <Link href="/" className="flex items-center gap-2 md:gap-3 group ml-1 md:ml-0" onClick={() => setMenuOpen(false)}>
                <div className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-[var(--bg-primary)] p-1.5 rounded-xl border-2 border-[var(--border-primary)]/10 group-hover:border-[var(--border-primary)]/40 transition-all">
                  <img src="/sstc-logo.png" alt="SSTC" className="h-5 md:h-6 w-auto object-contain" onError={(e) => (e.currentTarget.src = 'https://placehold.co/40x40?text=SSTC')} />
                  <div className="w-[2px] h-3 md:h-4 bg-[var(--border-primary)]/20" />
                  <img src="/swaang-logo.png" alt="Swaang" className="h-5 md:h-6 w-auto object-contain" onError={(e) => (e.currentTarget.src = 'https://placehold.co/40x40?text=SW')} />
                </div>
                <div className="flex flex-col leading-none justify-center">
                  <span className="font-black uppercase tracking-tighter text-lg md:text-2xl text-[var(--text-primary)]">Swaang</span>
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-[#FF5F5F] bg-[#FF5F5F]/10 px-1.5 py-0.5 rounded-sm w-fit mt-0.5">SSTC Bhilai</span>
                </div>
              </Link>
            </div>

            {/* 🔗 DESKTOP NAVIGATION */}
            <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 z-10 bg-[var(--bg-primary)]/40 px-2 py-1.5 rounded-2xl border-2 border-[var(--border-primary)]/10 backdrop-blur-md" onMouseLeave={() => setHoveredIndex(null)}>
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                
                // Special styling for "Events"
                if (link.isLive) {
                    return (
                      <Link key={link.href} href={link.href} className={`relative font-black uppercase text-[10px] tracking-widest transition-all duration-300 group flex items-center gap-2 px-4 py-2 rounded-xl border-[2px] mr-1 ${isActive ? 'bg-[#FF5F5F] text-white border-[#FF5F5F] shadow-md' : 'border-[var(--border-primary)]/20 hover:border-[#FF5F5F]/50 text-[var(--text-primary)] hover:text-[#FF5F5F] bg-[var(--card-primary)]/50'}`}>
                          <div className={`w-2 h-2 rounded-full animate-pulse ${isActive ? 'bg-white' : 'bg-[#FF5F5F]'}`} />
                          <span>{link.label}</span>
                      </Link>
                    )
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className={`relative px-3 xl:px-4 py-2 font-bold uppercase text-[9px] xl:text-[10px] tracking-[0.15em] transition-colors duration-300 z-10 ${isActive ? 'text-[#FF5F5F]' : 'text-[var(--text-primary)]/60 hover:text-[var(--text-primary)]'}`}
                  >
                    <span className="relative z-20">{link.label}</span>
                    
                    {/* The Sliding Hover Pill */}
                    {hoveredIndex === idx && (
                      <motion.div
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 bg-[var(--text-primary)]/5 rounded-xl -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    
                    {/* The Active Underline Marker */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-indicator"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-4 bg-[#FF5F5F] rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 🔘 ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-1.5 md:gap-3 z-10 shrink-0">
              
              {/* Join button removed - Now lives in the Hero section */}
              
              <Link href="/contact" className="h-9 md:h-11 bg-[#FFD166] text-[var(--border-primary)] border-2 md:border-[3px] border-[var(--border-primary)] px-3 md:px-6 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-xs tracking-widest shadow-[3px_3px_0px_var(--border-primary)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 hidden sm:flex items-center justify-center">
                Contact
              </Link>

              {/* Hamburger Menu Button (Mobile & Tablet) */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="lg:hidden h-10 w-10 md:h-11 md:w-11 border-2 md:border-[3px] border-[var(--border-primary)] rounded-xl md:rounded-2xl bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-1 shadow-[3px_3px_0px_var(--border-primary)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 z-[101]"
              >
                <div className={`w-4 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                <div className={`w-4 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <div className={`w-4 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* 📱 FULL-SCREEN MOBILE OVERLAY MENU (Premium Brutalist Layout) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at 90% 10%)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 90% 10%)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 90% 10%)' }}
            transition={{ duration: 0.6, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 z-[90] bg-[#FFD166] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background Marquee Decoration */}
            <div className="absolute inset-0 flex flex-col justify-between overflow-hidden opacity-10 pointer-events-none select-none py-10">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className={`whitespace-nowrap font-black uppercase text-[15vh] leading-none ${i % 2 === 0 ? 'text-transparent stroke-black stroke-2' : 'text-black'}`} style={{ WebkitTextStroke: i % 2 === 0 ? '2px black' : 'none' }}>
                    SWAANG SWAANG SWAANG SWAANG
                 </div>
               ))}
            </div>

            <div className="flex flex-col items-start gap-4 md:gap-8 w-full px-8 sm:px-16 z-10">
              
              {/* Navigation Links */}
              {navLinks.map((link, i) => (
                 <motion.div
                   key={link.href}
                   initial={{ opacity: 0, x: -50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   transition={{ delay: 0.2 + (i * 0.08), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                   className="w-full"
                 >
                   <Link 
                     href={link.href} 
                     onClick={() => setMenuOpen(false)}
                     className={`group block font-cinzel text-5xl sm:text-6xl font-black uppercase tracking-tighter transition-all hover:translate-x-4 ${pathname === link.href ? 'text-[#FF5F5F]' : 'text-black hover:text-white'}`}
                   >
                     {/* Number prefix */}
                     <span className="font-mono text-sm opacity-50 mr-4 group-hover:text-black">0{i + 1}</span>
                     {link.label}
                   </Link>
                 </motion.div>
              ))}

              <motion.div 
                 initial={{ opacity: 0, scaleX: 0 }}
                 animate={{ opacity: 1, scaleX: 1 }}
                 transition={{ delay: 0.7, duration: 0.6 }}
                 className="w-full h-1 bg-black/20 my-4 origin-left" 
              />

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="flex gap-4 w-full sm:hidden"
              >
                {/* Join button removed - Now lives in the Hero section */}
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="bg-[#FF5F5F] text-white border-[3px] border-black px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_black] flex-1 text-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  Contact Us
                </Link>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
