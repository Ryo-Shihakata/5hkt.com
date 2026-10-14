// ─────────────────────────────────────────────────────────────
//  新デザイン — トップ / works 共用のヘルパ
//  言語・ヘッダー・フッター・スクロール表示アニメ・作品カード
//  （旧デザイン /classic は render.js / classic-*.js を使う）
// ─────────────────────────────────────────────────────────────
import { esc, L as Lof } from './render.js?v=20261014b';
import { iconSVG } from './icon.js?v=20261014b';

export { esc };
export const $ = (id) => document.getElementById(id);

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── 言語（旧デザインと同じ localStorage['pf_lang'] を共有） ──
export const lang = {
  value: 'ja',
  load() { try { const s = localStorage.getItem('pf_lang'); if (s === 'ja' || s === 'en') this.value = s; } catch (e) {} },
  toggle() {
    this.value = this.value === 'ja' ? 'en' : 'ja';
    try { localStorage.setItem('pf_lang', this.value); } catch (e) {}
  },
};
export const L = (o) => Lof(o, lang.value);

// 改行を <br> に（テキストは必ずエスケープしてから）
export const br = (s) => esc(s).replace(/\n/g, '<br>');

// ─── 共通の文言 ───────────────────────────────────────────────
export function common(ja) {
  return {
    nav: { works: ja ? '制作物' : 'Work', homelab: ja ? '自宅サーバー' : 'Homelab', ai: ja ? 'AI 運用' : 'AI', contact: ja ? 'リンク' : 'Links' },
    langBtn: ja ? 'EN' : '日本語',
    langLabel: ja ? 'Switch to English' : '日本語に切り替え',
    styleBtn: ja ? '旧デザイン' : 'Classic',
    styleFooter: ja ? '旧デザインで見る' : 'View the classic design',
    pickup: 'Pick up',
    more: ja ? '詳しく見る' : 'Details',
  };
}

// ─── ヘッダー / フッター ──────────────────────────────────────
// navBase: トップなら ''、/works なら '../'（アンカーの前に付ける）
export function renderChrome(t, d, { navBase = '', sections = [] } = {}) {
  document.documentElement.lang = lang.value;
  $('nav').innerHTML = sections
    .map((id) => `<a href="${navBase}#${id}" data-id="${id}">${esc(t.nav[id])}</a>`).join('');
  $('lang').textContent = t.langBtn;
  $('lang').setAttribute('aria-label', t.langLabel);
  $('style-switch').textContent = t.styleBtn;
  $('footer-style').textContent = t.styleFooter;
  const name = d.profile ? L(d.profile.name) : '';
  $('footer-copy').textContent = `© 2026 ${name}`;
}

