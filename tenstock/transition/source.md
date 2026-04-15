# Transition showcase — cell spec

## 1. Cell identifier
```
component: transition
mood: multi (pilot 2 pattern)
count: 2
```

## 2. Purpose

section / page / modal 間の **つなぎ** (切り替え) を担当。
OP (一回再生・サイト入場) とも loading (∞ 待機) とも異なり、**user action trigger** (scroll / link click / modal open) で 1 回再生される。

画面を「切り裂く」「覆う」「めくる」系の motion 家族が主軸。

## 3. Pilot catalog

| # | genre | mood | motion family |
|---|-------|------|---------------|
| 01 | イベント間 | cute | Trapezoid diagonal curtain with overshoot |
| 02 | セクション間 | cool | Radial clip wipe from bottom-right corner |

両 pattern とも container 駆動 (clip-path / transform を親に当てる) で、中身の形状に依存しない「画面を切り裂く」家族。user action trigger で 1 回再生する想定。

## 4. Showcase rules

- **stage 内テキスト禁止**: `_shared/preferences.md` 一般ルール (番号以外のテキストを stage 内に置かない)
- **container 駆動**: animation は container (親 div) の clip-path / transform に掛ける。コンテンツ形状依存にしない
- **showcase は ∞ loop preview**: 実装時は user action trigger で 1 回再生

## 5. Playback strategy

各 stage はギャラリー preview のため `animation-iteration-count: infinite` で循環再生。6-7 秒サイクル、末尾 3-4 秒は hold (閉じ状態 or 開き状態) を入れて pattern の「完成後の状態」を読める状態に。

実装時は trigger イベントで 1 回再生 + 再生完了後に次のページ/セクションを露出。

## 6. Evaluation axes

- **切断感**: 画面を切り裂く / 覆う演出として読めるか
- **方向性**: 入場方向 / 出場方向が明確か (どの方向から切られたか)
- **画像非依存性**: 任意の背景/コンテンツを差し込んでも演出として成立するか
- **モバイル survival**: 375px で grid が崩れず stage が閲覧可能か
- **reduced-motion survival**: `animation: none` 状態でも最終状態が表示されるか

## 7. File layout

```
tenstock/transition/
    source.md     ← this file
    index.html    ← gallery with 2 stages
    style.css     ← 2 variant classes + shared stage primitives
```

`tenstock/home.html` の Transition tile に `pilot 2` badge 付きで link。
