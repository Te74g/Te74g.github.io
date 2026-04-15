# Loading showcase — cell spec

## 1. Cell identifier
```
component: loading
mood: multi (pilot 1 pattern)
count: 1
```

## 2. Purpose

処理中・ロード中・待機中にユーザーを **つなぎとめる** (∞ loop で待たせる)。
OP (一回再生・儀式) とは異なり、**明確な終わりを持たない**。終了は JS 側の dismiss trigger に委ねる。

## 3. Pilot catalog

| # | genre | mood | motion family |
|---|-------|------|---------------|
| 01 | キャラもの | cute | Slide-from-bottom pair + paired mirror wiggle ∞ loop |

∞ loop が loading の性質と噛み合う家族 (一回再生の儀式とは逆方向)。entry 直後から continuous wiggle が走り、dismiss 契機は JS 側に委ねる。

## 4. Showcase rules

- **stage 内テキスト禁止**: `_shared/preferences.md` 一般ルール (番号以外のテキストを stage 内に置かない)
- **∞ loop 前提**: reduced-motion でも完全停止はせず、緩やかな loop は許容 (loading の性質優先)
- **dismiss 契機は external**: JS / user event で stop するため showcase 自身に進行 UI なし

## 5. Playback strategy

entry (1.2s) + wiggle ∞ loop (2.4s cycle)。
hold 区間は無し (∞ loop なのでそのまま永続)。

## 6. Evaluation axes

- **飽きさせない動き**: 長時間見ても煩くない、穏やかな loop か
- **待たせる誠意**: 「処理中ですよ」のサインとして読めるか
- **画像非依存性**: 任意のキャラ SD 画像を差し込んでも演出として成立するか
- **モバイル survival**: 375px で 2 キャラが重ならず表示されるか
- **reduced-motion survival**: 停止ではなく「ゆっくりした loop」で生存

## 7. File layout

```
tenstock/loading/
    source.md     ← this file
    index.html    ← gallery with 1 stage
    style.css     ← 1 variant class + shared stage primitives
```

`tenstock/home.html` の Loading tile に `pilot 1` badge 付きで link。
