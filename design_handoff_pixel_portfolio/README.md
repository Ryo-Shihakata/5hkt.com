# Handoff: ピクセル・ポートフォリオサイト

## Overview
学生（情報工学専攻）の個人ポートフォリオを 1 ページにまとめた静的サイト。プロフィール、作成 Web アプリ、学生活動、研究活動、連絡先を、ドット絵／ピクセル調のデザインで見せる。日英切替、ダークモード自動追従、抜粋⇄全履歴タイムライン切替、HERO のピクセルアニメーション、そして非エンジニアでもメンテできる簡易 CMS（GUI 編集 + JSON 入出力）を備える。

設計書の前提：**ビルド不要・フレームワーク不使用（Vanilla HTML/CSS/JS）／ GitHub Pages での公開を想定**。この前提は実装時も尊重してよいが、別の環境に組み込む場合は下記「About the Design Files」を参照。

## About the Design Files
このバンドルに含まれる `*.dc.html` ファイルは、**HTML で作られたデザインリファレンス**です。見た目と挙動の意図を示すプロトタイプであり、そのまま本番コードとしてコピーするものではありません。

これらの `.dc.html` は社内のプレビューランタイム（`support.js`）に依存した独自フォーマット（`<x-dc>` テンプレート + ロジッククラス）で書かれています。**本番では `support.js` ごと使うのではなく、ターゲット環境の確立されたパターンで作り直してください。**

- 既存コードベース（React / Vue / Svelte 等）がある場合：その設計システム・コンポーネント・状態管理に合わせて再実装する。
- 環境がまだ無い場合：設計書どおり **Vanilla HTML/CSS/JS の静的サイト**として実装するのが第一候補（GitHub Pages 公開・ビルド不要の要件に最も素直）。元のアップロード版（`uploads/portfolio-site/` 相当）がまさにこの構成で、`data/*.json` を `fetch` する作りだった。本ハンドオフの `portfolio-data.js` がその発展形。

## Fidelity
**High-fidelity (hifi)**。配色・タイポグラフィ・余白・枠線・影・インタラクションまで最終形を意図しています。下記の Design Tokens / Components の数値どおりにピクセル単位で再現してください。ダミーのコピーや URL（`#`, `github.com/yourname` 等）は実データに差し替える前提です。

---

## Screens / Views

シングルページ。固定ヘッダー + 縦スクロールで各セクションへ。`max-width` は本文 920px / ヘッダー 1080px、中央寄せ。セクション間は `4px dashed var(--border)` の区切り線。

### 1. Header / Nav（sticky）
- **Layout**: `position:sticky; top:0; z-index:50`。`background:var(--panel)`、下辺 `4px solid var(--border)`。内側は `max-width:1080px` 中央寄せ、`min-height:64px`、`display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; padding:.55rem 1.25rem`。
- **ロゴ**: テキスト `_PORTFOLIO`、`font-family:var(--fpix)`（Press Start 2P）、`font-size:.75rem`、`color:var(--brand)`。
- **ナビリンク**（4件: 作成Webアプリ / 学生活動 / 研究活動 / 連絡先）: `var(--fdisp)`、`.95rem`、`padding:.35rem .1rem`、`border-bottom:3px solid`。**アクティブ時**（スクロールスパイ）だけ下線と文字色が `var(--brand)`、非アクティブは下線 `transparent`・文字色 `var(--ink)`。
- **言語トグルボタン**: ラベル `JA`⇔`EN`、`var(--fpix)`、`.6rem`、`padding:.5rem .7rem`、`background:var(--bg)`、`border:2px solid var(--border)`、`box-shadow:3px 3px 0 var(--border)`。`:active` で `transform:translate(3px,3px); box-shadow:0`（ピクセル風の押し込み）。

