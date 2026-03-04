/*
 * ==========================================================================
 * ギャラリー一覧 (data_gallery.js)
 * ==========================================================================
 * ギャラリー（写真アルバム）を追加するときは、ここに { ... } のブロックを追加してください。
 * 
 * 【項目の説明】
 * title:    アルバムのタイトル
 * hidden:   true にすると本番環境で非表示になります（マスター環境では表示）。 (任意)
 * date:     日付（例: "2026.01.22"）
 * thumb:    一覧に表示するサムネイル画像（基本は images の1枚目を指定すると良いです）
 * images:   アルバムに含まれる画像のリスト。[ "画像パス1", "画像パス2", ... ] のように書きます。
 * desc:     簡単な説明
 * --------------------------------------------------------------------------
 */
window.galleryData = [
    // ▼▼▼ 以下はデザイン確認用ダミーデータです。本番前に削除してください ▼▼▼
    {
        title: "初めての集まり",
        date: "2025.08.11",
        thumb: "https://picsum.photos/seed/gallery-a1/600/600",
        images: [
            "https://picsum.photos/seed/gallery-a1/800/800",
            "https://picsum.photos/seed/gallery-a2/800/800",
            "https://picsum.photos/seed/gallery-a3/800/800",
            "https://picsum.photos/seed/gallery-a4/800/800",
            "https://picsum.photos/seed/gallery-a5/800/800",
            "https://picsum.photos/seed/gallery-a6/800/800",
        ],
        desc: "みんなで集まった、最初の記念日。",
    },
    {
        title: "夜のひととき",
        date: "2025.10.03",
        landscape: true,  // 横長写真アルバム（集合写真など）の例
        thumb: "https://picsum.photos/seed/gallery-b1/600/450",
        images: [
            "https://picsum.photos/seed/gallery-b1/1200/900",
            "https://picsum.photos/seed/gallery-b2/1200/900",
            "https://picsum.photos/seed/gallery-b3/1200/900",
        ],
        desc: "深夜の通話と、他愛のない話。",
    },
    {
        title: "冬の思い出",
        date: "2025.12.24",
        thumb: "https://picsum.photos/seed/gallery-c1/600/600",
        images: [
            "https://picsum.photos/seed/gallery-c1/800/800",
            "https://picsum.photos/seed/gallery-c2/800/800",
            "https://picsum.photos/seed/gallery-c3/800/800",
            "https://picsum.photos/seed/gallery-c4/800/800",
        ],
        desc: "雪みたいに静かで、あたたかい夜だった。",
    },
    {
        title: "春のはじまり",
        date: "2026.03.01",
        thumb: "https://picsum.photos/seed/gallery-d1/600/600",
        images: [
            "https://picsum.photos/seed/gallery-d1/800/800",
            "https://picsum.photos/seed/gallery-d2/800/800",
        ],
        desc: "新しい季節の、はじまりの記録。",
    },
    // ▲▲▲ ダミーデータここまで ▲▲▲
];
