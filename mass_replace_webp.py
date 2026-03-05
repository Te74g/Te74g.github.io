import os
import re

base_dir = r"c:\Users\user\Desktop\unti\Te74g.github.io"

# File extensions to process
target_exts = ('.html', '.js', '.css', '.py', '.json')

exclude_dirs = {'.git', 'node_modules', 'assets_webp'}

for root, dirs, files in os.walk(base_dir):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(target_exts):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 1. Replace all .webp with .webp (case insensitive)
                new_content = re.sub(r'(?i)\.webp', '.webp', content)
                
                # 2. Replace all 'assets/' with 'assets/'
                new_content = new_content.replace('assets/', 'assets/')

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated references in: {filepath}")
            except Exception as e:
                print(f"Failed to process {filepath}: {e}")

print("String replacement complete!")
