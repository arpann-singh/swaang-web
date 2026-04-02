"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link 
      href={href} 
      className={`hover:text-[#FF5F5F] transition-colors font-black uppercase text-[11px] tracking-widest ${pathname === href ? 'text-[#FF5F5F]' : 'text-[#2D2D2D]'}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="fixed top-2 md:top-6 left-0 right-0 z-[100] px-2 md:px-6">
      <nav className="max-w-6xl mx-auto bg-white border-[3px] md:border-4 border-[#2D2D2D] rounded-2xl md:rounded-full px-3 md:px-8 py-2 md:py-3 flex justify-between items-center shadow-[4px_4px_0px_#2D2D2D] md:shadow-[8px_8px_0px_#2D2D2D]">
        
        {/* 🏢 LOGOS SECTION */}
        <Link href="/" className="flex items-center gap-2 md:gap-4 group">
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 md:p-1.5 rounded-xl border-2 border-black/5 group-hover:border-black/20 transition-all">
            <img 
              src="/sstc-logo.png" 
              alt="SSTC Logo" 
              className="h-6 md:h-10 w-auto object-contain" 
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/40x40?text=SSTC')}
            />
            <div className="w-[2px] h-4 md:h-6 bg-black/10 mx-1" />
            <img 
              src="/swaang-logo.png" 
              alt="Swaang Logo" 
              className="h-6 md:h-10 w-auto object-contain" 
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/40x40?text=SW')}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black uppercase tracking-tighter text-sm md:text-2xl">Swaang</span>
            <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-[#FF5F5F]">SSTC Bhilai</span>
          </div>
        </Link>
        
        {/* 🔗 DESKTOP NAVIGATION */}
        <div className="hidden lg:flex gap-10">
          <NavLink href="/events" label="Events" />
          <NavLink href="/members" label="Ensemble" />
          <NavLink href="/gallery" label="Gallery" />
        </div>

        {/* 🔘 ACTION BUTTONS */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* 🔥 FIXED ROUTE: Now points to /audition */}
          <Link href="/auditions" className="bg-[#06D6A0] text-[#2D2D2D] border-2 md:border-[3px] border-[#2D2D2D] px-4 md:px-7 py-1.5 md:py-2.5 rounded-full font-black uppercase text-[10px] md:text-xs shadow-[3px_3px_0px_#2D2D2D] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95">
            Join
          </Link>
          <Link href="/contact" className="bg-[#FFD166] text-[#2D2D2D] border-2 md:border-[3px] border-[#2D2D2D] px-4 md:px-7 py-1.5 md:py-2.5 rounded-full font-black uppercase text-[10px] md:text-xs shadow-[3px_3px_0px_#2D2D2D] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95">
            Contact
          </Link>
        </div>
      </nav>

      {/* 📱 MOBILE NAVIGATION BAR */}
      <div className="lg:hidden flex justify-center mt-3">
        <div className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-full px-8 py-2.5 flex gap-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10">
          <Link href="/events" className="active:text-[#FF5F5F]">Events</Link>
          <Link href="/members" className="active:text-[#FF5F5F]">Ensemble</Link>
          <Link href="/gallery" className="active:text-[#FF5F5F]">Gallery</Link>
        </div>
      </div>
    </header>
  );
}
