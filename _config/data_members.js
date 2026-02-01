/* 
 * ==========================================================================
 * キャスト・メンバー一覧 (data_members.js)
 * ==========================================================================
 * 新しい人を追加するときは、以下のように { ... } のブロックをコピーして追加してください。
 * 
 * 【項目の説明】
 * id:       他と被らない英数字（例: "ten", "rayno"）。システム内部で使います。
 * name:     プロフィールページで表示される名前（例: "てん（店長）"）。
 * pickupName: 一覧（ランダムピックアップ、キャスト紹介）で表示される名前（例: "てん"）。省略時は name が使われます。 (任意)
 * tagLabel: 写真の右下に表示される肩書き（例: "店長", "飼育"）。
 * tags:     検索用タグ。スペース区切りで複数書けます（例: "店長 キャスト 運営 妖怪"）。
 * image:    画像の場所（例: "./assets/member/てん/profile.png"）。
 * link:     プロフィールページの場所（例: "./member/profile.html?id=ten"）。
 * section:  所属する区画（セクション）。以下のいずれかを指定してください。
 *           "運営部", "飼育区画", "野生区画", "妖怪区画", "スタッフ"
 * introduction: 自己紹介文（HTMLタグ使用可）。改行は <br> を使ってください。 (任意)
 *               ※ " (ダブルクォーテーション) で囲むと1行で書く必要があります。
 *               ※ ` (バッククォート) で囲むと改行を含めて書くことができます（見やすくなります）。
 * socials:  SNSリンクのリスト。 { type: "youtube|twitter|booth|facebook|vrchat|other", url: "..." } (任意)
 * related:  関連キャストのIDリスト。固定で表示したいメンバーのIDを指定します（例: ["ten", "momo"]）。指定がない場合や5人に満たない場合は自動で選ばれます。(任意)
 * --------------------------------------------------------------------------
 */
