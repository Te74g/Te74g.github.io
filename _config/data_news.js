/*
 * ==========================================================================
 * ニュース一覧 (data_news.js)
 * ==========================================================================
 * 新しいニュースを追加するときは、一番上に { ... } のブロックを複製して編集してください（新しい順）。
 * 
 * 【項目の説明】
 * id:       ニュースのID（英数字）。URLの一部になります。
 * hidden:   true にすると本番環境で非表示になります（マスター環境では表示）。 (任意)
 * title:    ニュースのタイトル。
 * date:     日付（例: "2026.01.20"）。
 * category: カテゴリ（例: "お知らせ"）。
 * image:    サムネイル画像の場所（将来的な拡張用）。
 * imagePath: サムネイル画像のパス（assets/news/...）。
 * desc:     （一覧ページ用）簡単な説明文。
 * content:  記事の本文（HTML）。
 * --------------------------------------------------------------------------
 */
window.newsData = [
    // ニュースが追加されたらここに { ... } ブロックを追加してください

    {
        id: "grand_open_20260308",
        hidden: false,
        title: "人間さん、ようこそ「あにあめもりあ」へ！",
        date: "2026.03.08",
        category: "お知らせ",
        image: "assets/news/2026-03-08/grand_open.png",
        imagePath: "assets/news/2026-03-08/grand_open.png",
        desc: "本日3月8日 18:00、「あにあめもりあ」公式サイトを公開いたしました！",
        content: `
            <p>人間さん、ようこそ「あにあめもりあ」へ！<br>
            本日3月8日 18:00、「あにあめもりあ」公式サイトを公開いたしました！</p>
            
            <p>このサイトでは、最新情報やイベントのお知らせ、ささやかなプレゼントをお届けしていく予定です！<br>
            気が向いたときに、ふらりと遊びにきていただけたら嬉しいですっ！</p>
            
            <p>現在公開中の<a href="./pages/people.html">キャスト紹介ページ</a>では、動物・妖怪・スタッフたちのプロフィールをご覧いただけます！<br>
            まだ公開されていないキャストも、今後順次ご紹介していく予定です✨<br>
            シルエットからどんな動物かなど、たくさん想像していただいて、是非毎日の答え合わせをお楽しみください！</p>
            
            <p>また、最新のお知らせなどは、公式X（旧Twitter）でも発信していきます。<br>
            気になったら、ぜひフォローしてみてください！</p>
            
            <p>Vrchatのグループもご参加いただければ幸いです✨</p>
            
            <p style="text-align: center; margin-top: 2em; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                <a href="https://x.com/ANIAMEMORIA" target="_blank" class="btn btn--primary">公式Xをフォローする</a>
                <a href="https://vrchat.com/home/group/grp_6d3e7179-6353-4e8b-9f78-c9a2430bfa06" target="_blank" class="btn btn--ghost">VRChatグループに参加</a>
            </p>
            
            <p style="text-align: center; margin-top: 24px; font-weight: bold; font-size: 0.95em;">
                👇 サイトのブックマークはこちら 👇<br>
                <a href="https://te74g.github.io/Te74g.github.io/" target="_blank" style="word-break: break-all;">https://te74g.github.io/Te74g.github.io/</a>
            </p>
        `
    },

];