### 2. HERO
- **Layout**: `min-height:calc(100vh - 64px)`、`display:flex; flex-direction:column; justify-content:center; padding:5rem 1.5rem`。内側 `max-width:980px` 中央、`display:flex; flex-wrap:wrap-reverse; align-items:center; justify-content:space-between; gap:3rem`。
- **左カラム（テキスト, `flex:1 1 360px`）**:
  - キッカー `// whoami`：`var(--fpix)`、`.65rem`、`color:var(--accent)`。
  - 氏名 `<h1>`：`var(--fdisp)`、`clamp(1.9rem,5.5vw,3rem)`、`line-height:1.4`。末尾に点滅キャレット（`width:.5ch; height:.85em; background:var(--accent)`、`@keyframes pf-blink` 1.1s steps(1)）。
  - 肩書：`color:var(--accent)`、`1.3rem`。
  - bio：`color:var(--soft)`、`1.25rem`、`line-height:1.7`、`max-width:34ch`。
  - リンクボタン群（GitHub / Email / X）：ピクセルボタン（`var(--panel)` 地・`3px solid var(--border)`・`box-shadow:3px 3px 0`・`:active` 押し込み）。
- **右カラム（アバター枠, `max-width:280px`）**: 正方形（`aspect-ratio:1/1`、`width:min(260px,72vw)`）。**背景にチェッカーボード柄**（`--checker`、`background-size:20px`）、`border:4px solid var(--border)`、`box-shadow:7px 7px 0 var(--badge)`。前面に `<canvas>`（`image-rendering:pixelated`）でピクセルアニメを描画。下辺に `GIF / 写真をドロップ` のキャプション帯。→ **本番ではユーザーの GIF/写真に差し替える想定のスロット。**
- **スクロール誘導**: 最下部中央に `SCROLL ▾`、`@keyframes pf-bounce` 2.2s で上下バウンス。

### 3. Web Apps（`#webapps`）
- 見出しブロック：キッカー `// projects`（`var(--fpix)` `.65rem` accent）+ `<h2>`（`var(--fdisp)` `clamp(1.3rem,3.5vw,1.9rem)`）+ リード文（`var(--soft)` `1.15rem`）。
- **実績バッジ（Highlights）**: `display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:1rem`。各バッジ：`background:var(--badge)`（ゴールド）、`3px solid var(--border)`、`box-shadow:3px 3px 0`、`text-align:center`。数値 `var(--fpix)` `1.05rem`／ラベル `.9rem` 大文字。`showHighlights` で表示制御。
- **抜粋カードグリッド（デフォルト）**: `grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1.5rem`。`featured:true` のみ表示。カード仕様は下記「カード（重要）」。
- **タイムライン表示（トグル後）**: `PortfolioTimeline` 相当。左に `3px dashed` の縦線 + 各エントリにノード（`.85rem` 角・accent 地）。全件を期間チップ + PICK UP バッジ付きで縦に列挙。
- **トグルボタン**: 中央、accent 地の塗りボタン。ラベル `▸ 全履歴をタイムラインで見る` ⇔ `◂ 抜粋表示にもどる`。

#### カード（重要 — このカードがデザインの核）
`<article>`：
- `background:var(--panel)`、`border:3px solid var(--border)`、`box-shadow:5px 5px 0 var(--border)`、`display:flex; flex-direction:column`。
- **hover**: `transform:translate(-2px,-2px); box-shadow:7px 7px 0 var(--accent)`（影が accent 色になり浮く）、`transition:.1s`。
- **画像エリア**: `aspect-ratio:16/9`、下辺 `3px solid var(--border)`、**チェッカーボード柄**（`--checker`、`background-size:16px`、地色 `--checker-b`）。中央に `No Image`（`var(--fpix) .6rem`）。画像パスがあれば差し替え。
- **本文** `padding:1.1rem 1.15rem; gap:.55rem`:
  - `PICK UP` タグ：`var(--fpix) .55rem`、`background:var(--badge)`、`padding:.35em .6em`（抜粋カードのみ）。
  - 期間チップ：`background:var(--period)`（ブルー）、`.95rem`、`padding:.15em .55em`。
  - タイトル `<h3>`：`var(--fdisp)` `1.1rem` `line-height:1.4`。
  - サブタイトル（あれば）：`var(--soft) 1.05rem`。
  - 説明：`1.05rem`。
  - タグチップ：`var(--fdisp) .85rem`、`border:2px solid var(--border)`、`background:var(--bg)`、`padding:.2em .55em`。
  - リンクボタン（Demo / GitHub 等）：小サイズのピクセルボタン。`margin-top:auto` で下揃え。

