// ─────────────────────────────────────────────────────────────
//  /works — 作成Webアプリの全件一覧（タグ絞り込み付き）
//  トップの「抜粋＋タイムライン」とは別に、成果物を密グリッドで列挙。
//  データは data/portfolio.json（store.load）を1回 fetch するだけ。
// ─────────────────────────────────────────────────────────────
import { store } from './portfolio-data.js';
import { esc, resolve, appCardHTML } from './render.js';

const state = { lang: 'ja', filter: null }; // filter: null=ALL / 文字列=タグ名
try { const s = localStorage.getItem('pf_lang'); if (s === 'ja' || s === 'en') state.lang = s; } catch (e) {}

const $ = (id) => document.getElementById(id);

function i18n(ja) {
  return {
    nav: { webapps: ja ? '作成Webアプリ' : 'Web Apps', student: ja ? '学生活動' : 'Student Activities', research: ja ? '研究活動' : 'Research', contact: ja ? '連絡先' : 'Contact' },
    title: ja ? '作品一覧' : 'All Works',
    lead: ja ? '個人または少人数チームで企画から実装まで担当した、作成Webアプリの全一覧です。' : 'Every web app I built — solo or with a small team, from planning to implementation.',
    back: ja ? '◂ トップにもどる' : '◂ Back to Home',
    all: ja ? 'すべて' : 'All',
    count: (n) => ja ? `全 ${n} 件` : `${n} works`,
    empty: ja ? '該当する作品がありません。' : 'No works match this filter.',
    pickup: 'PICK UP', noimage: 'No Image',
    footer: ja ? 'このサイトは静的HTML / CSS / JSのみで構築されています。' : 'Built with plain HTML, CSS, and JavaScript.',
  };
}

// webapps[].tags をユニーク化（登場順）
function uniqueTags(apps) {
  const seen = new Set(), out = [];
  apps.forEach((a) => (a.tags || []).forEach((tg) => { if (!seen.has(tg)) { seen.add(tg); out.push(tg); } }));
  return out;
}

function render() {
  const ja = state.lang === 'ja';
  const t = i18n(ja);
  const d = store.get();

  document.documentElement.lang = state.lang;
  document.documentElement.setAttribute('data-lang', state.lang);

  // ヘッダー（トップの各セクションへ戻るリンク）
  const navItems = [
    { id: 'webapps', label: t.nav.webapps }, { id: 'student', label: t.nav.student },
    { id: 'research', label: t.nav.research }, { id: 'contact', label: t.nav.contact },
  ];
  $('pf-nav').innerHTML = navItems.map((n) => `<a href="../#${n.id}">${esc(n.label)}</a>`).join('');
  $('pf-lang').textContent = ja ? 'EN' : 'JA';

  // 見出し
  $('pf-works-title').textContent = t.title;
  $('pf-works-lead').textContent = t.lead;
  $('pf-works-back').textContent = t.back;
  document.title = `${t.title} — 5HKT`;

  const apps = d.webapps || [];

  // フィルタチップ（ALL + 各タグ）
  const tags = uniqueTags(apps);
  const chip = (label, value, on) => `<button type="button" class="pf-filter-chip${on ? ' pf-on' : ''}" data-tag="${value === null ? '' : esc(value)}">${esc(label)}</button>`;
  $('pf-works-filter').innerHTML =
    chip(t.all, null, state.filter === null) +
    tags.map((tg) => chip(tg, tg, state.filter === tg)).join('');

  // 絞り込み → 全件描画
  const shown = state.filter ? apps.filter((a) => (a.tags || []).includes(state.filter)) : apps;
  $('pf-works-count').textContent = t.count(shown.length);
  $('pf-works-body').innerHTML = shown.length
    ? shown.map((it) => appCardHTML(resolve(it, state.lang, t), t)).join('')
    : `<p class="pf-works-empty">${esc(t.empty)}</p>`;

  // フッター
  $('pf-footer-text').textContent = t.footer;
  $('pf-footer-copy').textContent = `© 2026 ${(d.profile && d.profile.name && (d.profile.name[state.lang] || d.profile.name.ja)) || ''}`;
}

async function init() {
  store.subscribe(render);
  render();
  await store.load();

  $('pf-lang').addEventListener('click', () => {
    state.lang = state.lang === 'ja' ? 'en' : 'ja';
    try { localStorage.setItem('pf_lang', state.lang); } catch (e) {}
    render();
  });
  // フィルタチップ（イベント委譲）
  $('pf-works-filter').addEventListener('click', (e) => {
    const el = e.target.closest('.pf-filter-chip'); if (!el) return;
    state.filter = el.dataset.tag ? el.dataset.tag : null;
    render();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
