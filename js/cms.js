// ─────────────────────────────────────────────────────────────
//  簡易CMS — 右下「✎編集」ドロワー（GUI編集 + JSON入出力 + localStorage）
//  非エンジニアでも GUI でメンテ可能。編集は store.mutate で即 localStorage 保存。
// ─────────────────────────────────────────────────────────────
import { store } from './portfolio-data.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const attr = (s) => String(s ?? '').replace(/"/g, '&quot;');

// ─── パーサ ───────────────────────────────────────────────────
function parsePairs(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const p = l.split('|').map((s) => (s || '').trim());
    return { label: p[0] || '', url: p[1] || '#' };
  });
}
function parseTriples(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const p = l.split('|').map((s) => (s || '').trim());
    return { label: p[0] || '', sub: p[1] || '', url: p[2] || '#' };
  });
}

// ─── スタイル注入 ─────────────────────────────────────────────
const STYLE = `
.pf-cms-fab{position:fixed;right:18px;bottom:18px;z-index:2147483000;cursor:pointer;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:1px;padding:11px 15px;background:#16161a;color:#fff;border:2px solid #fff;box-shadow:4px 4px 0 rgba(0,0,0,.45)}
.pf-cms-drawer{position:fixed;top:0;right:0;height:100vh;width:min(440px,94vw);z-index:2147483000;background:#1b1b20;color:#e9e9ef;border-left:2px solid #000;box-shadow:-12px 0 40px rgba(0,0,0,.4);overflow-y:auto;transition:transform .26s cubic-bezier(.4,0,.2,1);transform:translateX(105%);font-family:'JetBrains Mono',ui-monospace,monospace}
.pf-cms-drawer.pf-cms-open{transform:translateX(0)}
.pf-cms-top{position:sticky;top:0;z-index:5;background:#16161a;border-bottom:1px solid #34343e;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}
.pf-cms-tools{display:flex;gap:7px;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid #2a2a32}
.pf-cms-body{padding:6px 16px 90px;display:flex;flex-direction:column;gap:22px}
.pf-cms-sec{display:flex;flex-direction:column;gap:10px}
.pf-cms-sec + .pf-cms-sec{border-top:1px solid #2a2a32;padding-top:14px}
.pf-cms-sec h3{margin:0;font-size:11px;letter-spacing:2px;color:#7bdcc7}
.pf-cms-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pf-cms-in{width:100%;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;background:#26262c;color:#e9e9ef;border:1px solid #43434f;border-radius:4px;padding:7px 8px;line-height:1.5}
.pf-cms-in:focus{outline:none;border-color:#7bdcc7}
.pf-cms-lb{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:#8b8b99;margin-bottom:3px;display:block}
.pf-cms-btn{cursor:pointer;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;background:#2f2f38;color:#e9e9ef;border:1px solid #50505e;border-radius:4px;padding:6px 10px}
.pf-cms-btn:hover{background:#3a3a45;border-color:#7bdcc7}
.pf-cms-btn.danger{border-color:#7a4a4a;color:#f0b9b9}
.pf-cms-item{background:#212128;border:1px solid #33333d;border-radius:6px;padding:11px;display:flex;flex-direction:column;gap:8px}
.pf-cms-itemhd{display:flex;align-items:center;justify-content:space-between;gap:8px}
.pf-cms-num{font-size:10px;color:#8b8b99}
.pf-cms-chk{display:flex;align-items:center;gap:7px;font-size:11px;color:#cfcfd8;cursor:pointer}
.pf-cms-chk input{width:15px;height:15px;accent-color:#7bdcc7}
.pf-cms-body::-webkit-scrollbar,.pf-cms-drawer::-webkit-scrollbar{width:10px}
.pf-cms-drawer::-webkit-scrollbar-thumb{background:#3a3a45;border-radius:6px}
`;

