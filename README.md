# 5HKT Portfolio Site

## ファイル構成

```
5hkt-site/
├── index.html          # メインHTML
├── css/
│   └── style.css       # スタイルシート
├── js/
│   └── main.js         # JavaScript
├── fonts/              # ローカルフォントを置くフォルダ
├── _headers            # Cloudflare Pages セキュリティヘッダー
├── _redirects          # Cloudflare Pages リダイレクト設定
└── README.md
```

---

## Cloudflare Pages へのデプロイ手順

### 方法 A — ドラッグ＆ドロップ（最速）

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. **Workers & Pages** → **Create application** → **Pages** タブ
3. **"Upload assets"** を選択
4. このフォルダ全体をドラッグ＆ドロップ
5. デプロイ完了！

### 方法 B — Git 連携（推奨）

1. このフォルダを GitHub リポジトリにプッシュ
2. Cloudflare Pages → **Connect to Git** → リポジトリを選択
3. ビルド設定:
   - **Framework preset**: None
   - **Build command**: (空白)
   - **Build output directory**: `/` (ルート)
4. デプロイ！

---

## カスタマイズ方法

### ローカルフォント（5HKTロゴ用）を使う

1. フォントファイルを `fonts/` フォルダに置く（例: `5hkt-logo.woff2`）
2. `css/style.css` の先頭のコメントアウトを解除し、パスを修正:

```css
@font-face {
  font-family: 'YourFont';
  src: url('../fonts/yourfont.woff2') format('woff2');
}
```

3. `:root` の `--font-display` を変更:

```css
--font-display: 'YourFont', sans-serif;
```

### お問い合わせフォームのURLを設定する

`js/main.js` の最後のコメントアウト部分を編集:

```js
const contactBtn = document.getElementById('contact-btn');
contactBtn.href = 'https://forms.google.com/your-form-url';
```

または `index.html` の Contact セクションのリンクを直接編集:

```html
<a href="https://your-form-url" class="contact__btn" ...>
```

### アクセントカラーを変える

`css/style.css` の `:root` 内 `--accent` を変更:

```css
--accent: #c8ff00;  /* neon yellow-green → 好みの色に */
```

---

## コンテンツの編集箇所

| 場所 | 変更内容 |
|------|---------|
| `index.html` → `.hero__sub` | ヒーローのサブテキスト |
| `index.html` → `.about__lead` | 自己紹介キャッチコピー |
| `index.html` → `.about__body` | 自己紹介本文 |
| `index.html` → `.about__tags .tag` | スキルタグ |
| `index.html` → `.work-item` × 3 | 実績（タイトル・説明・年） |
| `index.html` → `#contact-btn` href | フォームURL |
| `index.html` → `.footer__copy` | フッター年 |
