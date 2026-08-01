import os
import re

directory = 'src'
replacements = [
    # Colors
    (r'bg-\[\#FFF9F0\]', 'bg-[#050505]'),
    (r'text-\[\#2D2D2D\]', 'text-white/90'),
    (r'text-\[\#FFF9F0\]', 'text-white/80'),
    (r'border-\[\#2D2D2D\]', 'border-white/10'),
    (r'border-\[\#0A0A0A\]', 'border-white/5'),
    (r'border-black', 'border-white/10'),
    (r'\bbg-white\b', 'bg-white/5 backdrop-blur-md'),
    (r'bg-\[\#1A1A1A\]', 'bg-[#050505]'),
    
    # Brutalist Borders to Minimal
    (r'\bborder-4\b', 'border'),
    (r'border-\[3px\]', 'border'),
    (r'\bborder-8\b', 'border'),
    (r'border-t-\[8px\]', 'border-t'),
    (r'border-t-\[12px\]', 'border-t'),
    (r'border-b-\[8px\]', 'border-b'),
    (r'border-b-\[12px\]', 'border-b'),
    (r'md:border-b-\[12px\]', ''),
    (r'md:border-t-\[12px\]', ''),
    (r'md:border-4', ''),
    (r'md:border-\[3px\]', ''),
    
    # Brutalist Shadows to Minimal
    (r'shadow-\[[^\]]+\]', 'shadow-2xl'),
]

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            # Skip Hero.tsx to preserve our newly crafted aesthetic design
            if 'Hero.tsx' in file:
                continue
                
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = content
            for pattern, repl in replacements:
                new_content = re.sub(pattern, repl, new_content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
