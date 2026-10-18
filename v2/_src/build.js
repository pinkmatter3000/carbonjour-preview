// 生成 v2/*.html：把 _src/pages/ 里每个页面的正文套进 _src/layout.html
// 用法：node v2/_src/build.js
// 页面文件第一行写元信息：<!-- {"title":"…","desc":"…","page":"technology","og":"hawaii-plant.jpg"} -->
const fs = require('fs');
const path = require('path');

const src = __dirname;
const out = path.join(src, '..');
const layout = fs.readFileSync(path.join(src, 'layout.html'), 'utf8');

for (const file of fs.readdirSync(path.join(src, 'pages')).filter(f => f.endsWith('.html'))) {
  const raw = fs.readFileSync(path.join(src, 'pages', file), 'utf8');
  const m = raw.match(/^<!--\s*(\{.*?\})\s*-->\r?\n/);
  if (!m) throw new Error(file + ': missing meta comment on the first line');
  const meta = JSON.parse(m[1]);
  // <!-- @include name --> pulls in _src/parts/name.html
  const body = raw.slice(m[0].length).trim().replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, n) => fs.readFileSync(path.join(src, 'parts', n + '.html'), 'utf8').trim());

  let html = layout
    .replace(/{{title}}/g, meta.title)
    .replace(/{{desc}}/g, meta.desc)
    .replace(/{{page}}/g, meta.page)
    .replace(/{{ogImage}}/g, meta.og || 'hawaii-plant.jpg')
    .replace('{{body}}', body);

  // mark the current page in the main nav
  html = html.replace(`data-nav="${meta.page}"`, `data-nav="${meta.page}" class="active" aria-current="page"`);

  fs.writeFileSync(path.join(out, file), html);
  console.log('built', file);
}
