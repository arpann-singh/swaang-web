import os
import re

directory = 'src'
replacements = [
    (r'bg-\[\#FFF9F0\]', 'bg-brand-bg'),
    (r'text-\[\#2D2D2D\]', 'text-brand-text'),
    (r'border-\[\#2D2D2D\]', 'border-brand-border'),
    (r'shadow-\[([0-9a-zA-Z-px_]+)_#2D2D2D\]', r'shadow-[\1_var(--border-primary)]'),
    (r'bg-\[\#2D2D2D\]', 'bg-brand-border'),
    (r'text-\[\#FFF9F0\]', 'text-brand-bg'),
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
                print(f"Updated {filepath}")
