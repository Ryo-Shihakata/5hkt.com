// ─────────────────────────────────────────────────────────────
//  構成図（自宅サーバー / AI 運用）
//  上から下へ「段（tier）」を積み、段の間に矢印と説明（link）を挟む単純な図。
//  HTML + CSS だけで描くので、狭い画面では各段が縦に並び替わる。
// ─────────────────────────────────────────────────────────────
import { esc } from './render.js?v=20261014b';

// spec: [{ tier: { label, boxes: [{ title, sub, items? }] } } | { link: [label, ...] }]
function render(spec, caption) {
  let step = 0;
  const parts = spec.map((s) => {
    if (s.link) {
      const n = s.link.length;
      return `<div class="dg-link reveal" style="--i:${step++ % 4};--n:${n}">${s.link.map((l) =>
        `<div class="dg-arrow"><span class="dg-line"></span>${l ? `<span class="dg-arrow-lb">${esc(l)}</span>` : ''}</div>`).join('')}</div>`;
    }
    const t = s.tier;
    return `<div class="dg-tier reveal" style="--i:${step++ % 4}">
      <p class="dg-label">${esc(t.label)}</p>
      <div class="dg-row" style="--n:${t.boxes.length}">${t.boxes.map((b) => `<div class="dg-box${b.strong ? ' is-strong' : ''}">
        <p class="dg-title">${esc(b.title)}</p>
        ${b.sub ? `<p class="dg-sub">${esc(b.sub)}</p>` : ''}
        ${b.items ? `<ul class="dg-items">${b.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>` : ''}
      </div>`).join('')}</div>
      ${t.note ? `<p class="dg-note">${esc(t.note)}</p>` : ''}
    </div>`;
  }).join('');
  return `<figure class="dg"><figcaption class="dg-cap">${esc(caption)}</figcaption>${parts}</figure>`;
}

export function homelabDiagram(ja) {
  return render([
    { tier: { label: ja ? '入口' : 'Access', boxes: [
      { title: ja ? '自分' : 'Me', sub: ja ? 'スマホ・PC（家でも出先でも）' : 'Phone or PC, at home or away' },
      { title: ja ? 'Web の訪問者' : 'Visitors', sub: ja ? '公開している Web アプリ' : 'Public web apps' },
    ] } },
    { link: [ja ? 'Remote Control / SSH（Tailscale）' : 'Remote Control / SSH (Tailscale)', 'Cloudflare Tunnel + Access'] },
    { tier: { label: ja ? 'Proxmox クラスタ（中古ラックサーバー 2 台）' : 'Proxmox cluster (two used rack servers)', boxes: [
      { title: 'Dell Precision Rack 7910', sub: 'Xeon E5-2667 v4', strong: true },
      { title: 'Dell PowerEdge R430', sub: 'Xeon E5-2620 v4', strong: true },
    ], note: ja ? '毎晩、もう一方のノードへバックアップ（vzdump）' : 'Nightly vzdump backups to the other node' } },
    { link: [ja ? '仮想マシン・コンテナとして動かす' : 'Run as VMs and containers'] },
    { tier: { label: ja ? '動いているもの' : 'What runs on it', boxes: [
      { title: ja ? '開発 VM' : 'Dev VM', sub: ja ? 'Claude Code が常駐' : 'Claude Code always on' },
      { title: ja ? 'Minecraft サーバー網' : 'Minecraft network', sub: ja ? 'Velocity 配下に 4 サーバー' : '4 servers behind Velocity' },
      { title: ja ? 'Web アプリの裏方' : 'App backends', sub: ja ? '収集・保存・API' : 'Collectors, storage, APIs' },
      { title: ja ? '管理ダッシュボード' : 'Dashboard', sub: ja ? '自作・Access で保護' : 'Self-made, behind Access' },
    ] } },
    { link: [''] },
    { tier: { label: ja ? '土台' : 'Foundation', boxes: [
      { title: ja ? 'UPS（OMRON）' : 'UPS (OMRON)', sub: ja ? '停電対策' : 'Power outage protection' },
      { title: 'GitHub', sub: ja ? 'コードと設定はすべてここ' : 'All code and configs live here' },
    ] } },
  ], ja ? '構成図' : 'Diagram');
}

export function aiDiagram(ja) {
  return render([
    { tier: { label: ja ? '入口' : 'Entry', boxes: [
      { title: ja ? '自分' : 'Me', sub: ja ? 'スマホ・PC' : 'Phone or PC' },
    ] } },
    { link: [ja ? 'Remote Control（claude rc）/ SSH' : 'Remote Control (claude rc) / SSH'] },
    { tier: { label: ja ? '司令塔' : 'Lead', boxes: [
      { title: 'Claude Code（Opus）', sub: ja ? '開発 VM の tmux に常駐。設計・実装・レビュー' : 'Always on in tmux on the dev VM. Design, build, review', strong: true },
    ] } },
    { link: [ja ? '作業を振り分ける' : 'Delegates work'] },
    { tier: { label: ja ? '手足' : 'Helpers', boxes: [
      { title: ja ? 'サブエージェント' : 'Subagents', sub: ja ? 'Sonnet：調査・実装・検証／Haiku：定型作業' : 'Sonnet: research, build, verify / Haiku: routine tasks' },
      { title: 'Codex', sub: ja ? '別系統のモデルでセカンドオピニオン' : 'A second opinion from a different model' },
      { title: ja ? 'MCP ツール' : 'MCP tools', sub: ja ? '自作アプリ（Today Board など）を直接操作' : 'Drives my own apps (Today Board etc.)' },
    ] } },
    { link: [ja ? '学んだことを残す' : 'Keeps what it learns', ja ? '同じ設定を配る' : 'Shares one setup'] },
    { tier: { label: ja ? '記憶と設定' : 'Memory & settings', boxes: [
      { title: 'memory-vault', sub: ja ? '知見・教訓を GitHub に書き、次のセッションへ引き継ぐ' : 'Lessons written to GitHub and carried into the next session' },
      { title: 'claude-dotfiles', sub: ja ? 'skills・agents・hooks をすべての環境で共有' : 'Skills, agents and hooks shared across every machine' },
    ] } },
    { link: [ja ? 'PR を作ってマージ' : 'Open a PR and merge'] },
    { tier: { label: ja ? '出口' : 'Ship', boxes: [
      { title: 'GitHub → Cloudflare', sub: ja ? 'main に入ると自動でデプロイ' : 'Deploys automatically once merged to main' },
    ] } },
  ], ja ? '構成図' : 'Diagram');
}
