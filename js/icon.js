// ─────────────────────────────────────────────────────────────
//  5HKT アイコン（HERO の正方形・ヘッダーのロゴ・ファビコンで共用）
//  ・letterpress: 墨の版に原稿用紙の升目と 5H / KT を白抜きした活版刷り
//  ・dot:         5×7 の升目に打った 5HKT（旧デザインからの引き継ぎ）
//  どちらも 400×400 の SVG 文字列を返す。文字はアウトライン（icon-glyphs.js）なので
//  フォントの読み込みを待たずに描ける。
// ─────────────────────────────────────────────────────────────
import { GLYPHS } from './icon-glyphs.js?v=20261014b';

// サイトで使うアイコン（'letterpress' | 'dot'）
export const ICON = 'letterpress';

const INK = '#1f1e1b', SHU = '#c2412f', PAPER = '#f6f1e7';
const PLATE = '#23211e';   // 活版の版の色（墨）

// ─── 活版 ──────────────────────────────────────────────────────
// texture=false で、かすれ・紙の粒・沈み影を省いた平らな版（ファビコン等の小サイズ用）
export function letterpressSVG({ id = 'lp', texture = true } = {}) {
  const B = 48, S = 304;           // 版の位置と一辺
  const IN = 16;                   // 内枠までの余白
  const C = B + S / 2;             // 版の中心
  const cell = (S - IN * 2) / 2;   // 升目の一辺
  // 手で組んだ活字らしく、字ごとにわずかに傾け・ずらす（固定値なので毎回同じ）
  const jig = { '5': [-1.6, -1, 1.2], 'H': [1.2, 1.5, -0.8], 'K': [0.8, -1, 0.6], 'T': [-1, 1.5, -1.4] };
  const H = 104;                   // 字の高さ（px）
  const glyph = (ch, col, row) => {
    const g = GLYPHS[ch], k = H / 747;
    const [dx, dy, rot] = jig[ch];
    const x = B + IN + cell * col + cell / 2 + dx, y = B + IN + cell * row + cell / 2 + dy;
    return `<path d="${g.d}" transform="translate(${x} ${y}) rotate(${rot}) scale(${k.toFixed(4)})"/>`;
  };
  const cut = `
      <rect x="${B + IN}" y="${B + IN}" width="${S - IN * 2}" height="${S - IN * 2}" fill="none" stroke="#000" stroke-width="5"/>
      <line x1="${C}" y1="${B + IN}" x2="${C}" y2="${B + S - IN}" stroke="#000" stroke-width="3"/>
      <line x1="${B + IN}" y1="${C}" x2="${B + S - IN}" y2="${C}" stroke="#000" stroke-width="3"/>
      <g fill="#000">${glyph('5', 0, 0)}${glyph('H', 1, 0)}${glyph('K', 0, 1)}${glyph('T', 1, 1)}</g>`;

  const defs = `<defs>
    <mask id="${id}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
      <rect x="${B}" y="${B}" width="${S}" height="${S}" fill="#fff"/>${cut}
    </mask>${texture ? `
    <filter id="${id}-ink" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
      <!-- 輪郭のにじみ -->
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="3" result="n1"/>
      <feDisplacementMap in="SourceGraphic" in2="n1" scale="3" xChannelSelector="R" yChannelSelector="G" result="rough"/>
      <!-- インクのムラ（濃淡） -->
      <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="8" result="n2"/>
      <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.45 0 0 0 0.74" result="mott"/>
      <feComposite in="rough" in2="mott" operator="in" result="inked"/>
      <!-- かすれ（インクの乗らない細かな点） -->
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" seed="5" result="n3"/>
      <feColorMatrix in="n3" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -18 0 0 0 13.8" result="salt"/>
      <feComposite in="inked" in2="salt" operator="in" result="salted"/>
      <!-- 圧で沈んだ縁（左上の内側に影） -->
      <feComponentTransfer in="rough" result="inv"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
      <feOffset in="inv" dx="2" dy="2" result="invoff"/>
      <feGaussianBlur in="invoff" stdDeviation="1.1" result="invblur"/>
      <feComposite in="invblur" in2="rough" operator="in" result="innerA"/>
      <feFlood flood-color="#000" flood-opacity="0.55"/>
      <feComposite in2="innerA" operator="in" result="shade"/>
      <feMerge><feMergeNode in="salted"/><feMergeNode in="shade"/></feMerge>
    </filter>
    <filter id="${id}-paper" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.26  0 0 0 0 0.2  0 0 0 0.16 0"/>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>` : ''}
  </defs>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" class="icon icon-letterpress">${defs}
  <rect width="400" height="400" fill="${PAPER}"/>${texture ? `
  <rect width="400" height="400" fill="#fff" filter="url(#${id}-paper)"/>` : ''}
  <g class="lp-plate" ${texture ? `filter="url(#${id}-ink)"` : ''}>
    <rect x="${B}" y="${B}" width="${S}" height="${S}" fill="${PLATE}" mask="url(#${id}-m)" transform="rotate(-0.4 ${C} ${C})"/>
  </g>
</svg>`;
}

// ─── ドット ───────────────────────────────────────────────────
const BMP = {
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
};
export function dotSVG() {
  const P = 20, pos = { '5': [80, 40], 'H': [220, 40], 'K': [80, 220], 'T': [220, 220] };
  let px = '', n = 0;
  for (const [ch, [ox, oy]] of Object.entries(pos)) {
    BMP[ch].forEach((row, y) => [...row].forEach((v, x) => {
      if (v !== '1') return;
      const accent = ch === '5' && x === 0 && y === 0;
      // --n は出現アニメの順番（升目を打っていく順をばらけさせる）
      px += `<rect x="${ox + x * P}" y="${oy + y * P}" width="${P - 2}" height="${P - 2}" fill="${accent ? SHU : INK}" style="--n:${(n++ * 37) % 71}"/>`;
    }));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" class="icon icon-dot">
  <rect width="400" height="400" fill="${PAPER}"/>${px}
</svg>`;
}

export const iconSVG = (opts = {}) => (ICON === 'dot' ? dotSVG() : letterpressSVG(opts));
