# CLAUDE.md  EあにあめもりぁE開発ガイチE
> **AIへの持E��:** コードを編雁E��る前に忁E��こ�Eファイルを読む、E> 変更を加えたら末尾の [変更ログ](#変更ログ) に追記する、E> 既存�E実裁E��追加する前に「重褁E��ェチE��リスト」を確認する、E
---

## プロジェクト概要E
| 頁E�� | 冁E�� |
|---|---|
| 名前 | あにあめもりあ！EniameMoria�E�E|
| 種別 | VRChat イベント�E式サイチE|
| 配信 | GitHub Pages�E�静皁EHTML + CSS + JS、サーバ�Eサイドなし！E|
| 現在状慁E| `maintenanceMode: true`�E�サイト非公開中�E�E|
| チE��ト方況E| `_config/data_site.js` の `maintenanceMode` めE`false` にしてから確認、E*終わったら忁E�� `true` に戻ぁE* |

---

## 現在進行中の作業

- [ ] トップ�Eージ再設計！Epages/top_preview.html` ↁE封E�� `index.html` に移植！E- [ ] URL 再設計！Epages/` 廁E��・クリーン URL 化）�E 公開前に実施
- [ ] メンバ�Eスタブ�E動生成スクリプト�E�Escripts/generate_stubs.js`、未作�E�E�E
---

## チE��レクトリ・ファイル地図

### 設定�EチE�Eタ�E�E_config/`�E�E| ファイル | 役割 |
|---|---|
| `data_site.js` | `window.siteConfig`�E�サイト�E体設定�E`heroImages`・`maintenanceMode` |
| `data_members.js` | `window.membersData`�E��Eメンバ�E配�E |
| `data_news.js` | `window.newsData`�E�ニュース配�E |

チE�Eタファイルは読み取り専用扱ぁE��文言変更は許可、構造変更は慎重に、E
### JS�E�Ejs/`�E�E| ファイル | 役割 | 備老E|
|---|---|---|
| `utils.js` | `fixPath` `isMemberVisible` `getRevealLevel` `shouldShowItem` `getMemberBackground` `getMemberFrame` | 全ペ�Eジ共通ユーチE��リチE�� |
| `common-layout.js` | ヘッダー・フッター DOM 注入�E�ErenderLayout(rootPath)`�E�E| maintenance redirect なぁE|
| `ui.js` | ヘッダー elevation・メニュー・reveal | **maintenance redirect あり** ↁE`top_preview.html` では読まなぁE|
| `top.js` (retired) | トップ�Eージ専用エンジン�E�Ei.js の代替 + スクロール morph�E�E| `top_preview.html` 専用 |
| `home.js` | 旧トップ�EージのチE�Eタ注入 | `index.html` 専用、移行後�E廁E��予宁E|
| `people.js` | キャスト紹介�Eージのフィルタ・描画 | |
| `profile_loader.js` | メンバ�Eプロフィールペ�Eジ | `window.__memberId` 優先、`?id=` はフォールバック |

### CSS�E�Ecss/`�E�E| ファイル | 役割 |
|---|---|
| `css/styles.css` | `@import` だけ。�E parts をここで束�EめE|
| `css/parts/variables.css` | CSS カスタムプロパティ定義�E�E--bg` `--ink` `--accent-gold` 等！E|
| `css/parts/layout.css` | `.reveal` / `.is-visible` reveal シスチE��、`.container`、�E通余白 |
| `css/parts/header.css` | ヘッダー・ナビ・メニューオーバ�Eレイ |
| `css/parts/footer.css` | フッター |
| `css/parts/components.css` | `.btn` `.card` 等�E汎用コンポ�EネンチE|
| `css/parts/hero.css` | **サブ�Eージの** `.hero` グリチE��レイアウト（トチE�E演�Eとは無関係！E|
| `css/parts/people.css` | キャスト紹介�Eージ専用 |
| `css/parts/top.css` (retired) | 新トップ�Eージ専用�E�Etop_preview.html` 用�E�E|
| `css/parts/opening.css` | 旧トップ�Eージ専用�E�Eindex.html` 旧版）�E 新規では使わなぁE|

---

## アーキチE��チャルール�E�忁E��守る�E�E
### JS ↁECSS の接続方況E```
✁EJS は CSS カスタムプロパティだけ操作すめE   el.style.setProperty('--kv-scale', 0.56);
   CSS: transform: scale(var(--kv-scale, 1));

❁EJS から直接 style.transform = '...' は書かなぁE��スクロール morph の計算値を除く！E❁EJS のチE��プレ斁E���Eに style="..." を埋め込まなぁE��Eome.js の旧コード�E負債�E�E```

### 画像パスの書き方
```
✁Edata_*.js のパスは fixPath() を通す
   img.src = window.fixPath(member.profileImages[0]);

✁EsiteConfig 経由で解決する
   img.src = window.fixPath(window.siteConfig.heroImages.character);

❁EJS めEHTML に画像パスを直書きしなぁE❁E./assets/... めE../assets/... をコード中に書かなぁE```

### reveal アニメーション
```
✁Eクラス吁E .reveal�E��E期状態！E .is-visible�E�表示状態！E✁ECSS 変数でチE��レイ: style.setProperty('--reveal-delay', '200ms')
✁ECSS: transition: opacity 0.4s ease var(--reveal-delay, 0ms), transform 0.4s ease var(--reveal-delay, 0ms)

❁E.card-enter / .is-entering / .card-visible は廁E��済み ↁE使わなぁE❁Etransition: all を使わなぁE���E示皁E��プロパティ持E���Eみ�E�E```

### スクリプト読み込み頁E��頁E��が壊れると動かなぁE��E```html
<!-- こ�E頁E��を変えなぁE-->
<script src="../_config/data_site.js"></script>
<script src="../_config/data_members.js"></script>
<script src="../_config/data_news.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/common-layout.js"></script>
<script>renderLayout('../');</script>
<!-- ↑ここまでで window.siteConfig / membersData / newsData / fixPath が確宁E-->
<!-- ↓�Eージ専用 JS はここから -->
<script src="../js/ui.js"></script>        <!-- ui.js は maintenance redirect あり -->
<!-- また�E -->
<!-- top.js retired: top_preview now redirects to / -->       <!-- maintenance redirect なぁE-->
```

---

## 禁止パターン�E�過去の負債を�E生産しなぁE��E
| めE��てはぁE��なぁE��と | 琁E�� |
|---|---|
| `pages/` 配下に新ファイルを追加する | `pages/` は廁E��予定。新ペ�Eジはルート直下�EチE��レクトリに置ぁE|
| `home.css` を作る・参�Eする | 存在しなぁE��混乱を招ぁE|
| `opening.css` を新規�Eージで読む | 旧トップ専用、新規不可 |
| `hero.css` をトチE�E演�Eに使ぁE| サブ�Eージの `.hero` グリチE��専用、別物 |
| `assets/opening/Ryu_Chan.webp` を参照する | 削除済みゴミファイル |
| `top_preview.html` に `ui.js` を読ませる | maintenance redirect が発火する |
| `maintenanceMode` めE`false` にしたままコミッチE| サイトが公開状態になめE|
| `?id=xxx` を新しいペ�Eジリンクに使ぁE| URL 設計で廁E��決定（後述�E�E|

---

## URL 設計ルール�E�確定！E
### 原則
1. 拡張子なし�E`/index` なし（ディレクトリ `index.html` 配置で自動的に消える！E2. 全て英語�E小文字�Eハイフン区刁E��
3. `?id=xxx` 禁止�E�パスセグメントに変換�E�E
### 対応表
```
/ (index.html)                        トッチE/cast/ (cast/index.html)              キャスト一覧
/cast/ten/ (cast/ten/index.html)      メンバ�Eプロフィール�E�スタブ方式！E/news/ (news/index.html)              ニュース一覧
/news/grand-open-2026/ (...)          ニュース個別記亁E/schedule/ (schedule/index.html)      スケジュール
/partner/ (partner/index.html)        提携イベンチE/links/ (links/index.html)            関連リンク
/aikotoba/ (aikotoba/index.html)      合言葁E/privacy/ (privacy/index.html)        プライバシーポリシー
/terms/ (terms/index.html)            利用規紁E/contact/ (contact/index.html)        お問ぁE��わせ
/maintenance/ (maintenance/index.html) メンチE��ンス
```

### メンバ�Eスタブ！E/cast/ten/index.html`�E��E雛形
```html
<!DOCTYPE html><html lang="ja"><head>
<meta charset="UTF-8">
<script>window.__memberId = 'MEMBER_ID_HERE';</script>
<script src="/js/profile_loader.js"></script>
</head><body></body></html>
```
`profile_loader.js` は `window.__memberId` を優先し、なければ `?id=` にフォールバック�E�後方互換�E�、E
---

## メンバ�E表示制御

`getRevealLevel(member)` の戻り値で制御�E�E
| レベル | 意味 | 表示 |
|---|---|---|
| 0 | hidden | 一刁E��示しなぁE|
| 1 | coming_soon | 、E??」表示・シルエチE��画僁E|
| 2 | silhouette | シルエチE��画像�E名前と動物種のみ |
| 3 | full | 完�E公閁E|

- **トッチECast Preview**: `revealLevel >= 3` のみ
- **キャスト一覧 people.js**: `revealLevel >= 2`�E�シルエチE��も表示�E�E- `isMemberVisible(m, castConfig)` と `shouldShowItem(m)` も忁E��通す

---

## 重褁E��ェチE��リスチE
コードを追加・変更する前に確認する！E
- [ ] 追加しよぁE��してぁE�� CSS クラスは `css/parts/` のどこかに既にあるか！E- [ ] 追加しよぁE��してぁE�� JS 関数は `utils.js` に既にあるか？！EfixPath` `isMemberVisible` 等！E- [ ] `reveal` 系のクラス名が `.card-enter` めE`.is-entering` になってぁE��ぁE���E�E- [ ] 新しいペ�Eジは `pages/` ではなくルート直下に作ってぁE��か！E- [ ] `renderLayout` は 1 回だけ呼んでぁE��か！E- [ ] 画像パスめEJS めEHTML に直書きしてぁE��ぁE���E�E- [ ] `transition: all` を使ってぁE��ぁE���E�E- [ ] `maintenanceMode` を戻し忘れてぁE��ぁE���E�E
---

## 変更ログ

変更したら�E頭に追記する。フォーマッチE `YYYY-MM-DD | 変更ファイル | 冁E��`

---

`2026-03-09` | URL 再設訁E| `pages/` 廁E��。各ペ�EジめE`cast/ partner/ aikotoba/ contact/ links/ privacy/ terms/` へ移動。`cast/{id}/` `news/{slug}/` スタチE6+1件生�E。`common-layout.js` ナビ全リンク更新。`utils.js` fixPath depth をセグメント数で正確計算。`data_news.js` 冁E��ンクを絶対パス `/cast/` に修正

`2026-03-09` | `scripts/generate_stubs.js` | スタブ�E動生成スクリプト追加。`--dry/--force/--cast/--news` フラグ対忁E
`2026-03-09` | `js/profile_loader.js` `js/news_loader.js` | `window.__memberId` / `window.__newsId` を優先読み、`?id=` にフォールバック�E�スタブ方式対応！E
`2026-03-09` | `css/parts/top.css` (retired) `js/top.js` `pages/top_preview.html` | 新トップ�Eージ作�E�E�スクロール morph Hero・Latest・Cast Preview・Concept・Guide�E�E
`2026-03-09` | `_config/data_site.js` | `heroImages.character` めE`assets/page/unei.webp` に変更�E�暫宁EKV�E�E
`2026-03-09` | `assets/opening/Ryu_Chan.webp` `assets/opening/Ryu_Chan_2.webp` | 削除�E�前任ゴミファイル�E�E
`2026-03-09` | `js/ui.js` | MutationObserver で動的挿入 `.reveal` 要素も補足するよう修正

`2026-03-09` | `css/parts/people.css` `js/people.js` | `.card-enter/.is-entering/--card-delay` ↁE`.reveal/.is-visible/--reveal-delay` に統一、`transition: all` を�E示プロパティに変更、フレーム inline style めE`.cheki-frame` クラスへ移衁E

---

## 引継ぎメモ（2026-03-26）

### やったこと

- **ミラー作成**: `Desktop\Te74g-mirror` に `git clone --local` でミラー作成。originをGitHubに変更済み。作業・push用はこちらを使う
- **パフォーマンス修正**（`Desktop\Te74g-mirror` にコミット済み）:
  - `js/profile_switcher.js` — mousemoveリスナーをメンバ変数に保存、`destroy()`追加（メモリリーク修正）
  - `js/pages/top.js` — resizeイベントにrAFスロットリング追加
  - `css/parts/opening.css` — `will-change` から `filter` を削除（アニメーションしていない）
  - `css/parts/components.css` — `.card` の `backdrop-filter: blur(6px)` を削除（背景が88%不透明なので効果なし・GPU負荷のみ）
  - `css/parts/layout.css` — モバイルで `.bg-texture` を `background-attachment: scroll` に変更（fixed は毎フレーム再描画）
- **プレビューサーバー**: `serve_project.py` と `.claude/launch.json` をこのフォルダ直下に追加済み。次回から `Desktop\unti\Te74g.github.io` でClaudeを開けばそのまま使える

### 未解決

- **プレビューのメンテナンス画面**: `data/site.js` の `maintenanceMode: false` は確認済み。ブラウザキャッシュで `maintenance.html` から抜け出せていない。新しいブラウザタブ or ハードリロードで解消するはず
- **注意**: 古いzip（`Downloads\新しいフォルダー (2)\Te74g.github.io-main`）には `_config/data_site.js` に `maintenanceMode: true` が入っていた。このリポジトリには `_config/` は存在しない（`data/` が正しいパス）
