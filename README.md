# 5HKT — ピクセル・ポートフォリオサイト

ドット絵／ピクセル調の個人ポートフォリオ（1ページ静的サイト）。
プロフィール・作成Webアプリ・学生活動・研究活動・連絡先を、日英切替／ダークモード自動追従／タイムライン切替／HEROピクセルアニメ付きで掲載。作成Webアプリは `/works` で全件一覧、編集は **Sveltia CMS（GitHub連携・1クリック公開）** で行います。

**ビルド不要・フレームワーク不使用（Vanilla HTML/CSS/JS）。** ES Modules を使うため、ローカル確認時は簡易HTTPサーバ経由で開いてください（`file://` 直開きでは module が読めません）。

## ファイル構成

```
5hkt.com/
├── index.html              # トップ（抜粋＋タイムライン）
├── works/
│   └── index.html          # /works — 作成Webアプリの全件一覧
├── data/
│   └── portfolio.json      # コンテンツ単一ソース（Sveltia CMS が編集）
├── admin/
│   ├── index.html          # Sveltia CMS（/admin）
│   └── config.yml          # CMS 設定（編集対象・GitHub連携）
├── css/
│   └── style.css           # Design Tokens（light/dark）+ 全コンポーネント
├── js/
│   ├── portfolio-data.js   # store：data/portfolio.json を fetch する単一ソース層
│   ├── render.js           # 共有レンダリング ヘルパ（トップ / works 共用）
│   ├── main.js             # トップのレンダリング / i18n / ダーク / スパイ / タイムライン / HEROキャンバス
│   └── works.js            # /works のレンダリング（全件 + タグ絞り込み）
├── assets/
│   ├── fonts/              # セルフホスト woff2（Press Start 2P / VT323 / DotGothic16 ×2）
│   └── uploads/            # CMS からの画像アップロード先
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

コンテンツの単一ソースは **`data/portfolio.json`** です。トップ・`/works` の両方がこれを読み込みます。

### A. Sveltia CMS で編集（推奨・非エンジニア向け）

`https://5hkt.com/admin/` を開き、GitHub でログイン → GUI で編集 → **「公開（Publish）」** を押すと、
`data/portfolio.json` が GitHub に commit され、Cloudflare Pages が自動デプロイして本番に反映されます。**手動 commit は不要**です。

- 編集できる内容: プロフィール / 実績バッジ / 作成Webアプリ / 学生活動 / 研究活動 / 連絡先
- 各項目は **追加・並べ替え・削除・PICK UP（featured）切替**・画像アップロードが可能

> 初回のみ GitHub 認証用の OAuth Worker のセットアップが必要です（下記）。

### B. コードで直接編集（エンジニア向け）

`data/portfolio.json` を直接編集して commit。各項目のフィールド:

```json
{ "id": "", "featured": false, "title": {"ja":"","en":""}, "subtitle": {"ja":"","en":""},
  "description": {"ja":"","en":""}, "period": "", "tags": [], "image": "", "links": [{"label":"","url":""}] }
```

---

## Sveltia CMS のセットアップ（GitHub 認証 / 初回のみ）

Sveltia CMS が GitHub に commit するには OAuth が必要です。Cloudflare に公式の認証 Worker を一度だけ用意します。

1. **GitHub OAuth App を作成**: GitHub → Settings → Developer settings → **OAuth Apps** → New
   - Authorization callback URL: `https://<あなたのWorker>.workers.dev/callback`
   - 発行された **Client ID / Client Secret** を控える
2. **認証 Worker をデプロイ**: [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) を Cloudflare Workers にデプロイし、
   環境変数に `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`（必要に応じて `ALLOWED_DOMAINS=5hkt.com`）を設定
3. **config.yml を更新**: [admin/config.yml](admin/config.yml) の `backend.base_url` を、デプロイした Worker の URL に置き換えて commit
4. `https://5hkt.com/admin/` を開き「Login with GitHub」→ 編集 → Publish で公開完了

> `_headers` の `X-Frame-Options: DENY` のままで動作します（認証はポップアップ方式）。

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
