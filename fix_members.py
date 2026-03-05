"""
Trim profileImages arrays in data_members.js to max 3 entries.
Also removes references to files that no longer exist on disk.
"""
import re
import os

path = r'c:\Users\user\Desktop\unti\Te74g.github.io\_config\data_members.js'
root = r'c:\Users\user\Desktop\unti\Te74g.github.io'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

def trim_profile_images(match):
    block = match.group(0)
    # Extract individual image paths
    images = re.findall(r'"(assets/member/[^"]+\.png)"', block)
    # Filter to only those that exist on disk
    existing = [img for img in images if os.path.exists(os.path.join(root, img))]
    # Keep max 3
    kept = existing[:3]
    removed = images[len(kept):]
    
    if removed:
        print(f"  Trimmed: kept {len(kept)}, removed {len(removed)} -> {removed}")
    
    if not kept:
        return block
    
    # Build new array content
    new_entries = ',\n            '.join(f'"{img}"' for img in kept)
    new_block = f'profileImages: [\n            {new_entries}\n        ]'
    
    # Replace the original profileImages block
    result = re.sub(
        r'profileImages:\s*\[[\s\S]*?\]',
        new_block,
        block,
        count=1
    )
    return result

# Find and replace all profileImages blocks
content_new = re.sub(
    r'profileImages:\s*\[[\s\S]*?\]',
    trim_profile_images,
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content_new)

print("Done! All profileImages arrays trimmed to max 3 existing files.")
