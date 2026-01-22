/* 
 * ==========================================================================
 * データ管理ファイル (data.js)
 * ここにあるデータを編集するだけで、ホームページの「キャスト紹介」や「ニュース」が更新されます。
 * プログラミングの知識がなくても大丈夫です！
 * ==========================================================================
 */

/*
 * --------------------------------------------------------------------------
 * ■ キャスト・メンバー一覧 (membersData)
 * --------------------------------------------------------------------------
 * 新しい人を追加するときは、以下のように { ... } のブロックをコピーして追加してください。
 * 
 * 【項目の説明】
 * id:       他と被らない英数字（例: "ten", "rayno"）。システム内部で使います。
 * name:     表示される名前（例: "てん"）。
 * tagLabel: 写真の右下に表示される肩書き（例: "店長", "飼育"）。
 * tags:     検索用タグ。スペース区切りで複数書けます（例: "店長 キャスト 運営 妖怪"）。
 * image:    画像の場所（例: "./assets/member/てん/profile.png"）。
 * link:     プロフィールページの場所（例: "./member/profile_ten.html"）。
 * section:  所属する区画（セクション）。以下のいずれかを指定してください。
 *           "運営部", "飼育区画", "野生区画", "妖怪区画", "スタッフ"
 * introduction: 自己紹介文（HTMLタグ使用可）。改行は <br> を使ってください。 (任意)
 * socials:  SNSリンクのリスト。 { type: "youtube|twitter|booth|facebook|vrchat|other", url: "..." } (任意)
 * --------------------------------------------------------------------------
 */
const membersData = [
    // --- 運営部 ---
    {
        id: "ten",
        name: "てん（店長）",
        tagLabel: "店長",
        tags: "店長 キャスト 運営 妖怪",
        image: "assets/member/てん/profile.png",
        profileImages: [
            "assets/member/てん/profile1.png",
            "assets/member/てん/profile2.png",
            "assets/member/てん/profile3.png"
        ],
        link: "member/profile_ten.html",
        section: "運営部",
        goals: [
            "一年の抱負はこのように",
        ],
        sign: "assets/member/てん/testSign.png",
        introduction: `あにあめもりあの店長。<br>
元々野生の貂だったが、十三年前、二歳の頃ワルナスビを大量に喫食し、死亡。<br>
死してなお、知識欲で現世にしがみつき、妖怪となった。<br>
現在は人間の家で暮らしている。<br>
妖怪としてはかなりの若輩者で、俗物的。<br>
貂という動物の知名度が低いことを気にしている。<br>動物ː貂`,
        socials: [
            { type: "youtube", url: "https://youtube.com/@example" },
            { type: "twitter", url: "https://twitter.com/example" },
            { type: "booth", url: "https://booth.pm/example" },
            { type: "facebook", url: "https://facebook.com/example" },
            { type: "vrchat", url: "https://vrchat.com/home/user/example" },
            { type: "other", url: "https://example.com" }
        ]
    },
    {
        id: "inumonekomosuki",
        name: "犬も猫も好き（副店長）",
        tagLabel: "副店長",
        tags: "運営 キャスト 飼育",
        image: "assets/member/犬も猫も好き/profile.png",
        link: "member/profile_inumonekomosuki.html",
        section: "運営部",
        introduction: "自己紹介がここに入ります。<br>未設定です。",
        socials: []
    },

    // --- 飼育区画 ---
    {
        id: "rayno",
        name: "レイノ",
        tagLabel: "飼育",
        tags: "キャスト スタッフ 飼育",
        image: "assets/member/レイノ/profile.png",
        link: "member/profile_rayno.html",
        section: "飼育区画",
        introduction: "自己紹介がここに入ります。<br>未設定です。",
        socials: []
    },

    // --- 野生区画 ---
    {
        id: "uruhunojon",
        name: "ウルフのジョン",
        tagLabel: "野生",
        tags: "キャスト 野生",
        image: "assets/member/ウルフのジョン/profile.png",
        link: "member/profile_uruhunojon.html",
        section: "野生区画",
        introduction: "自己紹介がここに入ります。<br>未設定です。",
        socials: []
    },

    // --- 妖怪区画 ---
    {
        id: "amaou",
        name: "あまおう",
        tagLabel: "妖怪",
        tags: "キャスト スタッフ 妖怪",
        image: "assets/member/あまおう/profile.png",
        link: "member/profile_amaou.html",
        section: "妖怪区画",
        introduction: "自己紹介がここに入ります。<br>未設定です。",
        socials: []
    },

    // --- スタッフ ---
    {
        id: "hinekure",
        name: "ひねくれ",
        tagLabel: "スタッフ",
        tags: "スタッフ",
        image: "assets/member/ひねくれ/profile.png",
        link: "member/profile_hinekure.html",
        section: "スタッフ",
        introduction: "自己紹介がここに入ります。<br>未設定です。",
        socials: []
    },
    {
        id: "wikira",
        name: "Wikira",
        tagLabel: "スタッフ",
        tags: "スタッフ",
        image: "assets/member/Wikira/profile.png",
        link: "member/profile_wikira.html",
        section: "スタッフ",
        introduction: "自己紹介がここに入ります。<br>未設定です。",
        socials: []
    }

    /* 
     * ↓ 追加したい場合は、下のコメントアウトをコピーして複製してから編集してください。
     */
    // {
    //     id: "new_member",
    //     name: "新しい人",
    //     tagLabel: "新人",
    //     tags: "キャスト 新人",
    //     image: "assets/member/nofImage.png",
    //     link: "member/profile_new.html",
    //     section: "野生区画"
    // },
];


