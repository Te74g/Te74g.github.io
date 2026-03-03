/**
 * pagename.js
 * TODO: ファイル名・ページ名・依存データを更新
 * Depends on: utils.js, data_xxx.js
 *
 * ═══════════════════════════════════════════════════════
 * 利用可能なグローバルユーティリティ（utils.js が提供）
 * ═══════════════════════════════════════════════════════
 *
 * window.fixPath(path)
 *   画像パスをmanifest経由で解決して返す。
 *   assets/ 以下の画像は必ずこれを通すこと（キャッシュバスティング対応）。
 *   例: window.fixPath('../assets/img/foo.png')
 *   ※ manifest 待機 (await window.manifestPromise) が終わってから呼ぶこと。
 *
 * window.shouldShowItem(item)
 *   item.master === true のものは master モード時のみ表示。
 *   公開ページで非表示にするデータのフィルタリングに使う。
 *   例: data.filter(item => window.shouldShowItem(item))
 *
 * window.getPinClass(tags)
 *   タグ文字列からカードのピンクラス（'pin-gold' 等）を返す。
 *
 * window.getMemberBackground(tags)
 *   タグに応じたカード背景画像パスを返す（なければ null）。
 *
 * window.getMemberFrame(tags)
 *   タグに応じたカードフレーム画像パスを返す（なければ null）。
 *
 * window.getMemberDisplayInfo(member)
 *   { level: 0-3, imagePath: string[] } を返す。
 *   level 0=非表示, 1=ComingSoon, 2=シルエット, 3=完全公開。
 *
 * window.isMemberVisible(member, castConfig)
 *   window.siteConfig.castDisplay に基づく旧式表示判定（互換用）。
 *
 * ═══════════════════════════════════════════════════════
 * manifest 待機について
 * ═══════════════════════════════════════════════════════
 * window.manifestPromise は assets/ のファイルハッシュマップが
 * 解決されるまで待つ Promise。fixPath() を使う場合は必ず await すること。
 * 外部URLのみ扱う等で fixPath() を使わない場合は await を省略してもよい。
 *
 * ═══════════════════════════════════════════════════════
 * データグローバル一覧
 * ═══════════════════════════════════════════════════════
 * window.membersData   キャスト配列 (data_members.js)
 *   ├ tags フィールド: 書く順番がビジュアル優先順位（背景/フレーム/ピン色）。
 *   │   優先: 運営 > 妖怪 > 飼育 > 野生 > スタッフ。先にある方が採用される。
 *   ├ section フィールド: 絞り込みフィルターの区画を決定（tags ではなく DOM 包含で判定）。
 *   └ related フィールド: 固定ID優先（最大5件）、不足分を自動補完。
 *       自動補完スコア: 同section +100、タグ重複数 ×10。revealLevel ≥ 3 のみ対象。
 * window.newsData      お知らせ配列 (data_news.js)
 * window.eventsData    イベント配列 (data_events.js)
 * window.galleryData   ギャラリー配列 (data_gallery.js)
 * window.linksData     関連リンク配列 (data_links.js)
 * window.siteConfig    サイト設定オブジェクト (data_site.js)
 *   └ .castDisplay     キャスト表示設定 (showAllMembers, visibleMembers 等)
 */
(async function () {
    // manifest 待機（画像パス解決に必要）
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    // ---- 設定定数 ----
    const STAGGER_MS = 50;   // カード間アニメーション遅延（ms）

    // ---- コンテナ取得 ----
    // TODO: IDを HTML と合わせること
    const container = document.getElementById('pagename-container');
    if (!container) return;

    // ---- データ取得 ----
    // TODO: 使用するデータソースに変更（window.membersData / window.linksData 等）
    const data = window.xxxData;
    if (!data) return;

    // shouldShowItem で master/public モードに応じたフィルタリング
    const visible = data.filter(item => window.shouldShowItem(item));

    // ---- カードアニメーション付き挿入ヘルパー ----
    // CSS の .card-enter / .is-entering クラスと --card-delay プロパティで制御
    const animateCardsIn = (cards, targetContainer) => {
        cards.forEach((card, i) => {
            card.style.setProperty('--card-delay', `${i * STAGGER_MS}ms`);
            card.classList.add('card-enter', 'is-visible');
            targetContainer.appendChild(card);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                card.classList.add('is-entering');
            }));
        });
    };

    // ---- カード生成 ----
    // TODO: item のプロパティに合わせて innerHTML を編集
    const createCard = (item) => {
        const el = document.createElement('div');
        el.className = 'card reveal';
        el.setAttribute('data-name', item.name || '');

        el.innerHTML = `
            <p>${item.title || item.name || ''}</p>
        `;
        return el;
    };

    // ---- レンダリング ----
    const cards = visible.map(item => createCard(item));
    animateCardsIn(cards, container);
})();
