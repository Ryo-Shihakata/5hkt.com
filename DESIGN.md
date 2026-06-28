# DESIGN.md — ピクセル・ポートフォリオ デザイン仕様

実装済みのデザインシステムの仕様書。配色・タイポグラフィ・余白・コンポーネント・インタラクションの「正」。
角ばったピクセルUI（**border-radius は基本 0**）と**ハードシャドウ（ぼかし無し）**が基調。

実体: [css/style.css](css/style.css) / [js/main.js](js/main.js) / [js/works.js](js/works.js) / [js/render.js](js/render.js) / [js/portfolio-data.js](js/portfolio-data.js) / [data/portfolio.json](data/portfolio.json) / [admin/](admin/)（Sveltia CMS）

---

## Design Tokens

CSS 変数として `.pf-root` に定義（[css/style.css](css/style.css)）。ダークは `@media (prefers-color-scheme: dark)` で上書き（OS 追従、手動トグル無し）。

### Colors（ライト）
| Token | Hex | 用途 |
|---|---|---|
| `--bg` | `#eef4fc` | 背景（アイスブルーホワイト） |
| `--panel` | `#ffffff` | カード/ヘッダー地 |
| `--ink` | `#0d2540` | 本文・枠線（ネイビー） |
| `--soft` | `#4a6a8f` | 補助テキスト |
| `--border` | `#0d2540` | 枠線・影 |
| `--brand` | `#003672` | ロゴ・アクティブナビ |
| `--accent` | `#003672` | アクセント・hover 影・キャレット・HEROアニメ |
| `--accent-ink` | `#ffffff` | accent 上の文字 |
| `--badge` | `#f2d579` | 実績バッジ・PICK UP（ゴールド） |
| `--period` | `#79b2f2` | 期間チップ・research 左列（ブルー） |
| `--checker-a` / `--checker-b` | `#79b2f2` / `#eef4fc` | チェッカー柄 前景 / 地 |
| `--dot` | `rgba(13,37,64,0.13)` | 背景ドットマトリクス |

> 当初ハンドオフのアクセントはティール `#007367` だったが、本実装では**ネイビー `#003672`** に変更（`--accent` と `--brand` を同値）。

### Colors（ダーク）
`--bg:#141417` / `--panel:#1c1e25` / `--ink:#e2e7e7` / `--soft:#838e9a` / `--border:#5f6579` / `--brand:#4f93d6` / `--accent:#4f93d6` / `--accent-ink:#141417` / `--badge:#1c1e25` / `--period:rgba(0,67,122,.32)` / `--checker-a:#1c1e25` / `--checker-b:#141417` / `--dot:rgba(226,231,231,0.08)`

### 背景
フラットな `--bg` の上に `radial-gradient(var(--dot) 1.6px, transparent 1.6px)` を `background-size:22px 22px` で敷いたドットグリッド。`.pf-nogrid`（`CONFIG.showGrid=false`）で `--dot:transparent`。

### チェッカー柄（`--checker`）
45/-45度の `linear-gradient` 4枚で市松模様。カード画像 `16px` / HERO アバター `20px`。

---

## Typography

セルフホスト woff2（`assets/fonts/`、`font-display:swap`）。DotGothic16 は latin / japanese を `unicode-range` で出し分け。

- `--fpix`（ピクセル見出し/ラベル）: `'Press Start 2P','DotGothic16',monospace`
- `--fdisp`（ディスプレイ）: ja=`DotGothic16` / en=`'Press Start 2P','DotGothic16'`
- `--fbody`（本文）: ja=`DotGothic16` / en=`'VT323','DotGothic16'`
- ベース `font-size:18px`（スマホで 16px）、`line-height:1.55`、`-webkit-font-smoothing:none`（ドット感維持）。
- 言語切替は `<html data-lang="ja|en">` で CSS が `--fdisp/--fbody` を差し替え（[main.js](js/main.js)）。

---

## Spacing / Border / Shadow
- セクション padding: `4.5rem 1.5rem`（スマホ `3.5rem 1.25rem`）、本文 `max-width:920px`。
- **border-radius: 0**（CMS ドロワー内のフォーム部品のみ例外）。
- **ハードシャドウ**（ぼかし無し）: カード `5px 5px 0`、ボタン/小要素 `3px 3px 0`、HERO アバター `7px 7px 0 var(--badge)`、hover `7px 7px 0 var(--accent)`。
- 枠線: カード `3px solid`、ヘッダー/区切り `4px`（区切りは `dashed`）、タグ `2px`。

### Keyframes
- `pf-blink`（キャレット 1.1s steps(1)）/ `pf-bounce`（SCROLL 2.2s）。

---

## Components
| コンポーネント | クラス | 要点 |
|---|---|---|
| ヘッダー/ナビ | `.pf-header` `.pf-nav` | sticky、スクロールスパイで `.pf-active`（下線+brand色） |
| HERO | `.pf-hero` `.pf-avatar-frame` | チェッカー枠+`<canvas>`ピクセルアニメ、点滅キャレット、SCROLL |
| カード（核） | `.pf-card` | `5px 5px 0` 影、16:9 チェッカー画像、PICK UP/期間/タイトル/タグ/リンク、hover で accent 影に浮上 |
| 実績バッジ | `.pf-badge` | ゴールド地、数値（fpix）+ ラベル |
| 研究横型 | `.pf-research-card` | `grid 140px 1fr`、左列に期間（スマホで縦積み） |
| 連絡先 | `.pf-contact-card` | `min-height:120px`、`OPEN ▸`、hover 浮上 |
| タイムライン | `.pf-timeline` | 縦 dashed 線 + ノード、全件を期間+PICK UP で列挙 |

