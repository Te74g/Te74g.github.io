import os
from PIL import Image

folder = r"c:\Users\user\Desktop\unti\Te74g.github.io\assets\member\てと"
max_size = 800

for filename in ["profile1.png", "profile2.png", "profile3.png"]:
    filepath = os.path.join(folder, filename)
    if os.path.exists(filepath):
        print(f"Resizing {filename}...")
        try:
            with Image.open(filepath) as img:
                img.thumbnail((max_size, max_size), Image.LANCZOS)
                img.save(filepath, optimize=True)
                print(f"Saved {filename}")
        except Exception as e:
            print(f"Error filtering {filename}: {e}")
