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
 * image:    バナー画像の場所（例: "./assets/news/event_banner.png"）
 * link:     詳細リンク（変更不要）
 * desc:     簡単な説明
 * content:  イベントの詳細本文（HTML）。
 * --------------------------------------------------------------------------
 */
window.partnerEventsData = [
    {
        id: "event_01",
        name: "第1回 提携イベント",
        date: "2026.02.15",
        organizer: "主催者A",
        image: "assets/partner_events/event_Test2026-01-22.png",
        link: "partner_events/event.html?id=event_01",
        desc: "第1回 提携イベントの詳細ページを作成しました。こちらから詳細を確認できます。",
        content: `
            <p>これは第1回 提携イベントのサンプルページです。</p>
            <p>イベントの魅力や詳細をここに記載します。</p>

            <h3>イベント詳細</h3>
            <ul>
                <li>日時：2026年X月XX日 XX:XX〜</li>
                <li>場所：XXXX</li>
                <li>参加条件：XXXX</li>
            </ul>

            <div style="margin-top:20px; text-align:center;">
                <a href="https://twitter.com/ANIAMEMORIA" class="btn btn--primary" target="_blank"
                    rel="noopener">公式情報(X)へ</a>
            </div>
        `
    }
];
