# 5HKT — ピクセル・ポートフォリオサイト

ドット絵／ピクセル調の個人ポートフォリオ（1ページ静的サイト）。
プロフィール・作成Webアプリ・学生活動・研究活動・連絡先を、日英切替／ダークモード自動追従／タイムライン切替／HEROピクセルアニメ／簡易CMS付きで掲載します。

**ビルド不要・フレームワーク不使用（Vanilla HTML/CSS/JS）。** ES Modules を使うため、ローカル確認時は簡易HTTPサーバ経由で開いてください（`file://` 直開きでは module が読めません）。

## ファイル構成

```
5hkt.com/
├── index.html              # ページ骨格 + module 読み込み
├── css/
│   └── style.css           # Design Tokens（light/dark）+ 全コンポーネント
├── js/
│   ├── portfolio-data.js   # コンテンツ単一ソース + localStorage ストア
│   ├── main.js             # レンダリング / i18n / ダーク / スクロールスパイ / タイムライン / HEROキャンバス
│   └── cms.js              # 簡易CMS ドロワー（GUI編集 + JSON入出力）
├── assets/
│   └── fonts/              # セルフホスト woff2（Press Start 2P / VT323 / DotGothic16 ×2）
├── _headers                # Cloudflare Pages セキュリティヘッダー
├── _redirects              # Cloudflare Pages リダイレクト設定
└── README.md
```

> `design_handoff_pixel_portfolio/` はデザインリファレンス（実装の参照元）です。本番デプロイ対象には含めません。

---

## ローカルで確認する

```bash
# リポジトリのルートで簡易サーバを起動（どれか1つ）
python -m http.server 8000
# または
npx serve .
```

ブラウザで `http://localhost:8000/` を開く。

---

## コンテンツの編集方法

### A. サイト上の簡易CMSで編集（非エンジニア向け）

CMS は**一般訪問者には表示されません**。オーナーは URL に `?edit` を付けてアクセスします:
`https://5hkt.com/?edit`（解除は `?edit=off`）。詳細は [DESIGN.md](DESIGN.md#簡易cms-とアクセス制限jscmsjs)。

1. `?edit` 付きで開き、サイト右下の **「✎ 編集」** ボタンを押すとドロワーが開く
2. プロフィール／実績バッジ／各セクション項目／連絡先を編集（**自動で localStorage に保存**）
3. 項目は **追加・並べ替え（↑↓）・削除・PICK UP 切替** が可能
4. **「⬇ JSON書出」** で `portfolio.json` をダウンロード
5. ダウンロードした内容を `js/portfolio-data.js` の `DEFAULTS` に反映して commit すれば、全員に公開されます
   - （別端末で `「⬆ JSON読込」`すれば編集状態を復元できます）

> CMS の編集は閲覧中ブラウザの localStorage に保存される“下書き”です。**全公開するには JSON を書き出して `portfolio-data.js` に反映 → commit** してください。

### B. コードで直接編集（エンジニア向け）

`js/portfolio-data.js` の `DEFAULTS` を編集。各項目のフィールド:

```js
{ id, featured, title:{ja,en}, subtitle:{ja,en}, description:{ja,en},
  period, tags:[], image, links:[{label,url}] }
```

### サイト設定（HEROアニメ・アクセント色など）

`js/main.js` 冒頭の `CONFIG` を編集:

| キー | 説明 |
|---|---|
| `heroFx` | HEROアニメ `'wave'` / `'matrix'` / `'scan'` |
| `accent` | アクセント色（`''`=既定 / 例 `'#003672'`） |
| `avatarImage` | HEROアバターの画像/GIFパス（`''`でキャンバスアニメ） |
| `showHighlights` | 実績バッジの表示 |
| `showGrid` | 背景ドットグリッド |

---

## Cloudflare Pages へのデプロイ

### 方法 A — Git 連携（推奨）

1. このリポジトリを GitHub にプッシュ
2. Cloudflare Pages → **Connect to Git** → リポジトリを選択
3. ビルド設定:
   - **Framework preset**: None
   - **Build command**: (空白)
   - **Build output directory**: `/`（ルート）
4. デプロイ

### 方法 B — ドラッグ＆ドロップ

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
2. リポジトリのルート（`design_handoff_pixel_portfolio/` を除く）をアップロード

`_headers`（セキュリティヘッダー）と `_redirects` は Cloudflare Pages が自動で読み込みます。