### 4. Student Activities（`#student`）
- キッカー `// campus log`。構造は Web Apps と同じ（抜粋カードグリッド ⇄ タイムライン）。カードはサブタイトル無し・リンク無しのことが多い（タグのみ `margin-top:auto`）。

### 5. Research（`#research`）
- キッカー `// research log`。**横型エントリーカード**（トグル無し・全件表示）：
  - `display:grid; grid-template-columns:140px 1fr`。
  - 左列：`background:var(--period)`、右辺 `3px solid var(--border)`、期間を `var(--fpix) .6rem` で縦置き。
  - 右列：タイトル（`var(--fdisp) 1.05rem`）+ 説明 + タグ + リンク（Slides / Paper 等）。
  - カード全体 `3px solid var(--border)`、`box-shadow:3px 3px 0`。

### 6. Contact（`#contact`）
- キッカー `// contact`。`grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.2rem`。
- 各カード（`<a>`）：`min-height:120px`、縦 flex で `space-between`。ラベル（`var(--fpix) .65rem` accent）/ サブ（`var(--soft) 1.05rem`）/ `OPEN ▸`（`var(--fpix) .55rem`）。hover はカードと同じ（accent 影で浮く）。

### 7. Footer
- `text-align:center; padding:3rem 1.5rem 4rem`、上辺 `4px dashed`。コピー文 + `© 2026 <氏名>`（`var(--fpix) .55rem`）。

---

## Interactions & Behavior
- **言語切替（日↔英）**: ボタンで全文言・データの ja/en を切替。`localStorage['pf_lang']` に永続化。**英語時はフォントも変更**（見出し=Press Start 2P、本文=VT323／日本語時は両方 DotGothic16）。実装は CSS 変数 `--fdisp` / `--fbody` を JS で差し替え。
- **ダークモード**: `matchMedia('(prefers-color-scheme: dark)')` を購読し、ダーク用トークン一式を適用（下記参照）。手動トグルは無し（OS 追従）。
- **スクロールスパイ**: `IntersectionObserver`（`rootMargin:'-45% 0px -50% 0px'`）で現在セクションを判定し、ナビのアクティブ表示を更新。
- **抜粋⇄タイムライン切替**: Web Apps と Student で独立。ボタンで `featured` ⇔ `timeline` を state 切替。
- **HERO キャンバスアニメ**: `requestAnimationFrame` ループ。3 種（`wave` / `matrix` / `scan`）。CSS 変数から accent/period/ink/panel 色を読み、ピクセルを敷き詰めて時間変化。`clearRect` で背面のチェッカーボードを透過。`devicePixelRatio`（最大2）対応、リサイズ追従。
- **ホバー/アクティブ**: カードは hover で `translate(-2px,-2px)` + accent 影。ボタンは `:active` で `translate(3px,3px)` + 影消失（物理ボタンの押し込み）。
- **点滅キャレット**（HERO 氏名末尾）、**SCROLL バウンス**。
- **レスポンシブ**: グリッドは `auto-fit/minmax` で自動段組み。HERO は `flex-wrap:wrap-reverse`（狭幅でアバターが上）。フォントは `clamp()`。

## State Management
クライアント状態のみ（サーバー無し）：
- `lang`: 'ja' | 'en' — localStorage 永続。
- `dark`: boolean — OS 追従。
- `active`: 現在セクション id（スクロールスパイ）。
- `appsView` / `studView`: 'featured' | 'timeline'。
- **コンテンツデータ**: `portfolio-data.js` の単一ストア（下記）。`localStorage['pf_portfolio_v3']` に永続。`subscribe` で購読 → 変更時に再描画。
- データ取得要件：無し（静的）。元アップロード版は `data/*.json` を `fetch` していたので、その方式でも可。

