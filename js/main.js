// ─────────────────────────────────────────────────────────────
//  新デザイン トップ — レンダリング + アニメーション
//  HERO（名前の大見出し / 5HKT アイコン）・実績の1行表記・
//  制作物の抜粋・自宅サーバー・連絡先・スクロールスパイ
// ─────────────────────────────────────────────────────────────
import { store } from './portfolio-data.js?v=20261014b';
import { $, esc, initWorkDialog, br, L, lang, common, renderChrome, initChrome, observeReveals, cardHTML, arrowLink } from './site.js?v=20261014b';
import { iconSVG } from './icon.js?v=20261014b';
import { homelabDiagram, aiDiagram } from './diagrams.js?v=20261014b';

function i18n(ja) {
  return {
    ...common(ja),
    seeWork: ja ? '制作物を見る' : 'See my work',
    works: {
      title: ja ? '制作物' : 'Work',
      lead: ja ? '個人または少人数チームで、企画から実装まで担当したアプリの抜粋です。' : 'A selection of apps I planned and built, solo or with a small team.',
      all: (n) => ja ? `すべての制作物を見る（${n}件）` : `View all ${n} projects`,
    },
    lab: { title: ja ? '自宅サーバー' : 'Homelab' },
    ai: { title: ja ? 'AI 運用' : 'How I work with AI' },
    contact: { title: ja ? '各種リンク' : 'Links' },
  };
}

const hasGroups = (sec) => !!(sec && (sec.groups || []).length);
const sectionsOf = (d) => ['works', ...['homelab', 'ai'].filter((k) => hasGroups(d[k])), 'contact'];

function renderLab(key, sec, title, diagram) {
  $(key).hidden = !hasGroups(sec);
  if (!hasGroups(sec)) return;
  $(`${key}-title`).textContent = title;
  $(`${key}-lead`).textContent = L(sec.lead);
  $(`${key}-diagram`).innerHTML = diagram;
  $(`${key}-grid`).innerHTML = sec.groups.map((g, i) => `<div class="lab-col reveal" style="--i:${i % 3}">
      <p class="lab-num">${String(i + 1).padStart(2, '0')}</p>
      <h3 class="lab-title">${esc(L(g.title))}</h3>
      <ul class="lab-list">${(g.items || []).map((it) => `<li>${esc(L(it))}</li>`).join('')}</ul>
    </div>`).join('');
  $(`${key}-tags`).innerHTML = (sec.tags || []).map((tg) => `<li>${esc(tg)}</li>`).join('');
}

// ─── メインレンダー ───────────────────────────────────────────
function render() {
  const ja = lang.value === 'ja';
  const t = i18n(ja);
  const d = store.get();
  const p = d.profile || {};

  renderChrome(t, d, { sections: sectionsOf(d) });
  markActive();

  // HERO
  const name = L(p.name), role = L(p.role);
  $('hero-title').innerHTML = `<span class="line"><span class="line-in" style="--d:0">${esc(name)}</span></span>`;
  $('hero-role').textContent = role;
  $('hero-lead').textContent = L(p.bio);
  $('hero-actions').innerHTML =
    `<a class="btn btn-primary" href="#works">${esc(t.seeWork)}</a>` +
    (p.links || []).map((l) => arrowLink(l.label, l.url, 'btn btn-ghost')).join('');
  document.title = name ? `${name} — 5HKT` : '5HKT — Portfolio';

  // 実績（目立たせず、1行で添える）
  $('facts').innerHTML = (d.highlights || []).map((h) =>
    `<div><dt>${esc(L(h.label))}</dt><dd>${esc(h.value)}</dd></div>`).join('');

  // WORKS（PICK UP のみ）
  const apps = d.webapps || [];
  $('works-title').textContent = t.works.title;
  $('works-lead').textContent = t.works.lead;
  $('works-grid').innerHTML = apps.filter((a) => a.featured).map((a, i) => cardHTML(a, t, { i, clamp: true })).join('');
  $('works-all').innerHTML = `${esc(t.works.all(apps.length))}<span class="arr" aria-hidden="true">→</span>`;

  // HOMELAB / AI 運用（同じ組み方: リード → 構成図 → 3列の箇条書き → タグ）
  renderLab('homelab', d.homelab, t.lab.title, homelabDiagram(ja));
  renderLab('ai', d.ai, t.ai.title, aiDiagram(ja));

  // CONTACT
  $('contact-title').innerHTML = br(t.contact.title);
  $('contact-list').innerHTML = (d.contact || []).map((c, i) => `<li class="reveal" style="--i:${i % 3}">
      <a class="contact-row" href="${esc(c.url)}" target="_blank" rel="noopener">
        <span class="contact-label">${esc(c.label)}</span>
        <span class="contact-sub">${esc(c.sub)}</span>
        <span class="arr" aria-hidden="true">↗</span>
      </a></li>`).join('');

  observeReveals();
}

// ─── スクロールスパイ ─────────────────────────────────────────
let active = '';
function markActive() {
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('is-active', a.dataset.id === active));
}
function initSpy() {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { active = e.target.id; markActive(); } });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['works', 'homelab', 'ai', 'contact'].forEach((id) => { const el = $(id); if (el) io.observe(el); });
}

// ─── HERO アート: 5HKT アイコン（出現の動きは CSS） ─────────────
function initHeroArt() {
  $('hero-art').innerHTML = iconSVG({ id: 'hero' });
}

// ─── 初期化 ───────────────────────────────────────────────────
async function init() {
  lang.load();
  store.subscribe(render);
  render();
  initChrome(render);
  initHeroArt();
  initWorkDialog(() => store.get().webapps || []);
  initSpy();
  await store.load();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