// ─── アイテム編集ブロック ─────────────────────────────────────
function itemHTML(sec, it, i) {
  const tl = it.title || {}, sb = it.subtitle || {}, ds = it.description || {};
  return `<div class="pf-cms-item">
    <div class="pf-cms-itemhd">
      <span class="pf-cms-num">#${i + 1}</span>
      <div style="display:flex;gap:5px">
        <button class="pf-cms-btn" data-act="move" data-sec="${sec}" data-id="${attr(it.id)}" data-dir="-1" style="padding:4px 8px">↑</button>
        <button class="pf-cms-btn" data-act="move" data-sec="${sec}" data-id="${attr(it.id)}" data-dir="1" style="padding:4px 8px">↓</button>
        <button class="pf-cms-btn danger" data-act="remove" data-sec="${sec}" data-id="${attr(it.id)}" style="padding:4px 8px">✕</button>
      </div>
    </div>
    <div class="pf-cms-row2">
      <div><span class="pf-cms-lb">タイトル JA</span><input class="pf-cms-in" data-sec="${sec}" data-id="${attr(it.id)}" data-field="title" data-lang="ja" value="${attr(tl.ja)}"></div>
      <div><span class="pf-cms-lb">Title EN</span><input class="pf-cms-in" data-sec="${sec}" data-id="${attr(it.id)}" data-field="title" data-lang="en" value="${attr(tl.en)}"></div>
      <div><span class="pf-cms-lb">サブ JA</span><input class="pf-cms-in" data-sec="${sec}" data-id="${attr(it.id)}" data-field="subtitle" data-lang="ja" value="${attr(sb.ja)}"></div>
      <div><span class="pf-cms-lb">Sub EN</span><input class="pf-cms-in" data-sec="${sec}" data-id="${attr(it.id)}" data-field="subtitle" data-lang="en" value="${attr(sb.en)}"></div>
    </div>
    <div><span class="pf-cms-lb">説明 JA</span><textarea class="pf-cms-in" rows="2" data-sec="${sec}" data-id="${attr(it.id)}" data-field="description" data-lang="ja">${esc(ds.ja)}</textarea></div>
    <div><span class="pf-cms-lb">Desc EN</span><textarea class="pf-cms-in" rows="2" data-sec="${sec}" data-id="${attr(it.id)}" data-field="description" data-lang="en">${esc(ds.en)}</textarea></div>
    <div class="pf-cms-row2">
      <div><span class="pf-cms-lb">期間</span><input class="pf-cms-in" data-sec="${sec}" data-id="${attr(it.id)}" data-field="period" value="${attr(it.period)}"></div>
      <div><span class="pf-cms-lb">画像パス（任意）</span><input class="pf-cms-in" data-sec="${sec}" data-id="${attr(it.id)}" data-field="image" value="${attr(it.image)}"></div>
    </div>
    <div><span class="pf-cms-lb">タグ（,区切り）</span><input class="pf-cms-in" data-sec="${sec}" data-id="${attr(it.id)}" data-field="tags" value="${attr((it.tags || []).join(', '))}"></div>
    <label class="pf-cms-chk"><input type="checkbox" data-sec="${sec}" data-id="${attr(it.id)}" data-field="featured" ${it.featured ? 'checked' : ''}>抜粋（PICK UP）に表示</label>
    <div><span class="pf-cms-lb">リンク（1行=「ラベル | URL」）</span><textarea class="pf-cms-in" rows="2" data-sec="${sec}" data-id="${attr(it.id)}" data-field="links">${esc((it.links || []).map((l) => `${l.label} | ${l.url}`).join('\n'))}</textarea></div>
  </div>`;
}

function sectionHTML(title, sec, items) {
  return `<section class="pf-cms-sec">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <h3>${title}</h3>
      <button class="pf-cms-btn" data-act="add" data-sec="${sec}">＋ 追加</button>
    </div>
    ${items.map((it, i) => itemHTML(sec, it, i)).join('')}
  </section>`;
}

