// ─────────────────────────────────────────────────────────────
//  共有レンダリング ヘルパ（トップページ / works 一覧で共用）
// ─────────────────────────────────────────────────────────────

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// {ja,en} オブジェクトを指定言語へ解決
export const L = (o, lang) => (o && typeof o === 'object' && 'ja' in o) ? (o[lang] ?? o.ja) : (o ?? '');

// 生データ項目を「指定言語で解決済みのフラットな項目」へ
export function resolve(it, lang, t) {
  return {
    id: it.id, featured: !!it.featured, period: it.period,
    title: L(it.title, lang), subtitle: L(it.subtitle, lang), description: L(it.description, lang),
    image: it.image || '', noimage: t.noimage,
    tags: it.tags || [],
    links: (it.links || []).map((l) => ({ label: l.label, url: l.url })),
  };
}

// ─── 部分テンプレート ─────────────────────────────────────────
export const tagsHTML = (tags, extra = '') => `<div class="pf-tags${extra}">${tags.map((tg) => `<span class="pf-tag">${esc(tg)}</span>`).join('')}</div>`;

export const linksHTML = (links, cls) => links.map((l) => `<a class="pf-btn ${cls}" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');

export const cardImgHTML = (it) => it.image
  ? `<div class="pf-card-img"><img src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" decoding="async"></div>`
  : `<div class="pf-card-img"><span class="pf-card-noimg">${esc(it.noimage)}</span></div>`;

// Web アプリ カード（解決済み項目を受け取る）
export function appCardHTML(it, t) {
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
