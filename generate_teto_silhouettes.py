import os
from PIL import Image

def create_gradient_silhouette(input_path, output_path):
    try:
        img = Image.open(input_path).convert('RGBA')
        width, height = img.size
        
        bbox = img.getbbox()
        if bbox is None:
            img.save(output_path)
            return
            
        min_x, min_y, max_x, max_y = bbox
        char_height = max_y - min_y
        
        gradient_length = int(char_height * 0.35)
        gradient_end_y = min_y + gradient_length
        start_alpha = 130
        
        final_img = Image.new('RGBA', img.size)
        orig_pixels = img.load()
        final_pixels = final_img.load()
        
        for y in range(height):
            if y <= min_y:
                black_alpha = start_alpha
            elif y < gradient_end_y:
                progress = (y - min_y) / gradient_length
                black_alpha = start_alpha + (255 - start_alpha) * progress
            else:
                black_alpha = 255
            
            ratio = black_alpha / 255.0
            inv_ratio = 1.0 - ratio
            
            for x in range(width):
                r, g, b, a = orig_pixels[x, y]
                if a == 0:
                    final_pixels[x, y] = (0, 0, 0, 0)
                else:
                    new_r = int(r * inv_ratio)
                    new_g = int(g * inv_ratio)
                    new_b = int(b * inv_ratio)
                    final_pixels[x, y] = (new_r, new_g, new_b, a)
                    
        final_img.save(output_path)
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

folder = r"c:\Users\user\Desktop\unti\Te74g.github.io\assets\member\てと"
for filename in ["profile1.webp", "profile2.webp", "profile3.webp"]:
    in_path = os.path.join(folder, filename)
    out_path = os.path.join(folder, filename.replace('.webp', '_silhouette.webp'))
    if os.path.exists(in_path):
        print(f"Generating silhouette for {filename}...")
        create_gradient_silhouette(in_path, out_path)
        print(f"Done for {filename}")
