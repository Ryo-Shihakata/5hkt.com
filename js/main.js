// ─────────────────────────────────────────────────────────────
//  ピクセル・ポートフォリオ — レンダリング + インタラクション
//  i18n / ダーク（OS追従）/ スクロールスパイ / タイムライン切替 / HEROキャンバス
// ─────────────────────────────────────────────────────────────
import { store } from './portfolio-data.js';

// ─── サイト設定（必要に応じてここを編集） ──────────────────────
const CONFIG = {
  heroFx: 'wave',        // 'wave' | 'matrix' | 'scan'
  accent: '',            // '' = テーマ既定 / 例: '#003672' '#a23b2d' '#6b4ea0'
  avatarImage: '',       // HEROアバター画像/GIFのパス（'' でキャンバスアニメ）
  showHighlights: true,  // 実績バッジの表示
  showGrid: true,        // 背景ドットグリッド
};

// ─── 状態 ─────────────────────────────────────────────────────
const state = {
  lang: 'ja',
  appsView: 'featured',  // 'featured' | 'timeline'
  studView: 'featured',
  active: 'webapps',
};
try { const s = localStorage.getItem('pf_lang'); if (s === 'ja' || s === 'en') state.lang = s; } catch (e) {}

// ─── ヘルパ ───────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const L = (o) => (o && typeof o === 'object' && 'ja' in o) ? (o[state.lang] ?? o.ja) : (o ?? '');
const $ = (id) => document.getElementById(id);

function i18n(ja) {
  return {
    nav: { webapps: ja ? '作成Webアプリ' : 'Web Apps', student: ja ? '学生活動' : 'Student Activities', research: ja ? '研究活動' : 'Research', contact: ja ? '連絡先' : 'Contact' },
    apps: { title: ja ? '作成Webアプリ' : 'Web Apps', lead: ja ? '個人または少人数チームで企画から実装まで担当したアプリです。' : 'Apps I planned and built, solo or with a small team.' },
    student: { title: ja ? '学生活動' : 'Student Activities', lead: ja ? 'サークル・委員会・イベント運営など、学生として取り組んできた活動です。' : "Clubs, committees, and events I've been involved in as a student." },
    research: { title: ja ? '研究活動' : 'Research', lead: ja ? '研究室での研究テーマや、学会発表・論文の記録です。' : 'My research topics, conference talks, and papers.' },
    contact: { title: ja ? '連絡先' : 'Get in touch', lead: ja ? 'ご連絡はお気軽にどうぞ。' : 'Feel free to reach out anytime.' },
    pickup: 'PICK UP', noimage: 'No Image',
    viewTimeline: ja ? '▸ 全履歴をタイムラインで見る' : '▸ View Full Timeline',
    backFeatured: ja ? '◂ 抜粋表示にもどる' : '◂ Back to Highlights',
    footer: ja ? 'このサイトは静的HTML / CSS / JSのみで構築されています。' : 'Built with plain HTML, CSS, and JavaScript.',
  };
}

// ─── アイテム解決 ─────────────────────────────────────────────
function resolve(it, t) {
  return {
    id: it.id, featured: !!it.featured, period: it.period,
    title: L(it.title), subtitle: L(it.subtitle), description: L(it.description),
    image: it.image || '', noimage: t.noimage,
    tags: it.tags || [],
    links: (it.links || []).map((l) => ({ label: l.label, url: l.url })),
  };
}

