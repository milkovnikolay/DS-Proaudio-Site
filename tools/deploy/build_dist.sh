#!/bin/bash
# DS PROAUDIO — сборка папки для выгрузки на хостинг RU-CENTER (план Коли, раздел 3.4), 25.10.2026.
# Запуск из корня репозитория:  bash tools/deploy/build_dist.sh
# Результат: папка dist/ — её содержимое загружается в корневую папку сайта на хостинге (docs/ или public_html/).
#   • черновики и служебные файлы в dist/ не попадают;
#   • index.html = копия Main.dc.html (главная с 30.10.2026 — обычный HTML; имя файла оставлено, на него ведут ссылки всех страниц);
#   • dist/SHA256SUMS — контрольные суммы, чтобы после выгрузки сверить файлы на хостинге.
# ВАЖНО: папку /upload/ со старого сайта на хостинге НЕ удалять — на неё ссылаются документы (PDF, GLL, DWG, ПО).
# Настройки приёма заявок (private/ds-config.php) кладутся на хостинге уровнем выше папки сайта, см. service-api/ds-config.example.php.
set -euo pipefail
cd "$(dirname "$0")/../.."
rm -rf dist && mkdir dist
cp -R site/. dist/
(cd dist && rm -f cards-variants*.html menu-proposal*.html showroom-3d.html .nojekyll && rm -rf service-api \
  && find . \( -name '.DS_Store' -o -name 'Thumbs.db' -o -name '*.bak' \) -delete)
cp dist/Main.dc.html dist/index.html
# страница 404 открывается по любому несуществующему адресу, в том числе вложенному (/catalog/…/): ссылки «./…» должны
# считаться от корня сайта, иначе стили и картинки не загрузятся. Только для хостинга — превью на GitHub Pages живёт не в корне.
perl -0pi -e 's|<head>|<head>\n<base href="/">|' dist/404.html
grep -q '<base href="/">' dist/404.html || { echo "Ошибка: не удалось добавить <base> в 404.html"; exit 1; }
(cd dist && find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS)
echo "Готово: $(find dist -type f | wc -l) файлов, $(du -sh dist | cut -f1). Загрузить содержимое dist/ на хостинг."
