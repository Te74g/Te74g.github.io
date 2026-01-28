/* 
 * ==========================================================================
 * キャスト・メンバー一覧 (data_members.js)
 * ==========================================================================
 * 新しい人を追加するときは、以下のように { ... } のブロックをコピーして追加してください。
 * 
 * 【項目の説明】
 * id:       他と被らない英数字（例: "ten", "rayno"）。システム内部で使います。
 * name:     表示される名前（例: "てん"）。
 * tagLabel: 写真の右下に表示される肩書き（例: "店長", "飼育"）。
 * tags:     検索用タグ。スペース区切りで複数書けます（例: "店長 キャスト 運営 妖怪"）。
 * image:    画像の場所（例: "./assets/member/てん/profile.png"）。
 * link:     プロフィールページの場所（例: "./member/profile.html?id=ten"）。
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
        link: "member/profile.html?id=ten",
        section: "運営部",
        goals: [
            "人間のお金を稼ぐこと",
            "人間のあらゆる文化を良く知ること",
            "あにあめもりあの成功",
        ],
        motifAnimal: "貂",
        motifIcon: "assets/member/てん/motif_animal_ten.png",
        sign: "assets/member/てん/testSign.png",
        introduction: `あにあめもりあの店長。<br>
元々野生の貂だったが、十三年前、二歳の頃ワルナスビを大量に喫食し、死亡。<br>
死してなお、知識欲で現世にしがみつき、妖怪となった。<br>
現在は人間の家で暮らしている。<br>
妖怪としてはかなりの若輩者で、俗物的。<br>
貂という動物の知名度が低いことを気にしている。<br>動物ː貂`,
        socials: [
            { type: "youtube", url: "https://www.youtube.com/@tanakamaikeru" },
            { type: "twitter", url: "https://x.com/tetenpuipui" },
            { type: "booth", url: "https://polygonlatency.booth.pm/" },
            { type: "other", url: "https://note.com/anyten" }
        ]
    },
    {
        id: "inumonekomosuki",
        name: "犬も猫も好き（副店長）",
        tagLabel: "副店長",
        tags: "運営 キャスト 飼育",
        image: "assets/member/犬も猫も好き/profile.png",
        link: "member/profile.html?id=inumonekomosuki",
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
        link: "member/profile.html?id=rayno",
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
        link: "member/profile.html?id=uruhunojon",
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
        link: "member/profile.html?id=amaou",
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
        link: "member/profile.html?id=hinekure",
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
        link: "member/profile.html?id=wikira",
        section: "スタッフ",
        introduction: "自己紹介がここに入ります。<br>未設定です。",
        socials: []
    }
];
