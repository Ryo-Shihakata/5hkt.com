// ─────────────────────────────────────────────────────────────
//  ポートフォリオ コンテンツ ストア（単一ソース = data/portfolio.json）
//  ・公開コンテンツは data/portfolio.json が「正」。Sveltia CMS（/admin）が
//    GitHub に直 commit → Cloudflare Pages 自動デプロイ → ここが fetch で取得。
//  ・コードで直接メンテする場合も data/portfolio.json を編集してください。
//  項目フィールド: { id, featured, title{ja,en}, subtitle{ja,en}, description{ja,en},
//                   period, tags[], image, links[{label,url}] }
// ─────────────────────────────────────────────────────────────

// 取得失敗時にも UI が壊れないための空スケルトン
const EMPTY = { profile: { name: { ja: '', en: '' }, role: { ja: '', en: '' }, bio: { ja: '', en: '' }, links: [] }, highlights: [], webapps: [], student: [], research: [], contact: [] };

// data/portfolio.json の絶対URL（このモジュールからの相対 = /js → /data）
const DATA_URL = new URL('../data/portfolio.json', import.meta.url);

let data = EMPTY;
let loaded = null; // 多重ロード防止用 Promise

const subs = new Set();
const emit = () => { subs.forEach((f) => { try { f(data); } catch (e) {} }); };

export const store = {
  get() { return data; },
  set(next) { data = next; emit(); },
  mutate(fn) { fn(data); emit(); },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },

  // data/portfolio.json を1回だけ取得。複数ページ/呼出でも fetch は1度。
  load() {
    if (loaded) return loaded;
    loaded = fetch(DATA_URL, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((json) => { data = json; emit(); return data; })
      .catch((e) => { console.error('[portfolio] data/portfolio.json の読み込みに失敗:', e); data = EMPTY; emit(); return data; });
    return loaded;
  },
};

try { if (typeof window !== 'undefined') window.PortfolioStore = store; } catch (e) {}
