// ─────────────────────────────────────────────────────────────
//  新デザイン /works — 作成Webアプリの全件一覧（タグ絞り込み付き）
//  データは data/portfolio.json（store.load）を1回 fetch するだけ。
// ─────────────────────────────────────────────────────────────
import { store } from './portfolio-data.js?v=20261014b';
import { $, esc, initWorkDialog, lang, common, renderChrome, initChrome, observeReveals, cardHTML } from './site.js?v=20261014b';

const state = { filter: null }; // null = すべて / 文字列 = タグ名

function i18n(ja) {
  return {
    ...common(ja),
    title: ja ? '制作物' : 'All work',
    lead: ja ? '個人または少人数チームで、企画から実装まで担当したWebアプリの一覧です。' : 'Every web app I planned and built, solo or with a small team.',
    back: ja ? 'トップへ' : 'Home',
    all: ja ? 'すべて' : 'All',
    count: (n) => ja ? `${n} 件` : `${n} ${n === 1 ? 'project' : 'projects'}`,
    empty: ja ? '該当する作品がありません。' : 'No projects match this filter.',
  };
}

// webapps[].tags をユニーク化（登場順）
function uniqueTags(apps) {
  const seen = new Set(), out = [];
  apps.forEach((a) => (a.tags || []).forEach((tg) => { if (!seen.has(tg)) { seen.add(tg); out.push(tg); } }));
  return out;
}

function render() {
  const t = i18n(lang.value === 'ja');
  const d = store.get();
  const extra = ['homelab', 'ai'].filter((k) => d[k] && (d[k].groups || []).length);

  renderChrome(t, d, { navBase: '../', sections: ['works', ...extra, 'contact'] });
  document.querySelector('#nav a[data-id="works"]')?.classList.add('is-active');

  $('works-back').innerHTML = `<span class="arr" aria-hidden="true">←</span>${esc(t.back)}`;
  $('works-title').textContent = t.title;
  $('works-lead').textContent = t.lead;
  document.title = `${t.title} — 5HKT`;

  const apps = d.webapps || [];
  const tags = uniqueTags(apps);
  if (state.filter && !tags.includes(state.filter)) state.filter = null;
  const chip = (label, value) => {
    const on = state.filter === value;
    return `<button type="button" class="filter-chip${on ? ' is-on' : ''}" aria-pressed="${on}" data-tag="${value === null ? '' : esc(value)}">${esc(label)}</button>`;
  };
  $('works-filter').innerHTML = chip(t.all, null) + tags.map((tg) => chip(tg, tg)).join('');

  const shown = state.filter ? apps.filter((a) => (a.tags || []).includes(state.filter)) : apps;
  $('works-count').textContent = t.count(shown.length);
  $('works-grid').innerHTML = shown.length
    ? shown.map((a, i) => cardHTML(a, t, { i, clamp: true, showPick: true })).join('')
    : `<p class="works-empty">${esc(t.empty)}</p>`;

  observeReveals();
}

async function init() {
  lang.load();
  store.subscribe(render);
  render();
  initChrome(render);
  initWorkDialog(() => store.get().webapps || []);
  $('works-filter').addEventListener('click', (e) => {
    const el = e.target.closest('.filter-chip'); if (!el) return;
    state.filter = el.dataset.tag || null;
    render();
  });
  await store.load();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