// ─── 部分テンプレート ─────────────────────────────────────────
const tagsHTML = (tags, extra = '') => `<div class="pf-tags${extra}">${tags.map((tg) => `<span class="pf-tag">${esc(tg)}</span>`).join('')}</div>`;
const linksHTML = (links, cls) => links.map((l) => `<a class="pf-btn ${cls}" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
const cardImgHTML = (it) => it.image
  ? `<div class="pf-card-img"><img src="${esc(it.image)}" alt="${esc(it.title)}"></div>`
  : `<div class="pf-card-img"><span class="pf-card-noimg">${esc(it.noimage)}</span></div>`;

function appCardHTML(it, t) {
  return `<article class="pf-card">
    ${cardImgHTML(it)}
    <div class="pf-card-body">
      ${it.featured ? `<span class="pf-pickup">${esc(t.pickup)}</span>` : ''}
      <span class="pf-period">${esc(it.period)}</span>
      <h3 class="pf-card-title">${esc(it.title)}</h3>
      ${it.subtitle ? `<p class="pf-card-sub">${esc(it.subtitle)}</p>` : ''}
      <p class="pf-card-desc">${esc(it.description)}</p>
      ${tagsHTML(it.tags)}
      ${it.links.length ? `<div class="pf-card-links">${linksHTML(it.links, 'pf-btn-sm')}</div>` : ''}
    </div>
  </article>`;
}

function studCardHTML(it, t) {
  return `<article class="pf-card">
    ${cardImgHTML(it)}
    <div class="pf-card-body">
      ${it.featured ? `<span class="pf-pickup">${esc(t.pickup)}</span>` : ''}
      <span class="pf-period">${esc(it.period)}</span>
      <h3 class="pf-card-title">${esc(it.title)}</h3>
      <p class="pf-card-desc">${esc(it.description)}</p>
      ${tagsHTML(it.tags, ' pf-tags-bottom')}
    </div>
  </article>`;
}

function timelineHTML(items, t) {
  const entries = items.map((it) => `<div class="pf-timeline-entry">
      <div class="pf-timeline-node"></div>
      <div class="pf-timeline-card">
        <div class="pf-timeline-head">
          <span class="pf-period">${esc(it.period)}</span>
          ${it.featured ? `<span class="pf-timeline-pickup">${esc(t.pickup)}</span>` : ''}
        </div>
        <h3 class="pf-timeline-title">${esc(it.title)}</h3>
        ${it.subtitle ? `<p class="pf-timeline-sub">${esc(it.subtitle)}</p>` : ''}
        <p class="pf-timeline-desc">${esc(it.description)}</p>
        ${it.tags.length ? tagsHTML(it.tags) : ''}
        ${it.links.length ? `<div class="pf-research-links">${linksHTML(it.links, 'pf-btn-sm')}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="pf-timeline"><div class="pf-timeline-line"></div>${entries}</div>`;
}

function researchCardHTML(it) {
  return `<div class="pf-research-card">
    <div class="pf-research-period">${esc(it.period)}</div>
    <div class="pf-research-body">
      <h3 class="pf-research-title">${esc(it.title)}</h3>
      <p class="pf-research-desc">${esc(it.description)}</p>
      ${it.tags.length ? tagsHTML(it.tags) : ''}
      ${it.links.length ? `<div class="pf-research-links">${linksHTML(it.links, 'pf-btn-sm')}</div>` : ''}
    </div>
  </div>`;
}

// ─── メインレンダー ───────────────────────────────────────────
function render() {
  const ja = state.lang === 'ja';
  const t = i18n(ja);
  const d = store.get();

  // 言語属性（フォント切替は CSS の html[data-lang]）
  document.documentElement.lang = state.lang;
  document.documentElement.setAttribute('data-lang', state.lang);

  // ヘッダー
  const navItems = [
    { id: 'webapps', label: t.nav.webapps }, { id: 'student', label: t.nav.student },
    { id: 'research', label: t.nav.research }, { id: 'contact', label: t.nav.contact },
  ];
  $('pf-nav').innerHTML = navItems.map((n) => `<a href="#${n.id}" data-id="${n.id}" class="${state.active === n.id ? 'pf-active' : ''}">${esc(n.label)}</a>`).join('');
  $('pf-lang').textContent = ja ? 'EN' : 'JA';

  // HERO / プロフィール
  const p = d.profile;
  $('pf-name').textContent = L(p.name);
  $('pf-role').textContent = L(p.role);
  $('pf-bio').textContent = L(p.bio);
  $('pf-hero-links').innerHTML = linksHTML((p.links || []).map((l) => ({ label: l.label, url: l.url })), '');
  $('pf-hero-cap').textContent = CONFIG.avatarImage ? '' : (ja ? 'GIF / 写真をドロップ' : 'DROP GIF / PHOTO');
  document.title = `${L(p.name)} — Portfolio`;

  // WEB APPS
  $('pf-apps-title').textContent = t.apps.title;
  $('pf-apps-lead').textContent = t.apps.lead;
  const highlights = (d.highlights || []).map((h) => ({ value: h.value, label: L(h.label) }));
  $('pf-highlights').innerHTML = (CONFIG.showHighlights && highlights.length)
    ? `<div class="pf-highlights">${highlights.map((h) => `<div class="pf-badge"><span class="pf-badge-val">${esc(h.value)}</span><span class="pf-badge-lb">${esc(h.label)}</span></div>`).join('')}</div>`
    : '';
  const webapps = (d.webapps || []).map((it) => resolve(it, t));
  $('pf-apps-body').innerHTML = state.appsView === 'timeline'
    ? timelineHTML(webapps, t)
    : `<div class="pf-grid">${webapps.filter((a) => a.featured).map((a) => appCardHTML(a, t)).join('')}</div>`;
  $('pf-apps-toggle').textContent = state.appsView === 'timeline' ? t.backFeatured : t.viewTimeline;

  // STUDENT
  $('pf-stud-title').textContent = t.student.title;
  $('pf-stud-lead').textContent = t.student.lead;
  const student = (d.student || []).map((it) => resolve(it, t));
  $('pf-stud-body').innerHTML = state.studView === 'timeline'
    ? timelineHTML(student, t)
    : `<div class="pf-grid">${student.filter((a) => a.featured).map((a) => studCardHTML(a, t)).join('')}</div>`;
  $('pf-stud-toggle').textContent = state.studView === 'timeline' ? t.backFeatured : t.viewTimeline;

  // RESEARCH
  $('pf-research-title').textContent = t.research.title;
  $('pf-research-lead').textContent = t.research.lead;
  $('pf-research-body').innerHTML = (d.research || []).map((it) => researchCardHTML(resolve(it, t))).join('');

  // CONTACT
  $('pf-contact-title').textContent = t.contact.title;
  $('pf-contact-lead').textContent = t.contact.lead;
  $('pf-contact-body').innerHTML = (d.contact || []).map((c) => `<a class="pf-contact-card" href="${esc(c.url)}" target="_blank" rel="noopener">
      <span class="pf-contact-label">${esc(c.label)}</span>
      <span class="pf-contact-sub">${esc(c.sub)}</span>
      <span class="pf-contact-open">OPEN ▸</span>
    </a>`).join('');

  // FOOTER
  $('pf-footer-text').textContent = t.footer;
  $('pf-footer-copy').textContent = `© 2026 ${L(p.name)}`;
}

// ─── スクロールスパイ（ナビ active のみ更新） ────────────────
function setActive(id) {
  if (state.active === id) return;
  state.active = id;
  document.querySelectorAll('#pf-nav a').forEach((a) => a.classList.toggle('pf-active', a.dataset.id === id));
}
function initSpy() {
  const ids = ['webapps', 'student', 'research', 'contact'];
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ids.forEach((id) => { const el = $(id); if (el) io.observe(el); });
}

// ─── テーマ適用（アクセント / グリッド） ─────────────────────
function applyTheme() {
  const el = $('pf-root');
  if (CONFIG.accent) { el.style.setProperty('--accent', CONFIG.accent); el.style.setProperty('--brand', CONFIG.accent); }
  el.classList.toggle('pf-nogrid', CONFIG.showGrid === false);
}

// ─── HERO キャンバスアニメ ────────────────────────────────────
let _raf = null;
function startHero() {
  const cv = $('pf-canvas'), root = $('pf-root');
  if (!cv || !root) return;
  if (CONFIG.avatarImage) {
    cv.style.display = 'none';
    if (!cv._imgInserted) {
      const img = document.createElement('img');
      img.className = 'pf-avatar-img'; img.src = CONFIG.avatarImage; img.alt = '';
      cv.parentNode.insertBefore(img, cv);
      cv._imgInserted = true;
    }
    return;
  }
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const fx = CONFIG.heroFx || 'wave';
  const t0 = performance.now();
  const draw = (now) => {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const w = cv.width, h = cv.height, t = (now - t0) / 1000, u = dpr;
    const cs = getComputedStyle(root);
    const accent = (cs.getPropertyValue('--accent') || '#007367').trim();
    const ink = (cs.getPropertyValue('--ink') || '#0d2540').trim();
    const period = (cs.getPropertyValue('--period') || '#79b2f2').trim();
    ctx.clearRect(0, 0, w, h);
    if (fx === 'matrix') {
      const col = 15 * u, cols = Math.ceil(w / col);
      for (let i = 0; i < cols; i++) {
        const seed = (i * 73) % 37, sp = (38 + seed * 4) * u;
        const head = ((t * sp) % (h + 220 * u)) - 110 * u;
        for (let k = 0; k < 14; k++) {
          const y = head - k * col; if (y < 0 || y > h) continue;
          ctx.globalAlpha = Math.max(0, (14 - k) / 14) * 0.9;
          ctx.fillStyle = k === 0 ? ink : accent;
          const sz = col * 0.66; ctx.fillRect(i * col + (col - sz) / 2, y, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    } else if (fx === 'scan') {
      const c = 18 * u, bandY = ((t * 70 * u) % (h + 120 * u)) - 60 * u;
      for (let gx = 0; gx * c < w; gx++) for (let gy = 0; gy * c < h; gy++) {
        const x = gx * c, y = gy * c, checker = (gx + gy) % 2 === 0;
        const tw = Math.sin(gx * 12.9 + gy * 78.2 + t * 2) * 0.5 + 0.5;
        let a = (checker ? 0.12 : 0) + tw * 0.10;
        const dd = Math.abs(y + c / 2 - bandY); if (dd < c * 1.6) a += (1 - dd / (c * 1.6)) * 0.6;
        if (a <= 0.02) continue;
        ctx.globalAlpha = Math.min(0.9, a); ctx.fillStyle = (gx + gy) % 3 === 0 ? period : accent;
        ctx.fillRect(x + 1, y + 1, c - 2, c - 2);
      }
      ctx.globalAlpha = 1;
    } else {
      const cell = 22 * u;
      for (let gx = 0; gx * cell < w; gx++) for (let gy = 0; gy * cell < h; gy++) {
        const x = gx * cell, y = gy * cell;
        const v = Math.sin(gx * 0.55 + gy * 0.42 + t * 1.5) * 0.5 + 0.5;
        const v2 = Math.sin(gx * 0.9 - gy * 0.3 + t * 0.9) * 0.5 + 0.5;
        let col;
        if (v > 0.72) col = accent; else if (v > 0.42) col = period; else col = v2 > 0.6 ? accent : null;
        ctx.fillStyle = period; ctx.globalAlpha = 0.18; ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
        if (col) {
          const sz = (8 + v * (cell - 12));
          ctx.globalAlpha = 0.55 + v * 0.45; ctx.fillStyle = col;
          ctx.fillRect(x + (cell - sz) / 2, y + (cell - sz) / 2, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    }
    _raf = requestAnimationFrame(draw);
  };
  _raf = requestAnimationFrame(draw);
}

// ─── 初期化 ───────────────────────────────────────────────────
function init() {
  applyTheme();
  render();
  store.subscribe(render);

  $('pf-lang').addEventListener('click', () => {
    state.lang = state.lang === 'ja' ? 'en' : 'ja';
    try { localStorage.setItem('pf_lang', state.lang); } catch (e) {}
    render();
  });
  $('pf-apps-toggle').addEventListener('click', () => {
    state.appsView = state.appsView === 'timeline' ? 'featured' : 'timeline';
    render();
  });
  $('pf-stud-toggle').addEventListener('click', () => {
    state.studView = state.studView === 'timeline' ? 'featured' : 'timeline';
    render();
  });

  initSpy();
  startHero();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
