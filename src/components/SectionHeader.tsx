"use client";

interface Props {
  title: string;
  subtitle?: string;
  emoji?: string;
  color?: string;
}

export default function SectionHeader({ title, subtitle, emoji, color = "#FF5F5F" }: Props) {
  return (
    <div className="container mx-auto px-6 mb-16 flex flex-col items-center text-center">
      <div 
        className="inline-block px-8 py-3 rounded-full border-4 border-[#2D2D2D] shadow-[6px_6px_0px_#2D2D2D] mb-4 bg-white"
        style={{ color: color }}
      >
        <h2 className="font-cinzel text-3xl md:text-4xl font-black uppercase tracking-tighter">
          {emoji} {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
      <div className="w-24 h-1 bg-[#2D2D2D] mt-6 rounded-full opacity-20" />
    </div>
  );
}
