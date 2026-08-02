"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import FacultyHero from "./team/FacultyHero";

export default function Team({ facultyData }: { facultyData?: any }) {
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("joining");
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // New Advanced Filters
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "team"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setMembers(fetched);
    });
    return () => unsub();
  }, []);

  // Extract unique filter sets dynamically
  const uniqueRoles = Array.from(new Set(members.map(m => m.role).filter(Boolean))).sort();
  const uniqueYears = Array.from(new Set(members.map(m => m.joiningYear).filter(Boolean))).sort((a: any, b: any) => Number(b) - Number(a));
  const uniqueGenders = Array.from(new Set(members.map(m => m.gender).filter(Boolean))).sort();

  const resetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedYear("all");
    setSelectedGender("all");
    setSortBy("joining");
    setSortOrder("desc");
  };

  const filteredMembers = members.filter((m) => {
    const matchesTab = activeTab === "all" || m.category === activeTab;
    const matchesRole = selectedRole === "all" || m.role === selectedRole;
    const matchesYear = selectedYear === "all" || m.joiningYear === selectedYear;
    const matchesGender = selectedGender === "all" || m.gender === selectedGender;

    const matchesSearch = 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.branch?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesRole && matchesYear && matchesGender && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = (a.name || "").localeCompare(b.name || "");
        break;
      case 'joining':
        comparison = (parseInt(a.joiningYear) || 9999) - (parseInt(b.joiningYear) || 9999);
        break;
      case 'passout':
        comparison = (parseInt(a.passoutYear) || 9999) - (parseInt(b.passoutYear) || 9999);
        break;
      case 'role':
        comparison = (a.role || "").localeCompare(b.role || "");
        break;
      default:
        comparison = 0;
    }
    return sortOrder === "desc" ? comparison * -1 : comparison;
  });

  return (
    <section className="py-20 px-6 max-w-[85rem] mx-auto min-h-screen">
      
      {/* HEADER & SEARCH SECTION */}
      <div className="flex flex-col mb-16 gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-[var(--border-primary)] pb-6">
           <div>
              <h2 className="text-6xl md:text-[6rem] lg:text-[7rem] font-black uppercase tracking-tighter text-[var(--text-primary)] leading-[0.85] font-cinzel">
                Ensemble
              </h2>
              <p className="font-black uppercase tracking-[0.4em] text-[#FF5F5F] text-xs md:text-sm mt-4">The Swaang Collective</p>
           </div>
        </div>

        {/* TOOLBAR COMMAND CENTER */}
        <div className="flex flex-col gap-8 bg-white border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_black] rounded-none">
           
           {/* TOP ROW: Search & Sort */}
           <div className={`flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 ${showFilters ? 'border-b-4 border-black pb-8' : ''}`}>
               <div className="relative w-full xl:w-[400px]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40">
                     <Search size={20} strokeWidth={4} />
                  </div>
                  <input 
                     type="text" 
                     placeholder="SEARCH NAME OR ROLE..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 h-[56px] bg-white border-4 border-black focus:bg-[#FFD166] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_black] rounded-none outline-none font-black uppercase tracking-widest text-[10px] transition-all placeholder:text-black/30 text-black"
                  />
               </div>
               
               <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                 <div className="relative flex-1 md:flex-none md:w-[180px]">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-[56px] px-4 bg-white border-4 border-black focus:bg-[#FFD166] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_black] rounded-none outline-none font-black uppercase tracking-widest text-[10px] transition-all text-black cursor-pointer appearance-none"
                    >
                      <option value="joining">SORT: YEAR (JOIN)</option>
                      <option value="passout">SORT: YEAR (PASSOUT)</option>
                      <option value="name">SORT: NAME</option>
                      <option value="role">SORT: ROLE</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-black text-xs font-black">
                       ▼
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="h-[56px] px-6 bg-black text-[#06D6A0] border-4 border-black font-black uppercase text-[12px] tracking-[0.2em] hover:bg-[#06D6A0] hover:text-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_black] transition-all"
                 >
                    {sortOrder === 'asc' ? 'ASC ↑' : 'DESC ↓'}
                 </button>
                 
                 <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-[56px] px-6 text-black border-4 border-black font-black uppercase text-[12px] tracking-[0.2em] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_black] transition-all md:ml-auto ${showFilters ? 'bg-[#FFD166]' : 'bg-white'}`}
                 >
                    {showFilters ? '− CLOSE' : '+ FILTERS'}
                 </button>

                 <button 
                    onClick={resetFilters}
                    className="h-[56px] px-6 bg-[#FF5F5F] text-black border-4 border-black font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-[#FF5F5F] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_black] transition-all"
                 >
                    RESET
                 </button>
               </div>
           </div>

           {/* BOTTOM ROW: Dynamic Filters Grid */}
           <AnimatePresence>
             {showFilters && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2 pb-2">
                     
                     {/* CATEGORY / STATUS */}
                     <div className="space-y-4">
                       <h4 className="font-mono font-black uppercase text-[10px] tracking-widest text-black/50 border-b-2 border-black/10 pb-2 inline-block">1. STATUS</h4>
                       <div className="flex flex-wrap gap-2">
                         {['all', 'president', 'active', 'alumni'].map((tab) => (
                           <button
                             key={tab}
                             onClick={() => setActiveTab(tab)}
                             className={`px-4 py-2 border-4 border-black font-black uppercase text-[9px] tracking-[0.1em] transition-all ${
                               activeTab === tab 
                                 ? 'bg-[#06D6A0] text-black translate-y-1 translate-x-1 shadow-none' 
                                 : 'bg-white text-black hover:bg-[#FFD166] hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_black]'
                             }`}
                           >
                             {tab === 'all' ? 'ALL' : tab}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* ROLES */}
                     <div className="space-y-4">
                       <h4 className="font-mono font-black uppercase text-[10px] tracking-widest text-black/50 border-b-2 border-black/10 pb-2 inline-block">2. ROLE</h4>
                       <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2">
                         <button
                           onClick={() => setSelectedRole("all")}
                           className={`px-4 py-2 border-4 border-black font-black uppercase text-[9px] tracking-[0.1em] transition-all ${
                             selectedRole === "all" ? 'bg-[#FFD166] text-black translate-y-1 translate-x-1 shadow-none' : 'bg-white text-black hover:bg-[#FFD166] hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_black]'
                           }`}
                         >ALL</button>
                         {uniqueRoles.map((role: any) => (
                           <button
                             key={role}
                             onClick={() => setSelectedRole(role)}
                             className={`px-4 py-2 border-4 border-black font-black uppercase text-[9px] tracking-[0.1em] transition-all ${
                               selectedRole === role ? 'bg-[#FFD166] text-black translate-y-1 translate-x-1 shadow-none' : 'bg-white text-black hover:bg-[#FFD166] hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_black]'
                             }`}
                           >{role}</button>
                         ))}
                       </div>
                     </div>
                     
                     {/* YEARS & GENDER COMBINED */}
                     <div className="space-y-6">
                       {/* YEARS */}
                       <div className="space-y-4">
                         <h4 className="font-mono font-black uppercase text-[10px] tracking-widest text-black/50 border-b-2 border-black/10 pb-2 inline-block">3. JOIN YEAR</h4>
                         <div className="flex flex-wrap gap-2">
                           <button
                             onClick={() => setSelectedYear("all")}
                             className={`px-4 py-2 border-4 border-black font-black uppercase text-[9px] tracking-[0.1em] transition-all ${
                               selectedYear === "all" ? 'bg-black text-white translate-y-1 translate-x-1 shadow-none' : 'bg-white text-black hover:bg-black hover:text-white hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_black]'
                             }`}
                           >ALL</button>
                           {uniqueYears.map((year: any) => (
                             <button
                               key={year}
                               onClick={() => setSelectedYear(year)}
                               className={`px-4 py-2 border-4 border-black font-black uppercase text-[9px] tracking-[0.1em] transition-all ${
                                 selectedYear === year ? 'bg-black text-white translate-y-1 translate-x-1 shadow-none' : 'bg-white text-black hover:bg-black hover:text-white hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_black]'
                               }`}
                             >{year}</button>
                           ))}
                         </div>
                       </div>

                       {/* GENDERS */}
                       {uniqueGenders.length > 0 && (
                         <div className="space-y-4 border-t-4 border-black/10 pt-4">
                           <h4 className="font-mono font-black uppercase text-[10px] tracking-widest text-black/50 border-b-2 border-black/10 pb-2 inline-block">4. GENDER</h4>
                           <div className="flex flex-wrap gap-2">
                             <button
                               onClick={() => setSelectedGender("all")}
                               className={`px-4 py-2 border-4 border-black font-black uppercase text-[9px] tracking-[0.1em] transition-all ${
                                 selectedGender === "all" ? 'bg-[#FF5F5F] text-white translate-y-1 translate-x-1 shadow-none' : 'bg-white text-black hover:bg-[#FF5F5F] hover:text-white hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_black]'
                               }`}
                             >ALL</button>
                             {uniqueGenders.map((gender: any) => (
                               <button
                                 key={gender}
                                 onClick={() => setSelectedGender(gender)}
                                 className={`px-4 py-2 border-4 border-black font-black uppercase text-[9px] tracking-[0.1em] transition-all ${
                                   selectedGender === gender ? 'bg-[#FF5F5F] text-white translate-y-1 translate-x-1 shadow-none' : 'bg-white text-black hover:bg-[#FF5F5F] hover:text-white hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_black]'
                                 }`}
                               >{gender}</button>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>

                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* COMPACT FACULTY HERO EMBED */}
      {facultyData && (
        <FacultyHero data={facultyData} />
      )}

      {/* COMPACT PREMIUM OVERLAY GRID */}
      {filteredMembers.length === 0 ? (
         <div className="w-full py-32 flex flex-col items-center justify-center border-4 border-dashed border-[var(--border-primary)]/20 bg-black/5 rounded-[3rem]">
            <span className="text-6xl mb-4">🎭</span>
            <h3 className="font-black uppercase tracking-widest text-[var(--border-primary)]/50 text-xl">No Members Found</h3>
         </div>
      ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
           <AnimatePresence>
             {filteredMembers.map((member) => (
               <motion.div
                   layout
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   whileInView={{ opacity: 1, scale: 1, y: 0 }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 0.3 }}
                   key={member.id}
                   className={`group relative bg-[#FFF9F0] border-8 border-black p-4 md:p-5 shadow-[8px_8px_0px_black] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_#FF5F5F] flex flex-col h-full ${
                     ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2"][filteredMembers.indexOf(member) % 4]
                   }`}
                 >
                   {/* Top Category Badge */}
                   <div className="absolute -top-3 -right-3 z-30 flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform">
                      <span className={`border-4 border-black px-3 py-1 font-mono font-black uppercase tracking-[0.2em] text-[10px] shadow-[4px_4px_0px_black] ${
                         member.category === 'president' ? 'bg-[#FFD166] text-black' : 
                         member.category === 'active' ? 'bg-[#06D6A0] text-black' : 
                         'bg-white text-black'
                      }`}>
                         {member.category}
                      </span>
                   </div>

                   {/* POLAROID FRAME */}
                   <div className="relative mb-4 bg-white border-4 border-black p-2 pb-8 shadow-[4px_4px_0px_black] z-20 shrink-0 transform group-hover:scale-[1.02] group-hover:rotate-1 transition-transform duration-300">
                     <div className="relative aspect-square w-full border-4 border-black overflow-hidden bg-gray-200">
                        {member.image ? (
                           <img 
                              src={member.image} 
                              alt={member.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                           />
                        ) : (
                           <div className="absolute inset-0 flex flex-col items-center justify-center font-mono font-black text-black opacity-30 text-xl uppercase bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]">
                              NO ID
                           </div>
                        )}
                     </div>

                     {/* Role Tag (Typewriter Tape) */}
                     <div className="absolute -bottom-4 -left-3 bg-black text-white border-4 border-black px-3 py-1 font-mono font-black uppercase text-[9px] tracking-widest shadow-[4px_4px_0px_black] z-40 -rotate-3 group-hover:-rotate-6 transition-transform">
                       {member.role || 'ENSEMBLE'}
                     </div>
                   </div>

                   {/* INFO SECTION */}
                   <div className="flex flex-col flex-1 bg-white border-4 border-black p-3 md:p-4 shadow-[4px_4px_0px_black] relative z-10 mt-1">
                     <h3 className="font-cinzel text-base md:text-lg xl:text-xl font-black uppercase text-black leading-[1.1] tracking-tighter mb-3 border-b-4 border-black pb-3 group-hover:text-[#FF5F5F] transition-colors break-words">
                        {member.name}
                     </h3>
                     
                     <div className="flex flex-wrap items-end gap-2 mt-auto pt-1 pb-1">
                        {member.branch && (
                           <span className="bg-[#FFF9F0] text-black border-2 border-black px-2 py-1 font-mono font-black text-[9px] md:text-[10px] uppercase shadow-[2px_2px_0px_black]">
                              {member.branch}
                           </span>
                        )}
                        <span className="bg-[#06D6A0] text-black border-2 border-black px-2 py-1 font-mono font-black text-[9px] md:text-[10px] uppercase shadow-[2px_2px_0px_black]">
                           {member.joiningYear ? `IN: ${member.joiningYear}` : 'UNKNOWN YR'}
                        </span>
                     </div>
                   </div>

                   {/* SOCIALS STAMP */}
                   {(member.instagram || member.linkedin) && (
                     <div className="absolute -right-4 -bottom-4 bg-[#FFD166] border-4 border-black p-2 flex gap-2 shadow-[4px_4px_0px_black] rotate-3 z-30 group-hover:rotate-6 transition-transform">
                        {member.instagram && (
                           <a href={member.instagram} target="_blank" className="bg-white border-2 border-black p-1 text-black hover:bg-[#E4405F] hover:text-white shadow-[2px_2px_0px_black] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                             <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                           </a>
                        )}
                        {member.linkedin && (
                           <a href={member.linkedin} target="_blank" className="bg-white border-2 border-black p-1 text-black hover:bg-[#0077B5] hover:text-white shadow-[2px_2px_0px_black] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                               <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                           </a>
                        )}
                     </div>
                   )}
                 </motion.div>
             ))}
           </AnimatePresence>
         </div>
      )}
    </section>
  );
}