/*
 * --------------------------------------------------------------------------
 * ■ ニュース一覧 (newsData)
 * --------------------------------------------------------------------------
 * 新しいニュースを追加するときは、一番上に { ... } のブロックを複製して編集してください（新しい順）。
 * 
 * 【項目の説明】
 * title:    ニュースのタイトル。
 * date:     日付（例: "2026.01.20"）。
 * category: カテゴリ（例: "お知らせ"）。
 * image:    サムネイル画像の場所。
 * link:     記事ページの場所。
 * desc:     （一覧ページ用）簡単な説明文。
 * --------------------------------------------------------------------------
 */
const newsData = [
    {
        title: "ホームページを改装しました",
        date: "2026.01.20",
        category: "お知らせ",
        image: "../assets/news/2026-01-20/test2026-01-20.png",
        // トップページ等で使う場合はパスに注意が必要ですが、自動調整機能を入れるか、絶対パス風にする手もあります。一旦相対パスで管理します。
        // ※ 注意: このファイルの場所(ルート)からの相対パス、または各HTMLからの相対パスになります。
        // 今回の仕組みでは、HTML側でパスを補正する処理を入れるため、
        // 「assets/news/...」 のように「ルート(一番上)からのパス」で書くとトラブルが少ないです。
        // 下記のように書けば、どのページからでも表示できるように調整します。
        imagePath: "assets/news/2026-01-20/test2026-01-20.png",
        linkPath: "news/news_20260120.html",
        desc: "公式サイトのデザインを大幅にリニューアルいたしました。より見やすく、魅力的なサイトを目指して改修を行いました。"
    },
    {
        title: "ダミーニュース4",
        date: "2026.01.20",
        category: "お知らせ",
        imagePath: "assets/news/2026-01-20/test2026-01-20.png",
        linkPath: "news/news_dummy4.html",
        desc: "これはダミーニュース4の本文です。テスト表示用です。"
    },
    {
        title: "ダミーニュース3",
        date: "2026.01.20",
        category: "お知らせ",
        imagePath: "assets/news/2026-01-20/test2026-01-20.png",
        linkPath: "news/news_dummy3.html",
        desc: "これはダミーニュース3の本文です。テスト表示用です。"
    },
    {
        title: "ダミーニュース2",
        date: "2026.01.20",
        category: "お知らせ",
        imagePath: "assets/news/2026-01-20/test2026-01-20.png",
        linkPath: "news/news_dummy2.html",
        desc: "これはダミーニュース2の本文です。テスト表示用です。"
    },
    {
        title: "ダミーニュース1",
        date: "2026.01.20",
        category: "お知らせ",
        imagePath: "assets/news/2026-01-20/test2026-01-20.png",
        linkPath: "news/news_dummy1.html",
        desc: "これはダミーニュース1の本文です。テスト表示用です。"
    }
];


