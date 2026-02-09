import os
from pathlib import Path
from rembg import remove
from PIL import Image

def generate_member_silhouettes(base_dir):
    # assets/member フォルダのパスを取得
    root_path = Path(base_dir)
    
    if not root_path.exists():
        print(f"エラー: ディレクトリが見つかりません: {base_dir}")
        return

    # 各メンバーのフォルダをループ
    for member_dir in root_path.iterdir():
        if not member_dir.is_dir():
            continue
        
        print(f"メンバー処理中: {member_dir.name}")

        # profile1.png, profile2.png ... などのファイルを探す
        # アルファベット順で最初に見つかった1枚だけを対象にする
        profile_images = sorted(list(member_dir.glob("profile*.png")))

        if not profile_images:
            print(f"  -> profile画像が見つかりません。スキップします。")
            continue

        target_img_path = profile_images[0]
        output_path = member_dir / "silhouette.png"

        print(f"  -> {target_img_path.name} を元にシルエットを作成中...")

        try:
            # 1. 画像読み込み
            input_image = Image.open(target_img_path).convert("RGBA")

            # 2. 背景削除
            no_bg_image = remove(input_image)

            # 3. シルエット化（アルファチャンネルをマスクとして使用）
            mask = no_bg_image.split()[-1]
            
            # 透明背景の真っ黒な画像を作成
            silhouette = Image.new("RGBA", input_image.size, (0, 0, 0, 0))
            black_fill = Image.new("RGBA", input_image.size, "black")
            silhouette.paste(black_fill, (0, 0), mask=mask)

            # 4. 保存 (silhouette.png)
            silhouette.save(output_path)
            print(f"  -> 成功: {output_path}")

        except Exception as e:
            print(f"  -> エラー発生 ({member_dir.name}): {e}")

if __name__ == "__main__":
    # 実行するディレクトリを指定（スクリプトと同じ場所にassetsがある前提）
    # 必要に応じて絶対パスに変更してください
    target_directory = "./assets/member"
    generate_member_silhouettes(target_directory)