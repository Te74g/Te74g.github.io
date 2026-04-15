# preferences.md — accumulated user feedback

This file captures every piece of user feedback about tenstock patterns.
All worker agents MUST read this before generating. Commander updates after every eval session.

Format: each entry has date, scope, observation, and concrete spec change.

---

## General rules (apply to all cells)

- [2026-04-15] **Container animation vs Content animation**
  Observation (user): OP パターン 12 個を「全部画像で処理すると仮定して」評価した時、成功組 (03/05/08/11 = 85点) と失敗組 (01/06/09/10/12 = -50点) の違いは**アニメーションがコンテナ側 (clip-path/width/transform の親) にかかるか、コンテンツ形状前提 (squash/wiggle/eyelid) にかかるか**だった。成功組は中身が何でも通用する。
  Spec change: 新しい cell 設計時、「この pattern は任意の画像/ロゴでも通用するか」の fallback テストを必須化。コンテンツ形状を前提にした animation は **character-specific cell** に隔離 (`op/character/` など明示的名前)、一般 OP (`op/<mood>/`) には含めない。

- [2026-04-15] **OP / Transition / Loading を混同しない**
  Observation (user): OP showcase 12 個のうち、ユーザー視点で実は 3 用途が混ざっていた。
    - OP (一回再生・サイト入場の儀式) = 03, 11
    - Transition (section/ページつなぎ) = 04, 05
    - Loading (∞ loop で待たせる) = 02
  `op/` cell に入れたのは用途混在だった。
  Spec change: component は `op` / `transition` / `loading` の 3 コンポーネントに分割する方針へ。tenstock/home.html の 10-component 一覧に `loading` を追加検討 (既存は OP=op, Transition=transition で別々)。showcase cell に 12 パターン並べる時は用途を明示ラベル。

- [2026-04-15] **Showcase stage 内は「番号以外のテキスト禁止」**
  Observation (user): 「あと番号以外のテキストがあるのはダメです。」
  OP showcase 初版では擬似ロゴ/イベント名/タイトル/吹き出し (「あにあめもりあ」「ANIA MEMORIA」「CORPORATE SITE」「にゃあ」「Portfolio」「Ania Memoria」🎭 等) を stage 内に直接書き込んでいた。これがあると「良いパターン」と「良いブランドデザイン」が混同され、純粋な motion 評価ができない。
  Spec change: `.*-stage` (プレビュー枠) 内のテキスト node は禁止。ロゴやタイトルが必要な位置には **色ブロック / グラデ矩形 / アイコン画像** を stand-in として置く。stage 外の pattern #01-#12 番号と genre/mood 等の metadata label (stage 下) は metadata として OK。

- [2026-04-15] **引用元を generated artifact に書かない**
  Observation (user): 「普通に引用元書かないとかそういうルールだけあればいいよ。下手なことするよりいらんこと言わないようにする方がいくらかいい」
  Spec change: CSS / HTML / spec md / label / comment に外部サイト名や § 番号、"verbatim" 等の引用を示唆する語を書かない。motion family 名 (curtain / clip wipe / squash / slide 等) で表現する。過剰な dekey や構造再編はしない — 黙っておくのが最善。

## By mood

### Cool (かっこいい)
- (none yet)

### Cute (かわいい)
- (none yet)

### Elegant (エレガント)
- (none yet)

### Modern (モダン)
- (none yet)

### Retro (レトロ)
- (none yet)

### Fantasy (ファンタジー)
- (none yet)

## By component

