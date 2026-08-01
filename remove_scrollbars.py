import os
import re

directory = 'src'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = re.sub(r'\bswaang-scrollbar\b', '', content)
            new_content = re.sub(r'\bcustom-scrollbar\b', '', new_content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Removed old scrollbars from {filepath}")