// ─── 本体描画 ─────────────────────────────────────────────────
function bodyHTML(d) {
  const p = d.profile;
  return `
  <section class="pf-cms-sec">
    <h3>PROFILE</h3>
    <div class="pf-cms-row2">
      <div><span class="pf-cms-lb">名前 JA</span><input class="pf-cms-in" data-pf="name" data-lang="ja" value="${attr(p.name.ja)}"></div>
      <div><span class="pf-cms-lb">Name EN</span><input class="pf-cms-in" data-pf="name" data-lang="en" value="${attr(p.name.en)}"></div>
      <div><span class="pf-cms-lb">肩書 JA</span><input class="pf-cms-in" data-pf="role" data-lang="ja" value="${attr(p.role.ja)}"></div>
      <div><span class="pf-cms-lb">Role EN</span><input class="pf-cms-in" data-pf="role" data-lang="en" value="${attr(p.role.en)}"></div>
    </div>
    <div><span class="pf-cms-lb">紹介 JA</span><textarea class="pf-cms-in" rows="3" data-pf="bio" data-lang="ja">${esc(p.bio.ja)}</textarea></div>
    <div><span class="pf-cms-lb">Bio EN</span><textarea class="pf-cms-in" rows="3" data-pf="bio" data-lang="en">${esc(p.bio.en)}</textarea></div>
    <div><span class="pf-cms-lb">プロフィールのリンク（1行=「ラベル | URL」）</span><textarea class="pf-cms-in" rows="3" data-pf="links">${esc((p.links || []).map((l) => `${l.label} | ${l.url}`).join('\n'))}</textarea></div>
  </section>

  <section class="pf-cms-sec">
    <h3>HIGHLIGHTS（実績バッジ）</h3>
    <span class="pf-cms-lb">1行=「数値 | ラベルJA | ラベルEN」</span>
    <textarea class="pf-cms-in" rows="5" data-act="highlights">${esc((d.highlights || []).map((h) => `${h.value} | ${(h.label || {}).ja || ''} | ${(h.label || {}).en || ''}`).join('\n'))}</textarea>
  </section>

  ${sectionHTML('WEB APPS', 'webapps', d.webapps || [])}
  ${sectionHTML('STUDENT', 'student', d.student || [])}
  ${sectionHTML('RESEARCH', 'research', d.research || [])}

  <section class="pf-cms-sec">
    <h3>CONTACT</h3>
    <span class="pf-cms-lb">1行=「ラベル | サブ | URL」</span>
    <textarea class="pf-cms-in" rows="5" data-act="contact">${esc((d.contact || []).map((c) => `${c.label} | ${c.sub} | ${c.url}`).join('\n'))}</textarea>
  </section>`;
}

// ─── マウント ─────────────────────────────────────────────────
let open = false;

function refreshBody() {
  const body = document.getElementById('pf-cms-body');
  if (body) body.innerHTML = bodyHTML(store.get());
}