## 簡易 CMS（メンテナンス機能 — 要望の中心）
`PortfolioCMS.dc.html` が右下「✎ 編集」ボタン + ドロワーを提供。**非エンジニアが GUI でメンテ**できることが目的。
- プロフィール / 実績バッジ / 各セクション項目 / 連絡先を編集。
- 項目の **追加・並べ替え（↑↓）・削除・PICK UP（featured）切替**。
- 入力は **即 localStorage 自動保存**。
- **JSON 書き出し**（`portfolio.json` ダウンロード）/ **読み込み**（ファイル選択）/ **初期化**。
- 運用イメージ：CMS で編集 → JSON 書き出し → リポジトリの `portfolio.json`（または `data/*.json`）に commit → GitHub Pages へ反映。これでビルド不要のままコンテンツ管理が回る。
- 入力フォーマット例：リンク = 1 行「ラベル | URL」、連絡先 = 「ラベル | サブ | URL」、実績 = 「数値 | ラベルJA | ラベルEN」、タグ = カンマ区切り。

> 本番再実装では、この「単一データソース + 購読再描画 + JSON 入出力 + localStorage」の構造をそのまま踏襲するのが推奨。React/Vue なら Context/store に、静的なら 1 つの JS モジュール or `data/*.json` に対応づける。

## Design Tokens

### Colors（ライト）
| Token | Hex | 用途 |
|---|---|---|
| `--bg` | `#cce4ff` | 背景（水色） |
| `--panel` | `#ffffff` | カード/ヘッダー地 |
| `--ink` | `#0d2540` | 本文・枠線（ネイビー） |
| `--soft` | `#4a6a8f` | 補助テキスト |
| `--border` | `#0d2540` | 枠線・影 |
| `--brand` | `#003672` | ロゴ・アクティブナビ |
| `--accent` | `#007367` | アクセント（ティール）・hover 影 |
| `--accent-ink` | `#ffffff` | accent 上の文字 |
| `--badge` | `#f2d579` | 実績バッジ・PICK UP（ゴールド） |
| `--period` | `#79b2f2` | 期間チップ・research 左列（ブルー） |
| `--checker-a` | `#79b2f2` | チェッカー柄 前景 |
| `--checker-b` | `#cce4ff` | チェッカー柄 地 |
| `--dot` | `rgba(13,37,64,0.13)` | 背景ドットマトリクス |

**背景**: フラットな `--bg` の上に `radial-gradient(var(--dot) 1.6px, transparent 1.6px)` を `background-size:22px 22px` で敷いたドットグリッド。`showGrid=false` で `--dot:transparent`。

**チェッカー柄** `--checker`（カード画像 / HERO アバター背面）:
```css
linear-gradient(45deg,var(--checker-a) 25%,transparent 25%),
linear-gradient(-45deg,var(--checker-a) 25%,transparent 25%),
linear-gradient(45deg,transparent 75%,var(--checker-a) 75%),
linear-gradient(-45deg,transparent 75%,var(--checker-a) 75%);
/* background-size:16px(カード) / 20px(HERO); position:0 0,0 h/2,w/2 -h/2,-w/2 0 */
```

### Colors（ダーク, `prefers-color-scheme:dark` で上書き）
`--bg:#141417` / `--panel:#1c1e25` / `--ink:#e2e7e7` / `--soft:#838e9a` / `--border:#5f6579` / `--brand:#4f93d6` / `--accent:#4f93d6` / `--accent-ink:#141417` / `--badge:#1c1e25` / `--period:rgba(0,67,122,.32)` / `--checker-a:#1c1e25` / `--checker-b:#141417` / `--dot:rgba(226,231,231,0.08)`。
※ アクセント色は Tweak `accent` で上書き可（候補: `#007367` `#003672` `#a23b2d` `#6b4ea0`）。指定時は `--accent` と `--brand` を同値に。

