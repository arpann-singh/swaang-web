import os
import re

directory = 'src'
replacements = [
    (r'\bbg-brand-bg\b', 'bg-[var(--bg-primary)]'),
    (r'\btext-brand-text\b', 'text-[var(--text-primary)]'),
    (r'\bborder-brand-border\b', 'border-[var(--border-primary)]'),
]

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, repl in replacements:
                new_content = re.sub(pattern, repl, new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
