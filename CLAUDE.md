# CLAUDE.md — あにあめもりあ 開発ガイド

> **AIへの指示:** コードを編集する前に必ずこのファイルを読む。
> 変更を加えたら末尾の [変更ログ](#変更ログ) に追記する。
> 既存の実装を追加する前に「重複チェックリスト」を確認する。

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| 名前 | あにあめもりあ（AniameMoria） |
| 種別 | VRChat イベント公式サイト |
| 配信 | GitHub Pages（静的 HTML + CSS + JS、サーバーサイドなし） |
| 現在状態 | `maintenanceMode: true`（サイト非公開中） |
| テスト方法 | `_config/data_site.js` の `maintenanceMode` を `false` にしてから確認、**終わったら必ず `true` に戻す** |

---

## 現在進行中の作業

- [ ] トップページ再設計（`pages/top_preview.html` → 将来 `index.html` に移植）
- [ ] URL 再設計（`pages/` 廃止・クリーン URL 化）→ 公開前に実施
- [ ] メンバースタブ自動生成スクリプト（`scripts/generate_stubs.js`、未作成）

---

## ディレクトリ・ファイル地図

### 設定・データ（`_config/`）
| ファイル | 役割 |
|---|---|
| `data_site.js` | `window.siteConfig`：サイト全体設定・`heroImages`・`maintenanceMode` |
| `data_members.js` | `window.membersData`：全メンバー配列 |
| `data_news.js` | `window.newsData`：ニュース配列 |

データファイルは読み取り専用扱い。文言変更は許可、構造変更は慎重に。

### JS（`js/`）
| ファイル | 役割 | 備考 |
|---|---|---|
| `utils.js` | `fixPath` `isMemberVisible` `getRevealLevel` `shouldShowItem` `getMemberBackground` `getMemberFrame` | 全ページ共通ユーティリティ |
| `common-layout.js` | ヘッダー・フッター DOM 注入（`renderLayout(rootPath)`） | maintenance redirect なし |
| `ui.js` | ヘッダー elevation・メニュー・reveal | **maintenance redirect あり** → `top_preview.html` では読まない |
| `top.js` | トップページ専用エンジン（ui.js の代替 + スクロール morph） | `top_preview.html` 専用 |
| `home.js` | 旧トップページのデータ注入 | `index.html` 専用、移行後は廃止予定 |
| `people.js` | キャスト紹介ページのフィルタ・描画 | |
| `profile_loader.js` | メンバープロフィールページ | `window.__memberId` 優先、`?id=` はフォールバック |

### CSS（`css/`）
| ファイル | 役割 |
|---|---|
| `css/styles.css` | `@import` だけ。全 parts をここで束ねる |
| `css/parts/variables.css` | CSS カスタムプロパティ定義（`--bg` `--ink` `--accent-gold` 等） |
| `css/parts/layout.css` | `.reveal` / `.is-visible` reveal システム、`.container`、共通余白 |
| `css/parts/header.css` | ヘッダー・ナビ・メニューオーバーレイ |
| `css/parts/footer.css` | フッター |
| `css/parts/components.css` | `.btn` `.card` 等の汎用コンポーネント |
| `css/parts/hero.css` | **サブページの** `.hero` グリッドレイアウト（トップ演出とは無関係） |
| `css/parts/people.css` | キャスト紹介ページ専用 |
| `css/parts/top.css` | 新トップページ専用（`top_preview.html` 用） |
| `css/parts/opening.css` | 旧トップページ専用（`index.html` 旧版）→ 新規では使わない |

---

## アーキテクチャルール（必ず守る）

### JS → CSS の接続方法
```
✅ JS は CSS カスタムプロパティだけ操作する
   el.style.setProperty('--kv-scale', 0.56);
   CSS: transform: scale(var(--kv-scale, 1));

❌ JS から直接 style.transform = '...' は書かない（スクロール morph の計算値を除く）
❌ JS のテンプレ文字列に style="..." を埋め込まない（home.js の旧コードは負債）
```

### 画像パスの書き方
```
✅ data_*.js のパスは fixPath() を通す
   img.src = window.fixPath(member.profileImages[0]);

✅ siteConfig 経由で解決する
   img.src = window.fixPath(window.siteConfig.heroImages.character);

❌ JS や HTML に画像パスを直書きしない
❌ ./assets/... や ../assets/... をコード中に書かない
```

### reveal アニメーション
```
✅ クラス名: .reveal（初期状態）/ .is-visible（表示状態）
✅ CSS 変数でディレイ: style.setProperty('--reveal-delay', '200ms')
✅ CSS: transition: opacity 0.4s ease var(--reveal-delay, 0ms), transform 0.4s ease var(--reveal-delay, 0ms)

❌ .card-enter / .is-entering / .card-visible は廃止済み → 使わない
❌ transition: all を使わない（明示的なプロパティ指定のみ）
```

### スクリプト読み込み順（順番が壊れると動かない）
```html
<!-- この順番を変えない -->
<script src="../_config/data_site.js"></script>
<script src="../_config/data_members.js"></script>
<script src="../_config/data_news.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/common-layout.js"></script>
<script>renderLayout('../');</script>
<!-- ↑ここまでで window.siteConfig / membersData / newsData / fixPath が確定 -->
<!-- ↓ページ専用 JS はここから -->
<script src="../js/ui.js"></script>        <!-- ui.js は maintenance redirect あり -->
<!-- または -->
<script src="../js/top.js"></script>       <!-- maintenance redirect なし -->
```

---

## 禁止パターン（過去の負債を再生産しない）

| やってはいけないこと | 理由 |
|---|---|
| `pages/` 配下に新ファイルを追加する | `pages/` は廃止予定。新ページはルート直下のディレクトリに置く |
| `home.css` を作る・参照する | 存在しない、混乱を招く |
| `opening.css` を新規ページで読む | 旧トップ専用、新規不可 |
| `hero.css` をトップ演出に使う | サブページの `.hero` グリッド専用、別物 |
| `assets/opening/Ryu_Chan.webp` を参照する | 削除済みゴミファイル |
| `top_preview.html` に `ui.js` を読ませる | maintenance redirect が発火する |
| `maintenanceMode` を `false` にしたままコミット | サイトが公開状態になる |
| `?id=xxx` を新しいページリンクに使う | URL 設計で廃止決定（後述） |

---

## URL 設計ルール（確定）

### 原則
1. 拡張子なし・`/index` なし（ディレクトリ `index.html` 配置で自動的に消える）
2. 全て英語・小文字・ハイフン区切り
3. `?id=xxx` 禁止（パスセグメントに変換）

### 対応表
```
/ (index.html)                        トップ
/cast/ (cast/index.html)              キャスト一覧
/cast/ten/ (cast/ten/index.html)      メンバープロフィール（スタブ方式）
/news/ (news/index.html)              ニュース一覧
/news/grand-open-2026/ (...)          ニュース個別記事
/schedule/ (schedule/index.html)      スケジュール
/partner/ (partner/index.html)        提携イベント
/links/ (links/index.html)            関連リンク
/aikotoba/ (aikotoba/index.html)      合言葉
/privacy/ (privacy/index.html)        プライバシーポリシー
/terms/ (terms/index.html)            利用規約
/contact/ (contact/index.html)        お問い合わせ
/maintenance/ (maintenance/index.html) メンテナンス
```

### メンバースタブ（`/cast/ten/index.html`）の雛形
```html
<!DOCTYPE html><html lang="ja"><head>
<meta charset="UTF-8">
<script>window.__memberId = 'MEMBER_ID_HERE';</script>
<script src="/js/profile_loader.js"></script>
</head><body></body></html>
```
`profile_loader.js` は `window.__memberId` を優先し、なければ `?id=` にフォールバック（後方互換）。

---

## メンバー表示制御

`getRevealLevel(member)` の戻り値で制御：

| レベル | 意味 | 表示 |
|---|---|---|
| 0 | hidden | 一切表示しない |
| 1 | coming_soon | 「???」表示・シルエット画像 |
| 2 | silhouette | シルエット画像・名前と動物種のみ |
| 3 | full | 完全公開 |

- **トップ Cast Preview**: `revealLevel >= 3` のみ
- **キャスト一覧 people.js**: `revealLevel >= 2`（シルエットも表示）
- `isMemberVisible(m, castConfig)` と `shouldShowItem(m)` も必ず通す

---

## 重複チェックリスト

コードを追加・変更する前に確認する：

- [ ] 追加しようとしている CSS クラスは `css/parts/` のどこかに既にあるか？
- [ ] 追加しようとしている JS 関数は `utils.js` に既にあるか？（`fixPath` `isMemberVisible` 等）
- [ ] `reveal` 系のクラス名が `.card-enter` や `.is-entering` になっていないか？
- [ ] 新しいページは `pages/` ではなくルート直下に作っているか？
- [ ] `renderLayout` は 1 回だけ呼んでいるか？
- [ ] 画像パスを JS や HTML に直書きしていないか？
- [ ] `transition: all` を使っていないか？
- [ ] `maintenanceMode` を戻し忘れていないか？

---

## 変更ログ

変更したら先頭に追記する。フォーマット: `YYYY-MM-DD | 変更ファイル | 内容`

---

`2026-03-09` | `scripts/generate_stubs.js` | スタブ自動生成スクリプト追加。`--dry/--force/--cast/--news` フラグ対応

`2026-03-09` | `js/profile_loader.js` `js/news_loader.js` | `window.__memberId` / `window.__newsId` を優先読み、`?id=` にフォールバック（スタブ方式対応）

`2026-03-09` | `css/parts/top.css` `js/top.js` `pages/top_preview.html` | 新トップページ作成（スクロール morph Hero・Latest・Cast Preview・Concept・Guide）

`2026-03-09` | `_config/data_site.js` | `heroImages.character` を `assets/page/unei.webp` に変更（暫定 KV）

`2026-03-09` | `assets/opening/Ryu_Chan.webp` `assets/opening/Ryu_Chan_2.webp` | 削除（前任ゴミファイル）

`2026-03-09` | `js/ui.js` | MutationObserver で動的挿入 `.reveal` 要素も補足するよう修正

`2026-03-09` | `css/parts/people.css` `js/people.js` | `.card-enter/.is-entering/--card-delay` → `.reveal/.is-visible/--reveal-delay` に統一、`transition: all` を明示プロパティに変更、フレーム inline style を `.cheki-frame` クラスへ移行
