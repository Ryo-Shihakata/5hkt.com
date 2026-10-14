// ─────────────────────────────────────────────────────────────
//  新デザイン — トップ / works 共用のヘルパ
//  言語・ヘッダー・フッター・スクロール表示アニメ・作品カード
//  （旧デザイン /classic は render.js / classic-*.js を使う）
// ─────────────────────────────────────────────────────────────
import { esc, L as Lof } from './render.js';
import { bindStyleSwitch } from './style-pref.js';
import { iconSVG } from './icon.js';

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
    nav: { works: ja ? '制作物' : 'Work', homelab: ja ? '自宅サーバー' : 'Homelab', contact: ja ? '連絡先' : 'Contact' },
    langBtn: ja ? 'EN' : '日本語',
    langLabel: ja ? 'Switch to English' : '日本語に切り替え',
    styleBtn: ja ? '旧デザイン' : 'Classic',
    styleFooter: ja ? '旧デザインで見る' : 'View the classic design',
    footer: ja ? 'このサイトは静的な HTML / CSS / JavaScript だけで作られています。' : 'Built with plain HTML, CSS, and JavaScript.',
    pickup: 'Pick up',
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
  $('footer-note').textContent = t.footer;
  $('footer-style').textContent = t.styleFooter;
  const name = d.profile ? L(d.profile.name) : '';
  $('footer-copy').textContent = `© 2026 ${name}`;
}

export function initChrome(onLang) {
  bindStyleSwitch();
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
  return `<article class="card reveal" style="--i:${i % 3}">
    ${coverHTML(raw, title)}
    <div class="card-body">
      <p class="card-meta">${raw.period ? `<span>${esc(raw.period)}</span>` : ''}${showPick && raw.featured ? `<span class="card-pick">${esc(t.pickup)}</span>` : ''}</p>
      <h3 class="card-title">${esc(title)}</h3>
      ${sub ? `<p class="card-sub">${esc(sub)}</p>` : ''}
      ${desc ? `<p class="card-desc${clamp ? ' is-clamped' : ''}">${br(desc)}</p>` : ''}
      ${tags.length ? `<ul class="card-tags">${tags.map((tg) => `<li>${esc(tg)}</li>`).join('')}</ul>` : ''}
      ${links.length ? `<div class="card-links">${links.map((l) => arrowLink(l.label, l.url)).join('')}</div>` : ''}
    </div>
  </article>`;
}

export const arrowLink = (label, url, cls = 'arrow-link') =>
  `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<span class="arr" aria-hidden="true">↗</span></a>`;
