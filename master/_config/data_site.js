/*
 * ==========================================================================
 * サイト共通設定 - マスターサイト版 (data_site.js)
 * ==========================================================================
 * マスターサイト専用の設定です。全メンバーが表示されます。
 */

window.siteConfig = {
    // ローディング画面でランダムに表示されるメッセージ
    loadingMessages: [
        "Loading...[MASTER]",
        "Now Loading...[MASTER]",
        "Please wait...[MASTER]",
        "Connecting...[MASTER]",
        "AniameMoria [MASTER]"
    ],

    // 非表示アイテム(hidden: true)を表示するかどうか
    // Master環境ではtrue推奨
    showHiddenItems: true,

    // ヒーローセクションのロゴ下の副題（ランダム表示）
    heroSubtitle: [
        "ここは──動物たちが、人間に化けて情報収集をするカフェ。",
        "人間に化けた動物たちが、あなたの「情報」をお待ちしています。",
        "ようこそ。ここは接客を通じて人間界の情報を集める、秘密の場所。",
        "美味しい紅茶と引き換えに、少しだけあなたの世界の話を聞かせてください。",
        "本日も、人間になりすまして営業中。"
    ],

    // ヒーローセクションの画像設定
    heroImages: {
        character: "../assets_webp/opening/Tatie3.webp",
        logo: "../assets_webp/logo/aniamemoria_logo.webp",
        logoDark: "../assets_webp/opening/aniamemoria_logo_darktheme_shadow.webp",
        background: "../assets_webp/page/unei_low_res.webp"
    },

    // Aboutセクションの設定
    aboutSection: {
        title: "About",
        subTitle: "あにあめもりあとは？",
        text: [
            "ここは──動物たちが、人間に化けて情報収集をするカフェ。",
            "当イベントは、接客を通じて人間界の情報を集めるイベントです。",
            "個性豊かなキャストたちが、あなたのご来店を心待ちしております。"
        ],
        image: "../assets_webp/opening/Tatie3.webp"
    },

    // ローダーのロゴ設定
    loaderLogos: {
        opening: {
            light: "../assets_webp/logo/aniamemoria_logo.webp",
            dark: "../assets_webp/logo/aniamemoria_logo_darktheme.webp"
        },
        subpage: {
            light: "../assets_webp/logo/aniamemoria_logo.webp",
            dark: "../assets_webp/logo/aniamemoria_logo_darktheme.webp"
        }
    },

    // =======================================================
    // サイト運用制御 - マスターサイト設定
    // =======================================================

    // メンテナンスモード（マスターはfalseで固定）
    maintenanceMode: false,

    // キャスト表示制御 - 全メンバー表示
    castDisplay: {
        // 全メンバー表示フラグ（trueで全員表示）
        showAllMembers: true,

        // visibleMembersは使用されない（showAllMembersがtrueのため）
        visibleMembers: [],

        // 準備中表示は使用しない
        placeholderImage: "",
        preparingText: ""
    }
};
