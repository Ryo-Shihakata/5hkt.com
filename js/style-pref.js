// ─────────────────────────────────────────────────────────────
//  デザイン切替（新デザイン / 旧デザイン /classic）の選択を記憶する
//  ・[data-style-switch="classic|new"] のリンクを押すと localStorage['pf_style'] に保存
//  ・新デザイン側の各ページは <head> の小さなインラインスクリプトで
//    pf_style === 'classic' のとき /classic/ 側へ移る（旧デザイン側は移動しない）
// ─────────────────────────────────────────────────────────────
export const STYLE_KEY = 'pf_style';

let bound = false;
export function bindStyleSwitch() {
  if (bound) return;
  bound = true;
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-style-switch]');
    if (!el) return;
    try { localStorage.setItem(STYLE_KEY, el.dataset.styleSwitch); } catch (err) {}
  });
}