### Typography
- **`--fpix`**（ピクセル見出し/ラベル）: `'Press Start 2P','DotGothic16',monospace`
- **`--fdisp`**（ディスプレイ）: 日本語時 `'DotGothic16',monospace` / 英語時 `'Press Start 2P','DotGothic16',monospace`
- **`--fbody`**（本文）: 日本語時 `'DotGothic16',monospace` / 英語時 `'VT323','DotGothic16',monospace`
- ベース `font-size:18px`、`line-height:1.55`、`-webkit-font-smoothing:none`（ドット感を保つ）。
- フォントは `@font-face` でセルフホスト（`assets/fonts/*.woff2`、`font-display:swap`）。DotGothic16 は latin と japanese を `unicode-range` で出し分け。

### Spacing / Radius / Shadow
- セクション padding: `4.5rem 1.5rem`、本文 `max-width:920px`。
- **border-radius は基本 0**（角ばったピクセル UI）。
- 影は**ハードシャドウ**（ぼかし無し）: カード `5px 5px 0`、ボタン/小要素 `3px 3px 0`、HERO アバター `7px 7px 0 var(--badge)`、hover `7px 7px 0 var(--accent)`。
- 枠線: カード `3px solid`、ヘッダー/区切り `4px`（区切りは `dashed`）、タグ `2px`。

### Keyframes
- `pf-blink`（キャレット, 1.1s steps(1)）: 0–55% opacity1 / 56–100% opacity0。
- `pf-bounce`（SCROLL, 2.2s）: translateX(-50%) を基準に y 0↔6px。

## Assets
- **フォント**（`assets/fonts/`、セルフホスト woff2 — 元アップロード zip 同梱物）:
  - `press-start-2p-latin-400-normal.woff2`
  - `vt323-latin-400-normal.woff2`
  - `dotgothic16-latin-400-normal.woff2`
  - `dotgothic16-japanese-400-normal.woff2`
- **画像**: 現状は全てチェッカーボードのプレースホルダ（`No Image`）。HERO はキャンバスのピクセルアニメ。→ ユーザーのスクリーンショット / GIF / 写真に差し替える。
- **アイコン/絵文字**: 不使用（`▾ ▸ ◂ ★ _ //` 等のテキスト記号のみ）。

## Files（このバンドル内）
- `Portfolio.dc.html` — メインページ（全セクション + HERO キャンバス + i18n + ダーク + スクロールスパイ + Tweaks）。デザインリファレンス。
- `PortfolioCMS.dc.html` — 簡易 CMS ドロワー（GUI 編集 + JSON 入出力）。
- `PortfolioTimeline.dc.html` — 全履歴タイムライン表示（Web Apps / Student の展開時に使用）。
- `portfolio-data.js` — **コンテンツ単一ソース**（profile / highlights / webapps / student / research / contact）と localStorage ストア。実装の出発点はここ。**まずこのデータ構造を読むこと。**
- `support.js` — 社内プレビューランタイム（**本番では使わない**。`.dc.html` を動かすためだけのもの）。

> 注: `.dc.html` は `<x-dc>` テンプレート + `class Component extends DCLogic` のロジックという独自記法。挙動・スタイルの「正」はこの README と各ファイルの記述内容。記法ごと移植せず、ターゲット環境の流儀で書き直してください。

## 推奨実装ステップ（参考）
1. `portfolio-data.js` のデータ形（ja/en・featured・period・tags・links）を確認し、ターゲットのデータ層に写す（静的なら `data/*.json`）。
2. Design Tokens を CSS 変数 / テーマに定義（ライト + ダーク + チェッカー + ドット背景）。
3. フォントをセルフホストし、言語による `--fdisp/--fbody` 切替を用意。
4. カードコンポーネント（最重要）→ セクション → HERO → ヘッダー の順に組む。
5. インタラクション（言語/ダーク/スクロールスパイ/タイムライン切替/キャンバス）を付与。
6. CMS（GUI 編集 + JSON 入出力 + localStorage）を実装。最小なら「JSON 直編集 + localStorage」だけでも要望は満たせる。
