import os

member_dir = r"c:\Users\user\Desktop\unti\Te74g.github.io\assets\member"

deleted_count = 0

for char_folder in os.listdir(member_dir):
    char_path = os.path.join(member_dir, char_folder)
    if not os.path.isdir(char_path):
        continue
        
    # Get all original image files (not silhouettes)
    files = [f for f in os.listdir(char_path) if f.endswith('.png') and '_silhouette' not in f]
    
    if len(files) > 3:
        print(f"[{char_folder}] has {len(files)} images. Cleaning up...")
        # Sort files so profile.png < profile1.png < profile2.png etc.
        files.sort()
        
        # Keep the first 3, delete the rest
        keep_files = files[:3]
        delete_files = files[3:]
        
        print(f"  Keeping: {keep_files}")
        print(f"  Deleting: {delete_files}")
        
        for f in delete_files:
            orig_path = os.path.join(char_path, f)
            sil_name = f.replace('.png', '_silhouette.png')
            sil_path = os.path.join(char_path, sil_name)
            
            # Delete original
            if os.path.exists(orig_path):
                os.remove(orig_path)
                deleted_count += 1
            
            # Delete silhouette
            if os.path.exists(sil_path):
                os.remove(sil_path)

print(f"\nTotal excess original images deleted (along with their silhouettes): {deleted_count}")
