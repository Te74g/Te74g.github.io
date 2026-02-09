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
        character: "./assets_webp/opening/Tatie3.webp", // 立ち絵
        logo: "./assets_webp/logo/aniamemoria_logo.webp", // ロゴ（ライトモード）
        logoDark: "./assets_webp/opening/aniamemoria_logo_darktheme_shadow.webp", // ロゴ（ダークモード）
        background: "./assets_webp/page/unei_low_res.webp" // 背景画像
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
        image: "./assets_webp/opening/Tatie3.webp" // Aboutセクションの画像
    },

    // ローダーのロゴ設定
    loaderLogos: {
        // オープニングページ用ローダー
        opening: {
            light: "./assets_webp/logo/aniamemoria_logo.webp",
            dark: "./assets_webp/logo/aniamemoria_logo_darktheme.webp"
        },
        // サブページ用ローダー
        subpage: {
            light: "./assets_webp/logo/aniamemoria_logo.webp",
            dark: "./assets_webp/logo/aniamemoria_logo_darktheme.webp"
        }
    },

    // =======================================================
    // サイト運用制御
    // =======================================================

    // メンテナンスモード（true: 全ページをメンテナンスページにリダイレクト）
    // ※ master/ ディレクトリはリダイレクト対象外
    maintenanceMode: true,

    // キャスト表示制御
    castDisplay: {
        // 全メンバー表示フラグ（trueなら全員表示、falseならvisibleMembersで制御）
        showAllMembers: false,

        // 表示許可するメンバーIDのリスト
        // ※ 運営部・スタッフは常に表示されます
        // ※ 準備ができたメンバーのIDをここに追加してください
        visibleMembers: [
            "ten",      // 店長（運営部）
            "momo",     // 副店長（運営部）
            "rayno"     // レイノ（飼育区画）
            // 準備ができたら以下のようにIDを追加:
            // "rei",
            // "faria",
            // "nagi",
            // ...
        ],

        // === revealLevel 用画像設定 ===
        // revealLevel: 1（Coming Soon）のときの共通画像
        comingSoonImage: "assets/member/silhouette.png",

        // revealLevel: 1 のときの表示名
        comingSoonName: "???",

        // 準備中メンバーに表示するシルエット画像（revealLevel: 2 用のフォールバック）
        placeholderImage: "assets/member/silhouette.png",

        // 準備中テキスト
        preparingText: "準備中"
    }
};