window.membersData = [
    // --- 運営部 ---
    {
        id: "ten",
        name: "てん（店長）",
        pickupName: "てん",
        tagLabel: "店長",
        tags: "店長 運営 キャスト 妖怪",
        image: "assets/member/てん/profile.png",
        profileImages: [
            "assets/member/てん/profile1.png",
            "assets/member/てん/profile2.png",
            "assets/member/てん/profile3.png"
        ],

        section: "運営部",
        goals: [
            "人間のお金を稼ぐこと",
            "人間のあらゆる文化を良く知ること",
            "あにあめもりあの成功",
        ],
        motifAnimal: "貂",
        motifIcon: "assets/member/てん/motif_animal_ten.png",
        sign: "assets/member/てん/ten_sign.png",
        introduction: `あにあめもりあの店長。<br>
        元々野生の貂だったが、十三年前、二歳の頃ワルナスビを大量に喫食し、死亡。<br>
        死してなお、知識欲で現世にしがみつき、妖怪となった。<br>
        現在は人間の家で暮らしている。<br>
        妖怪としてはかなりの若輩者で、俗物的。<br>
        貂という動物の知名度が低いことを気にしている。`,
        socials: [
            { type: "youtube", url: "https://www.youtube.com/@tanakamaikeru" },
            { type: "twitter", url: "https://x.com/tetenpuipui" },
            { type: "booth", url: "https://polygonlatency.booth.pm/" },
            { type: "note", url: "https://note.com/anyten" }
        ],
        related: ["momo", "ray"],
    },
    {
        id: "momo",
        name: "もも（副店長）",
        pickupName: "もも",
        tagLabel: "副店長",
        tags: "運営 キャスト 飼育",
        image: "assets/member/もも/profile2.png",
        profileImages: [
            "assets/member/もも/profile1.png",
            "assets/member/もも/profile2.png",
            "assets/member/もも/profile3.png"
        ],
        section: "運営部",
        goals: [
            "デカい猫の作った本やスタンプを広めて、外で暮らす仲間たちのご飯を豪華にすること",
        ],
        motifAnimal: "猫",
        motifIcon: "assets/member/もも/motif_animal_neko.png",
        introduction: `あにあめもりあの副店長。<br>
        元々は厳しい外の世界を生き抜いてきた野良猫だったが、現在は温かな家で暮らす飼い猫。<br>
        同居している人間の男性を「餌をくれるデカい猫」だと本気で信じている。<br><br>
        飼い主の「ももと話してみたい」という願いを聞き届けた店長から能力を授かり、情報収集を手伝うことになった。<br>
        現在は、飼い主から託された「本とLINEスタンプの宣伝」という任務も遂行中。売上が動物保護活動に使われると知り、「外」を知る身として「まぁ、悪くない」と承諾している。<br><br>
        猫基準の価値観で生きているため、人間の常識には疎く、うんちの話などを臆することなく話す。`,
        socials: [
            { type: "twitter", url: "https://x.com/necomoinumosuki" },
            { type: "kindle", url: "https://www.amazon.co.jp/stores/author/B0FCCMNWNL" },
        ],
        related: ["ten", "ray"]
    },

    // --- 飼育区画 ---
    {
        id: "ray",
        name: "れい",
        tagLabel: "飼育",
        tags: "運営 キャスト 飼育",
        profileImages: [
            "assets/member/れい/profile1.png",
            "assets/member/れい/profile2.png",
            "assets/member/れい/profile3.png"
        ],

        section: "飼育区画",
        goals: [
            "人間からたくさんの情報をもらうこと～",
            "飼い主の作ったショップを広めること～",
            "仲間と幸せな暮らしができるようにすること～"
        ],
        motifAnimal: "猫",
        motifIcon: "assets/member/れい/motif_animal_neko2.png",
        introduction: `元々は飼い猫だったが、大好きな飼い主の言葉を理解したい一心で、店長に直談判。<br>
        その愛くるしいフォルムと声を認められ、あにあめもりあの一員として迎え入れられた。<br><br>
        当初の目的は飼い主との意思疎通だったはずが、最近では採用してくれた店長への忠誠心と愛が爆発。<br>
        「店長のためなら！」と奔走しているうちに、いつの間にかプログラミングスキルやモデリングスキルまで習得してしまったという努力家。<br>
        現在は飼い主よりも店長に夢中らしいが、そのひたむきな働きぶりは仲間内でも一目置かれている。`,
        socials: [
            { type: "twitter", url: "https://x.com/Ray_9618_VRC" },
            { type: "twitter", url: "https://x.com/Ray_9618_2" },
            { type: "twitter", url: "https://x.com/PoriRayTen" },
            { type: "youtube", url: "https://www.youtube.com/@ray_9618" },
            { type: "note", url: "https://note.com/ray_9618" },
            { type: "booth", url: "https://ray9618.booth.pm/" },
            { type: "booth", url: "https://polygonlatency.booth.pm/" }
        ],
        related: ["ten", "momo"]
    },
    // --- 野生区画 ---
    {
        id: "uruhunojon",
        name: "ウルフのジョン",
        tagLabel: "野生",
        tags: "キャスト 野生",
        image: "assets/member/ウルフのジョン/profile.png",

        section: "野生区画",
        introduction: "野生区画のウルフのジョンです。ワイルドに盛り上げます。",
        socials: []
    },

    // --- 妖怪区画 ---
    {
        id: "kanibasiri",
        name: "蟹走 椛",
        tagLabel: "妖怪",
        tags: "キャスト 妖怪",
        image: "assets/member/蟹走 椛/profile1.png",

        section: "妖怪区画",
        introduction: `横歩きで世を渡り歩く、あにあめもりあのはぐれ妖怪、蟹走椛（カニバシリ モミジ）だカニ。<br>
        ハサミで切れない縁はない…なんて嘘嘘！<br>
        仲良くしてくれないとチョッキンしちゃうぞ〜V`,
        socials: [] // 架空のため空
    },

    // --- スタッフ ---
    {
        id: "hinekure",
        name: "hinekure",
        tagLabel: "スタッフ",
        tags: "スタッフ",
        motifAnimal: "ヒト",
        motifIcon: "assets/member/ひねくれ/motif_animal_hito.png",
        image: "assets/member/ひねくれ/profile.png",

        section: "スタッフ",
        goals: [
            "動物達の楽園を築くこと",
        ],
        introduction: `唯一の人間スタッフ。<br>
        店長とは長い付き合いで、とても信用されている。<br>
        名前とは裏腹に真っすぐで思いやりがある性格で、動物達の保護がおしごと。<br>
        瞬間記憶能力を持っており、あらゆる特徴を把握する事が出来る。<br>
        誠実な姿勢から尊敬されており、普段は親しみを込めて飼育員さん、人間さんと呼ばれている。<br>
        目立たないポジションだけど、誇りを持って重大なお仕事に取り組んでいる立派な人。<br>
        店長からは「夜行性のひねくれ」と呼ばれているが、一体……？`,
        socials: [
            { type: "twitter", url: "https://x.com/https://x.com/hinekure_vrc" },
        ]
    },
    {
        id: "wikira",
        name: "Wikira",
        tagLabel: "スタッフ",
        tags: "スタッフ",
        image: "assets/member/Wikira/profile1.png",

        section: "スタッフ",
        motifAnimal: "ロボット",
        motifIcon: "assets/member/Wikira/motif_animal_robot.png",
        goals: [
            "人間っぽくなりたい",
        ],
        introduction: `デザイン担当<br>
        自我の芽生えたただのロボ`,
        socials: [
            { type: "twitter", url: "https://x.com/lllWikiralll" },
        ]
    }
];
