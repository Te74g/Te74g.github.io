/*
 * ==========================================================================
 * サイト共通設定 (data_site.js)
 * ==========================================================================
 * サイト全体に関わるテキストや設定項目をここで管理します。
 */

window.siteConfig = {
    // ローディング画面でランダムに表示されるメッセージ
    loadingMessages: [
        "Loading...",
        "Now Loading...",
        "Please wait...",
        "Connecting...",
        "AniameMoria"
    ],

    // ヒーローセクションのロゴ下の副題（ランダム表示）
    heroSubtitle: [
        "ここは──動物たちが、人間に化けて情報収集をするカフェ。",
        "人間に化けた動物たちが、あなたの「情報」をお待ちしています。",
        "ようこそ。ここは接客を通じて人間界の情報を集める、秘密の場所。",
        "美味しい紅茶と引き換えに、少しだけあなたの世界の話を聞かせてください。",
        "本日も、人間になりすまして営業中。"
    ],

    // ヒーローセクションの画像設定（ここで画像パスを変更できます）
    heroImages: {
        character: "./assets/opening/Tatie3.png", // 立ち絵
        logo: "./assets/logo/aniamemoria_logo.png", // ロゴ（ライトモード）
        logoDark: "./assets/opening/aniamemoria_logo_darktheme_shadow.png", // ロゴ（ダークモード）
        background: "./assets/page/unei_low_res.png" // 背景画像
    },

    // Aboutセクションの設定
    aboutSection: {
        title: "About", // セクションタイトル（英語）
        subTitle: "あにあめもりあとは？", // セクションタイトル（日本語）
        text: [
            "ここは──動物たちが、人間に化けて情報収集をするカフェ。",
            "当イベントは、接客を通じて人間界の情報を集めるイベントです。",
            "個性豊かなキャストたちが、あなたのご来店を心待ちしております。"
        ],
        image: "./assets/opening/Tatie3.png" // Aboutセクションの画像
    }
};
