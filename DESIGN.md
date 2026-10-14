# DESIGN.md — デザイン仕様

サイトには2つのデザインがある。**新デザイン（既定、`/`・`/works/`）** と、**旧デザイン（ピクセル調、`/classic/`・`/classic/works/`）**。
どちらも `data/portfolio.json` を読む。ヘッダーのボタン（新:「旧デザイン」/ 旧:「新デザイン」）で行き来できる。
**どちらを選んだかは記憶しない**（以前は記憶して自動で移していたが、意図せず旧デザインが出るため 2026-10-14 に廃止）。言語（`pf_lang`）は両デザインで共有。

**キャッシュ対策**: 本番の JS/CSS は Cloudflare 側の設定でブラウザに 4 時間キャッシュされる。
新しい HTML と古い JS/CSS が混ざると表示が壊れるため、HTML の参照とモジュールの import にはすべて `?v=版番号` を付けている。
**JS/CSS を変えたら `scripts/bump-assets.sh` を実行して版番号を上げること。**

---

# 新デザイン（`/`）

原点ラボ（Genten Lab）の配色を土台にした、Anthropic 風のエディトリアルなデザイン。
生成りの紙色 + 墨 + 朱の一点。見出しはセリフ/明朝、本文はゴシック。
**角丸・影・すりガラス・ピル型・柄は使わない（AIっぽい定型を避ける）。四角と罫線と余白で組む。**

実体: [css/style.css](css/style.css) / [js/site.js](js/site.js)（共用）/ [js/main.js](js/main.js)（トップ）/ [js/works.js](js/works.js)（/works）

## Tokens（`:root`、ダークは `prefers-color-scheme` で上書き）
| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--bg` | `#f0ece3` | `#191815` | 背景（生成り） |
| `--surface` | `#fbf8f2` | `#22211d` | カード地 |
| `--surface-2` | `#e7e1d5` | `#2b2925` | 沈んだ面（Homelab セクション） |
| `--ink` / `--ink-2` / `--ink-3` | `#1f1e1b` / `#5c5850` / `#8a8478` | `#f0ece3` / `#b3ad9f` / `#86806f` | 文字 |
| `--accent` | `#c2412f` | `#e0664f` | 朱（点・ホバー・強調） |
| `--tone-0..4` | 若竹/砂/薄青/桃/藤 | 各暗色 | 画像なしカードの表紙色（id のハッシュで決定） |

## Typography
- 見出し `--serif`: `Newsreader`（欧文）→ `Noto Serif JP`（和文）。本文 `--sans`: `Noto Sans JP`。Google Fonts から読み込み。
- HERO の大見出しは名前（`profile.name`）そのもの。

## Components
| コンポーネント | クラス | 要点 |
|---|---|---|
| ヘッダー | `.site-header` | sticky・不透明。スクロールすると下線（`.is-scrolled`） |
| ロゴ / HERO アイコン | `.brand-mark` `.hero-art` | 5HKT アイコン（[js/icon.js](js/icon.js)）。`ICON` で `letterpress`（墨の活版刷り・升目に 5H/KT を白抜き）/ `dot`（5×7 ドット）を切替。文字はアウトライン（[js/icon-glyphs.js](js/icon-glyphs.js)）なのでフォント待ち無し。ファビコンは `assets/icon/` |
| HERO | `.hero` | 名前の大見出し、肩書、紹介文、ボタン、実績を1行（`.facts`）で控えめに |
| カード | `.card` | 四角・細罫線。画像なしは英題の頭文字（イタリック）+ 朱の四角の色面。hover で枠が濃くなり、頭文字が傾く。タグは「A / B / C」の文字列 |
| 自宅サーバー / AI 運用 | `#homelab` `#ai` | リード → 構成図（[js/diagrams.js](js/diagrams.js)、段と矢印を HTML+CSS で描く）→ `groups` を3列（狭幅で1列）→ タグ。データが無ければセクションごと非表示 |
| 作品の詳細 | `.work-dialog` | カードを押す（Enter/Space も可）と `<dialog>` で全文・タグ・リンクを表示。背景か × か Esc で閉じる |
| 各種リンク | `.contact-row` | 罫線区切りの行。hover で右へずれる |
| フッター | `.site-footer` | 墨色の帯。大きなワードマーク、旧デザインへのリンク、© |

## Motion
- 出現: `.hero-in`（読み込み時、`--d` で時差）/ `.reveal` → `.is-in`（IntersectionObserver、`--i` で時差）。
  `html.js` のときだけ隠してから出すので、JS 無効でも中身は見える。
- HERO アイコン: 活版は版が紙に降りて一度沈んでから落ち着く（`press`）。ドットは升目を1つずつ打つ（`dot-in`）。
- `prefers-reduced-motion: reduce` ではすべて停止（点は静止した状態で描画）。

## Responsive
`≤960px` カード2列・Homelab 1列 / `≤760px` HERO 1列（アートを上に）/ `≤640px` ナビ非表示・カード1列。

---

# 旧デザイン（`/classic/`）

以下は旧デザイン（ピクセル調）の仕様。2026-10 の改修で**背景のドット柄を外した**状態で `/classic/` に移した。
実体: [css/classic.css](css/classic.css) / [js/classic-main.js](js/classic-main.js) / [js/classic-works.js](js/classic-works.js) / [js/render.js](js/render.js)

## Design Tokens

CSS 変数として `.pf-root` に定義（[css/classic.css](css/classic.css)）。ダークは `@media (prefers-color-scheme: dark)` で上書き（OS 追従、手動トグル無し）。

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

> 当初ハンドオフのアクセントはティール `#007367` だったが、本実装では**ネイビー `#003672`** に変更（`--accent` と `--brand` を同値）。

### Colors（ダーク）
`--bg:#141417` / `--panel:#1c1e25` / `--ink:#e2e7e7` / `--soft:#838e9a` / `--border:#5f6579` / `--brand:#4f93d6` / `--accent:#4f93d6` / `--accent-ink:#141417` / `--badge:#1c1e25` / `--period:rgba(0,67,122,.32)` / `--checker-a:#1c1e25` / `--checker-b:#141417`

### 背景
フラットな `--bg`（以前あったドットグリッドは 2026-10 に削除）。

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

## Interactions（[js/classic-main.js](js/classic-main.js)）
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

### アクセント色 / HEROアニメ等 — [js/classic-main.js](js/classic-main.js) 冒頭 `CONFIG`
| キー | 説明 |
|---|---|
| `heroFx` | `'wave'`/`'matrix'`/`'scan'` |
| `accent` | アクセント色の上書き（`''`=CSSトークン既定の `#003672`） |
| `avatarImage` | HEROアバター画像/GIFパス（`''`でキャンバスアニメ） |
| `showHighlights` | バッジ表示 |

> 恒久的に色を変える場合は [css/classic.css](css/classic.css) の `.pf-root` トークンを直接編集（ダークは `@media` 側）。`CONFIG.accent` はライト/ダーク両方を inline で上書きする手段。

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
[works/index.html](works/index.html) + [js/classic-works.js](js/classic-works.js)。`webapps` を**全件**密グリッド（`.pf-works-grid`）で列挙し、
タグチップ（`.pf-filter`）で絞り込み。トップの「抜粋＋タイムライン」とは独立して共存（トップに `/works` 導線）。
大量表示でも軽量にするため、画像 `loading="lazy"` ＋ カード `content-visibility:auto`。

---

## ファイル構成（旧デザイン時点。現在の構成は README.md）
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