/*
 * --------------------------------------------------------------------------
 * ■ 提携イベント一覧 (partnerEventsData)
 * --------------------------------------------------------------------------
 * 提携イベントを追加するときは、ここに { ... } のブロックを追加してください。
 * 
 * 【項目の説明】
 * name:     イベント名
 * date:     開催日（例: "2026.02.15"）
 * organizer: 主催者名
 * image:    バナー画像の場所（例: "./assets/news/event_banner.png"）
 * link:     詳しく見るためのリンク（Xの告知ポストや外部サイトなど）
 * desc:     簡単な説明
 * --------------------------------------------------------------------------
 */
const partnerEventsData = [
    {
        name: "第1回 提携イベント",
        date: "2026.XX.XX",
        organizer: "てんちゃん",
        image: "assets/partner_events/event_Test2026-01-22.png", // 仮の画像
        link: "partner_events/event_01.html", // 詳細ページへリンク
        desc: "第1回 提携イベントの詳細ページを作成しました。こちらから詳細を確認できます。"
    }
];


/*
 * --------------------------------------------------------------------------
 * ■ ギャラリー一覧 (galleryData)
 * --------------------------------------------------------------------------
 * ギャラリー（写真アルバム）を追加するときは、ここに { ... } のブロックを追加してください。
 * 
 * 【項目の説明】
 * title:    アルバムのタイトル
 * date:     日付（例: "2026.01.22"）
 * thumb:    一覧に表示するサムネイル画像（基本は images の1枚目を指定すると良いです）
 * images:   アルバムに含まれる画像のリスト。[ "画像パス1", "画像パス2", ... ] のように書きます。
 * desc:     簡単な説明
 * --------------------------------------------------------------------------
 */
const galleryData = [
    {
        title: "テストギャラリー 2026-01-22",
        date: "2026.01.22",
        thumb: "assets/gallery/2026-01-22/2026-01-22_test1.png",
        images: [
            "assets/gallery/2026-01-22/2026-01-22_test1.png",
            "assets/gallery/2026-01-22/2026-01-22_test2.png",
            "assets/gallery/2026-01-22/2026-01-22_test3.png",
            "assets/gallery/2026-01-22/2026-01-22_test4.png"
        ],
        desc: "テスト用のギャラリー画像です。"
    }
];


/*
 * --------------------------------------------------------------------------
 * ■ 関連リンク一覧 (linksData)
 * --------------------------------------------------------------------------
 * 関連リンクを追加するときは、ここに { ... } のブロックを追加してください。
 * 
 * 【項目の説明】
 * title:    サイト名・リンク名
 * url:      リンク先のURL
 * desc:     簡単な説明
 * --------------------------------------------------------------------------
 */
const linksData = [
    {
        title: "あにあめもりあ 公式X",
        url: "https://x.com/ANIAMEMORIA",
        desc: "あにあめもりあの最新情報をお届けする公式X(旧Twitter)です。"
    },
    {
        title: "あにあめもりあ 公式VRChatグループ",
        url: "https://vrchat.com/home/group/grp_6d3e7179-6353-4e8b-9f78-c9a2430bfa06",
        desc: "あにあめもりあ 公式VRChatグループです。"
    }
];