export function initChrome(onLang) {
  // ヘッダーのロゴ = 5HKT アイコンの小さい版（かすれ等は省く）
  $('brand-mark').innerHTML = iconSVG({ id: 'bm', texture: false });
  $('lang').addEventListener('click', () => { lang.toggle(); onLang(); });
  // スクロールしたらヘッダーに下線とすりガラス
  const header = $('site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── スクロールで現れる（.reveal → .is-in） ───────────────────
let io = null;
export function observeReveals(root = document) {
  const els = root.querySelectorAll('.reveal:not(.is-in)');
  if (!('IntersectionObserver' in window) || reduceMotion()) { els.forEach((el) => el.classList.add('is-in')); return; }
  if (!io) {
    io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }
  els.forEach((el) => io.observe(el));
}

// ─── 作品カード ───────────────────────────────────────────────
const TONES = 5;
const toneOf = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % TONES; };

// 画像が無い作品は、英題の頭文字を大きく置いた色面を表紙にする
function coverHTML(raw, title) {
  if (raw.image) {
    return `<div class="card-cover"><img src="${esc(raw.image)}" alt="${esc(title)}" loading="lazy" decoding="async"></div>`;
  }
  const glyph = String(Lof(raw.title, 'en') || title || '?').trim().charAt(0).toUpperCase();
  return `<div class="card-cover tone-${toneOf(raw.id)}" aria-hidden="true"><span class="cover-glyph">${esc(glyph)}</span><span class="cover-dot"></span></div>`;
}

// raw: portfolio.json の webapps[] 要素 / i: 並び順（現れる時差に使う）
export function cardHTML(raw, t, { i = 0, clamp = false, showPick = false } = {}) {
  const title = L(raw.title), sub = L(raw.subtitle), desc = L(raw.description);
  const tags = raw.tags || [], links = raw.links || [];
  // カード全体を押すと詳細ダイアログ（initWorkDialog）。中のリンクはそのまま開く
  return `<article class="card reveal" style="--i:${i % 3}" data-id="${esc(raw.id)}" tabindex="0" role="button" aria-haspopup="dialog" aria-label="${esc(title)}">
    ${coverHTML(raw, title)}
    <div class="card-body">
      <p class="card-meta">${raw.period ? `<span>${esc(raw.period)}</span>` : ''}${showPick && raw.featured ? `<span class="card-pick">${esc(t.pickup)}</span>` : ''}</p>
      <h3 class="card-title">${esc(title)}</h3>
      ${sub ? `<p class="card-sub">${esc(sub)}</p>` : ''}
      ${desc ? `<p class="card-desc${clamp ? ' is-clamped' : ''}">${br(desc)}</p>` : ''}
      ${tags.length ? `<ul class="card-tags">${tags.map((tg) => `<li>${esc(tg)}</li>`).join('')}</ul>` : ''}
      <div class="card-links">${links.map((l) => arrowLink(l.label, l.url)).join('')}<span class="card-more">${esc(t.more)}</span></div>
    </div>
  </article>`;
}

// ─── 作品の詳細ダイアログ ─────────────────────────────────────
let dlg = null;
let getApps = () => [];

function detailHTML(raw) {
  const ja = lang.value === 'ja';
  const title = L(raw.title), sub = L(raw.subtitle), desc = L(raw.description);
  const tags = raw.tags || [], links = raw.links || [];
  return `<div class="wd-inner">
    <button type="button" class="wd-close" data-close aria-label="${ja ? '閉じる' : 'Close'}">×</button>
    ${coverHTML(raw, title)}
    <div class="wd-body">
      ${raw.period ? `<p class="card-meta"><span>${esc(raw.period)}</span></p>` : ''}
      <h2 class="wd-title" id="wd-title">${esc(title)}</h2>
      ${sub ? `<p class="wd-sub">${esc(sub)}</p>` : ''}
      ${desc ? `<p class="wd-desc">${br(desc)}</p>` : ''}
      ${tags.length ? `<ul class="card-tags">${tags.map((tg) => `<li>${esc(tg)}</li>`).join('')}</ul>` : ''}
      ${links.length ? `<div class="wd-links">${links.map((l) => arrowLink(l.label, l.url, 'btn btn-ghost')).join('')}</div>` : ''}
    </div>
  </div>`;
}

function openWork(id) {
  const raw = getApps().find((a) => a.id === id);
  if (!raw || !dlg) return;
  dlg.innerHTML = detailHTML(raw);
  dlg.showModal();
  document.documentElement.classList.add('is-locked');
  dlg.querySelector('.wd-close').focus();
}

// apps: 現在のデータの webapps[] を返す関数（言語切替・データ更新後も最新を引く）
export function initWorkDialog(apps) {
  getApps = apps;
  dlg = document.createElement('dialog');
  dlg.className = 'work-dialog';
  dlg.setAttribute('aria-labelledby', 'wd-title');
  document.body.appendChild(dlg);
  // 背景（dialog 自身）か × を押したら閉じる
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  dlg.addEventListener('close', () => document.documentElement.classList.remove('is-locked'));
  document.addEventListener('click', (e) => {
    if (e.target.closest('a') || dlg.contains(e.target)) return;
    const card = e.target.closest('.card[data-id]');
    if (card) openWork(card.dataset.id);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.card[data-id]')) {
      e.preventDefault();
      openWork(e.target.dataset.id);
    }
  });
}

export const arrowLink = (label, url, cls = 'arrow-link') =>
  `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<span class="arr" aria-hidden="true">↗</span></a>`;
