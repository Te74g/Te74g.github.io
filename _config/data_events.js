/*
 * ==========================================================================
 * 提携イベント一覧 (data_events.js)
 * ==========================================================================
 * 提携イベントを追加するときは、ここに { ... } のブロックを追加してください。
 * 
 * 【項目の説明】
 * id:       イベントのID（英数字）。URLの一部になります。
 * name:     イベント名
 * date:     開催日（例: "2026.02.15"）
 * organizer: 主催者名
 * organizerLogo: 主催者のアイコン画像（例: "assets/logo.png"）
 * headerTextColor: 主催者情報の文字色を強制指定（例: "white"）。背景画像で見づらい場合に使用。
 * image:    バナー画像の場所（例: "./assets/news/event_banner.png"）
 * poster:   イベント詳細ページ用のポスター画像。PCでは左側、スマホでは上部に大きく表示されます。
 * titleImage:      イベントタイトルのロゴ画像（テキストの代わりに表示）。max-width:300px。
 * titleImageDark:  ダークモード時に表示するタイトルロゴ画像（オプション）。
 * backgroundImage: イベント詳細ページの背景画像。画面全体に固定表示されます。
 * link:     詳細リンク（変更不要）
 * desc:     簡単な説明
 * content:  イベントの詳細本文（HTML）。
 * --------------------------------------------------------------------------
 */
window.partnerEventsData = [
    {
        id: "kitsunekotan",
        name: "休憩処 キツネコタン",
        date: "第1・3・5 木曜日<br>第2・4水曜日<br>22:00～23:00<br>※詳しくはXをご確認してください。",
        organizer: "あきあき",
        organizerLogo: "assets/partner_events/organizers/akiaki.png", // Moved to organizers folder
        headerTextColor: "white", // Option to force white text
        titleImage: "assets/partner_events/kitsunekotan/title_logo.png",
        image: "assets/partner_events/kitsunekotan/logo.png",
        link: "partner_events/event.html?id=kitsunekotan",
        desc: "休憩処 キツネコタンの提携ページです。",
        poster: "assets/partner_events/kitsunekotan/poster.png", // Moved to subfolder
        backgroundImage: "assets/partner_events/kitsunekotan/bg_floor.png", // Moved to subfolder
        images: [
            "assets/partner_events/kitsunekotan/group_00.png",
            "assets/partner_events/kitsunekotan/group_01.png",
            "assets/partner_events/kitsunekotan/group_02.png",
            "assets/partner_events/kitsunekotan/group_03.png",
            "assets/partner_events/kitsunekotan/group_04.png",
            "assets/partner_events/kitsunekotan/group_05.png"
        ],

        description: `
            <p>ここはきつねの住む休憩処。<br>
            くつろぎと団欒の空間。<br>
            <br>
            「コタン」とは、アイヌ語で「集落」や<br>
            「村落」を意味する言葉です。<br>
            <br>
            雑談交流をメインとしています。<br>
            <br>
            ゆったりとおしゃべりをしたり、<br>
            横になってくつろいだり、<br>
            ドリンクやお酒を飲んだり、<br>
            ダーツやクレーンゲームで遊んだり、<br>
            待ち時間の待機や待ち合わせなど、<br>
            様々な用途でご利用いただけます。<br>
            <br>
            また、おくつろげる服装をおすすめしております。<br>
            ごゆるりとした時間をお過ごしください。<br>
            <br>
            ＃Kitsunekotan_VRC
            </p>
        `,
        details: `
            <h3>イベント詳細</h3>
            <ul>
                <li>
                    主催者：
                    <img src="../assets/partner_events/organizers/akiaki.png" alt="あきあき" style="width: 28px; height: 28px; border-radius: 50%; vertical-align: middle; margin-right: 4px; object-fit: cover; border: 1px solid #ddd;">
                    あきあき
                </li>
                <li>日時：第1・3・5 木曜日、第2・4水曜日 22:00～23:00<br>※詳しくはXをご確認してください。</li>
                <li>場所：休憩処 キツネコタン Group＋インスタンス</li>
                <li>参加条件：グループKTNKTN.4638に参加</li>
            </ul>

            <div style="margin-top:20px; text-align:center; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                <a href="https://x.com/KitsunekotanVrc" class="btn btn--primary" target="_blank"
                    rel="noopener">公式情報(X)へ</a>
                <a href="https://vrc.group/KTNKTN.4638" class="btn btn--primary" target="_blank"
                    rel="noopener">グループ情報</a>
            </div>
        `
    },
    {
        id: "multi_image_test",
        name: "複数画像テスト(ポスター分離)",
        date: "2026.03.20",
        organizer: "テスト主催",
        titleImage: "assets/partner_events/kitsunekotan/title_logo.png", // Test Title Image
        titleImageDark: "assets/partner_events/kitsunekotan/title_logo.png", // Test Dark Mode Title Image (Optional)
        titleImageLight: "assets/partner_events/kitsunekotan/title_logo.png", // Explicit light mode title (optional if same as titleImage)
        poster: "assets/partner_events/kitsunekotan/logo.png", // New Poster Field (was logo)
        backgroundImage: "assets/partner_events/kitsunekotan/poster.png", // Test Background Image (was poster)
        images: [
            // "assets/partner_events/kitsunekotan.png", // Moved to poster
            "assets/partner_events/kitsunekotan/group_02.png"
        ],
        // No explicit link, should be generated automatically
        desc: "ポスターと画像を分離したレイアウトのテストです。",
        content: `
            <p>PCでは左にポスター、右に画像ギャラリー。<br>スマホでは上にポスター、下に画像ギャラリーが表示されます。</p>
        `
    }
];