### OP
- [2026-04-15] [cell: op/showcase-12] [patterns: #01 drop-teleport / #06 avalanche tile / #09 8bit / #10 eyelid / #12 Disney squash]
  Observation: 実画像を入れた時の想定で -50点 (マジでダメそう)。コンテンツの形状を前提にしたアニメが画像置換で破綻する。
  Spec change: OP cell (mood 別) に入れる pattern は「任意の KV 画像でも演出として成立するか」を必須 gate。この 5 パターンは `op/character/` (キャラ特化 cell) か、`loading/` への移動を検討。

- [2026-04-16] [cell: op/showcase-12 → op/showcase-7] [patterns: #01/#06/#09/#10/#12 削除]
  Observation (user): 「‐50点のやつは消そうね」+「アニメーション内の文字の部分を画像に差し替えない？previewとかベタ打ちでいい」
  Spec change: -50点 5 パターンを showcase から削除 (12→7)。残 7 pattern の KV/logo/portrait stand-in 色ブロックを `<img>` + placeholder 画像に差し替え (`assets/top2/placeholders/title-op.svg` を KV/logo 枠、`assets/motif/{ten,Wfox,Bcat}.webp` を #04 portrait 枠)。showcase は画像非依存 pattern のみ維持、キャラ特化は将来 `op/character/` cell へ分離検討。

- [2026-04-16] [cell: op/showcase-7 → op/showcase-4 + transition/ + loading/] [patterns: #02 → loading/, #04/#05 → transition/]
  Observation (user): 「で、トランジションっぽいのとかは移動できる？」
  Spec change: preferences.md 2026-04-15 で候補に挙がっていた用途分離を実行。`tenstock/transition/` と `tenstock/loading/` を新設。
    - `transition/` (pilot 2): #04 台形ダブル (tr-01) + #05 ラジアルクリップ (tr-02)。class 名を `tr-*` に rename
    - `loading/` (pilot 1): #02 ペアぶらぶら (ld-01)。class 名を `ld-*` に rename
    - `op/` 残り 4: #03 / #07 / #08 / #11 (画像非依存 + 一回再生として成立する pattern のみ)
  `tenstock/home.html` の Transition tile を active 化 (`pilot 2`)、Loading tile を新規追加 (`pilot 1`)。OP tile badge `showcase 7` → `showcase 4`。

- [2026-04-15] [cell: op/showcase-12] [patterns: #03 3-strip curtain / #08 width-overshoot bar / #11 2-stage clip]
  Observation: 85点 (めっちゃいい)。コンテナ駆動で中身依存なし、汎用 OP として通用。
  Spec change: これら 3 パターンを「汎用 OP 基軸」として mood 別 cell (op/elegant/, op/cool/, op/cute/) の基礎 variant 候補に採用。

- [2026-04-15] [cell: op/showcase-12] [patterns: #04 trapezoid / #07 slide-from-top]
  Observation: 40点 (ギリ通用)。台形と slide-from-top はシルエット依存は無いが、変化幅が小さい / overshoot が弱い。
  Spec change: duration/easing 再チューニング候補。特に #04 は transition 用途 (70点) で活きるので該当 cell へ。

- [2026-04-15] [cell: op/showcase-12] [pattern: #02 SD pair wiggle]
  Observation: 70点 (ローディングならOK)。∞ loop が OP として冗長、loading にピッタリ。
  Spec change: `loading/` cell の基礎 variant として採用候補。

### Section
- (none yet)

### Character
- (none yet)

### Transition
- [2026-04-15] [cell: op/showcase-12 → transition 候補] [patterns: #04 trapezoid / #05 radial clip]
  Observation: 70点 (transition としていい)。OP としては overshoot/密度が弱いが、section/page 間の transition には丁度いい "画面を切り裂く" 感が出ている。
  Spec change: transition cell 設計時、#04 trapezoid と #05 radial clip を base 2 variant として採用候補。

### Text
- (none yet)

### Article
- (none yet)

### Carousel
- (none yet)

### Button
- (none yet)

### Card
- (none yet)

### UI
- (none yet)

## Rejected patterns (do not regenerate)

- (none yet)

---

## Entry template

```
[YYYY-MM-DD] [cell: component/mood] [pattern: #NN name]
Observation: <what user said verbatim, or paraphrased>
Spec change: <concrete delta to apply going forward>
```