function mount() {
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button class="pf-cms-fab" data-act="toggle" type="button">✎ 編集</button>
    <aside class="pf-cms-drawer" id="pf-cms-drawer">
      <div class="pf-cms-top">
        <div style="display:flex;flex-direction:column;gap:2px">
          <strong style="font-size:13px;letter-spacing:1px">CONTENT CMS</strong>
          <span style="font-size:10px;color:#8b8b99">編集は自動保存されます</span>
        </div>
        <button class="pf-cms-btn" data-act="close" style="font-size:13px">✕</button>
      </div>
      <div class="pf-cms-tools">
        <button class="pf-cms-btn" data-act="export">⬇ JSON書出</button>
        <label class="pf-cms-btn" style="display:inline-flex;align-items:center">⬆ JSON読込<input type="file" accept="application/json,.json" data-act="import" style="display:none"></label>
        <button class="pf-cms-btn danger" data-act="reset">↺ 初期化</button>
      </div>
      <div class="pf-cms-body" id="pf-cms-body"></div>
    </aside>`;
  document.body.appendChild(wrap);
  refreshBody();

  const fab = wrap.querySelector('.pf-cms-fab');
  const drawer = wrap.querySelector('#pf-cms-drawer');
  const setOpen = (v) => { open = v; drawer.classList.toggle('pf-cms-open', open); fab.textContent = open ? '✕ 閉じる' : '✎ 編集'; };

  // クリック（ボタン操作）
  wrap.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'toggle') return setOpen(!open);
    if (act === 'close') return setOpen(false);
    if (act === 'export') {
      const blob = new Blob([store.exportJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'portfolio.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (act === 'reset') {
      if (confirm('初期内容に戻しますか？（編集内容は失われます）')) { store.reset(); refreshBody(); }
      return;
    }
    if (act === 'add') {
      const sec = el.dataset.sec;
      store.mutate((dd) => dd[sec].push({ id: sec + Date.now(), featured: false, period: '2025', title: { ja: '新しい項目', en: 'New item' }, subtitle: { ja: '', en: '' }, description: { ja: '', en: '' }, tags: [], image: '', links: [] }));
      refreshBody();
      return;
    }
    if (act === 'move') {
      const { sec, id, dir } = el.dataset;
      store.mutate((dd) => {
        const arr = dd[sec]; const i = arr.findIndex((x) => x.id === id); const j = i + Number(dir);
        if (i < 0 || j < 0 || j >= arr.length) return;
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      });
      refreshBody();
      return;
    }
    if (act === 'remove') {
      const { sec, id } = el.dataset;
      if (confirm('この項目を削除しますか？')) { store.mutate((dd) => { dd[sec] = dd[sec].filter((x) => x.id !== id); }); refreshBody(); }
      return;
    }
  });

  // テキスト入力（自動保存 / ドロワーは再描画しない＝フォーカス維持）
  wrap.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.pf) {
      const f = el.dataset.pf, lang = el.dataset.lang;
      if (f === 'links') store.mutate((dd) => { dd.profile.links = parsePairs(el.value); });
      else store.mutate((dd) => { if (lang) dd.profile[f][lang] = el.value; else dd.profile[f] = el.value; });
      return;
    }
    if (el.dataset.act === 'highlights') {
      store.mutate((dd) => {
        dd.highlights = el.value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
          const q = l.split('|').map((s) => (s || '').trim());
          return { value: q[0] || '', label: { ja: q[1] || '', en: q[2] || q[1] || '' } };
        });
      });
      return;
    }
    if (el.dataset.act === 'contact') {
      store.mutate((dd) => { dd.contact = parseTriples(el.value); });
      return;
    }
    if (el.dataset.sec && el.dataset.field) {
      const { sec, id, field, lang } = el.dataset;
      store.mutate((dd) => {
        const it = dd[sec].find((x) => x.id === id); if (!it) return;
        if (field === 'tags') it.tags = el.value.split(',').map((s) => s.trim()).filter(Boolean);
        else if (field === 'links') it.links = parsePairs(el.value);
        else if (lang) { if (typeof it[field] !== 'object' || !it[field]) it[field] = { ja: '', en: '' }; it[field][lang] = el.value; }
        else it[field] = el.value;
      });
      return;
    }
  });

  // チェックボックス / ファイル
  wrap.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.field === 'featured') {
      const { sec, id } = el.dataset;
      store.mutate((dd) => { const x = dd[sec].find((y) => y.id === id); if (x) x.featured = el.checked; });
      return;
    }
    if (el.dataset.act === 'import') {
      const f = el.files && el.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { store.importJSON(rd.result); refreshBody(); } catch (err) { alert('JSONの読み込みに失敗しました: ' + err.message); } };
      rd.readAsText(f); el.value = '';
      return;
    }
  });
}

// ─── アクセスゲート ───────────────────────────────────────────
//  CMS は一般訪問者には表示しない。オーナーは URL に「?edit」を付けて開く。
//   ・有効化:  https://5hkt.com/?edit        （そのタブのセッション中は記憶）
//   ・無効化:  https://5hkt.com/?edit=off
//  ※ 静的サイトのためサーバー認証はありません。これは「編集UIを訪問者に見せない」
//    ための表示ゲートです（CMSの編集はそもそも各自のブラウザ内ローカル下書きで、
//    公開には JSON を portfolio-data.js に反映して commit する必要があります）。
function editorEnabled() {
  try {
    const q = new URLSearchParams(location.search);
    if (q.has('edit')) {
      const v = (q.get('edit') || '').toLowerCase();
      if (v === 'off' || v === '0' || v === 'false') { sessionStorage.removeItem('pf_edit'); return false; }
      sessionStorage.setItem('pf_edit', '1');
      return true;
    }
    return sessionStorage.getItem('pf_edit') === '1';
  } catch (e) { return false; }
}

function boot() { if (editorEnabled()) mount(); }

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