---

## Interactions（[js/main.js](js/main.js)）
- **言語切替** ja↔en: 全文言+フォント差替、`localStorage['pf_lang']` 永続。
- **ダークモード**: `matchMedia('(prefers-color-scheme: dark)')`（CSS トークンで適用、OS 追従）。
- **スクロールスパイ**: `IntersectionObserver`（`rootMargin:'-45% 0px -50% 0px'`）でナビ active 更新。
- **タイムライン切替**: Web Apps / Student で独立に `featured`⇄`timeline`。
- **HERO キャンバス**: `requestAnimationFrame`、3種（`wave`/`matrix`/`scan`）、`devicePixelRatio`（最大2）対応、`getComputedStyle` で accent/ink/period を読むためダーク/アクセント変更に自動追従。
- **hover/active**: カードは hover で `translate(-2px,-2px)`、ボタンは `:active` で押し込み。タッチ端末（`@media (hover:none)`）では hover 浮上を無効化。

---

## Responsive
| ブレークポイント | 主な変更 |
|---|---|
| `≤ 760px` | ヘッダー縦整理、ナビ全幅、カードグリッド `minmax(220px,1fr)` |
| `≤ 560px` | base 16px、**ナビ非表示**（ロゴ→`#top`）、各グリッド1列、Highlights 2列、研究カード縦積み、余白圧縮 |
| `≤ 380px` | HEROボタン/タグの折返し安定化、Highlights 2列 |
| `hover:none` | カード/連絡先の hover 浮上を無効化 |

HERO は `flex-wrap:wrap-reverse` で狭幅時にアバターが上へ。グリッドは `auto-fit/minmax`、フォントは `clamp()`。

---

## カスタマイズ点

### アクセント色 / HEROアニメ等 — [js/main.js](js/main.js) 冒頭 `CONFIG`
| キー | 説明 |
|---|---|
| `heroFx` | `'wave'`/`'matrix'`/`'scan'` |
| `accent` | アクセント色の上書き（`''`=CSSトークン既定の `#003672`） |
| `avatarImage` | HEROアバター画像/GIFパス（`''`でキャンバスアニメ） |
| `showHighlights` / `showGrid` | バッジ表示 / 背景ドット |

> 恒久的に色を変える場合は [css/style.css](css/style.css) の `.pf-root` トークンを直接編集（ダークは `@media` 側）。`CONFIG.accent` はライト/ダーク両方を inline で上書きする手段。

### コンテンツ — [data/portfolio.json](data/portfolio.json)（Sveltia CMS / コード直編集の単一ソース）
項目フィールド: `{ id, featured, title{ja,en}, subtitle{ja,en}, description{ja,en}, period, tags[], image, links[{label,url}] }`

---

## コンテンツCMS（Sveltia CMS / [admin/](admin/)）
`data/portfolio.json` を単一ソースとし、`/admin` の Sveltia CMS が GitHub バックエンドで編集。
**「公開（Publish）」= `data/portfolio.json` に直 commit → Cloudflare Pages 自動デプロイ**で反映（手動 commit 不要）。

- 認証: GitHub OAuth（`sveltia-cms-auth` Worker を一度デプロイし、[admin/config.yml](admin/config.yml) の `backend.base_url` に設定）。
- 編集対象: profile / highlights / webapps / student / research / contact（[admin/config.yml](admin/config.yml) の collection 定義）。
- **公開ページ（`/`・`/works`）は CMS コードを読み込まない**ため、サイト本体の表示性能には影響しない。

---

## /works（成果物一覧）
[works/index.html](works/index.html) + [js/works.js](js/works.js)。`webapps` を**全件**密グリッド（`.pf-works-grid`）で列挙し、
タグチップ（`.pf-filter`）で絞り込み。トップの「抜粋＋タイムライン」とは独立して共存（トップに `/works` 導線）。
大量表示でも軽量にするため、画像 `loading="lazy"` ＋ カード `content-visibility:auto`。

---

## ファイル構成
```
index.html              トップ（抜粋＋タイムライン）
works/index.html        /works — 作成Webアプリ全件一覧
data/portfolio.json     コンテンツ単一ソース（Sveltia CMS が編集）
admin/index.html        Sveltia CMS
admin/config.yml        CMS 設定（編集対象 / GitHub連携）
css/style.css           Design Tokens + 全コンポーネント + レスポンシブ
js/portfolio-data.js    store：data/portfolio.json を fetch する単一ソース層
js/render.js            共有レンダリング ヘルパ（トップ / works 共用）
js/main.js              トップのレンダリング / i18n / ダーク / スパイ / タイムライン / HEROキャンバス / CONFIG
js/works.js             /works のレンダリング（全件 + タグ絞り込み）
assets/fonts/           セルフホスト woff2 ×4
assets/uploads/         CMS 画像アップロード先
_headers / _redirects   Cloudflare Pages 設定
```
