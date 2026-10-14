#!/usr/bin/env bash
# CSS / JS の参照に版番号（?v=...）を付け直す。
# 本番の JS/CSS は Cloudflare 側の設定でブラウザに 4 時間キャッシュされるため、
# 中身を変えたらこれを実行して URL を変え、古いキャッシュを確実に避ける。
#   使い方: scripts/bump-assets.sh            （版番号は現在時刻）
#           scripts/bump-assets.sh 20261014a   （任意の版番号）
set -euo pipefail
cd "$(dirname "$0")/.."
V="${1:-$(date +%Y%m%d%H%M)}"
# HTML: css/*.css と js/*.js への参照
find . -name '*.html' -not -path './design_handoff_pixel_portfolio/*' -not -path './admin/*' -print0 |
  xargs -0 sed -E -i "s#((css|js)/[A-Za-z0-9_-]+\.(css|js))(\?v=[A-Za-z0-9]+)?\"#\1?v=${V}\"#g"
# JS: モジュール同士の import（同じ版番号で揃えないと別インスタンスになる）
sed -E -i "s#(from '\./[A-Za-z0-9_-]+\.js)(\?v=[A-Za-z0-9]+)?'#\1?v=${V}'#g" js/*.js
echo "assets version: ${V}"
