// 生成 v2/*.html：把 _src/pages/ 里每个页面的正文套进 _src/layout.html，并输出 sitemap.xml
// 用法：node v2/_src/build.js
// 页面文件第一行写元信息：<!-- {"title":"…","desc":"…","page":"technology","og":"hawaii-plant.jpg"} -->
// 换正式域名时只改 SITE。
const fs = require('fs');
const path = require('path');

const SITE = 'https://pinkmatter3000.github.io/carbonjour-website/v3/';
const ORG = {
  name: '上海海浦麒碳科技有限公司',
  alternateName: ['海浦麒', 'Carbonjour', 'Shanghai Haipuqi Carbon Technology Co., Ltd.'],
  email: 'djh@carbonjour.com',
};
// breadcrumb names for subpages
const CRUMB = { technology: '技术', solutions: '解决方案', partnership: '合作模式', about: '关于我们', news: '动态', contact: '联系我们' };

const src = __dirname;
const out = path.join(src, '..');
const layout = fs.readFileSync(path.join(src, 'layout.html'), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// ---- image size reader (JPEG / PNG / WebP) so every <img> gets width/height ----
const sizeCache = {};
function imageSize(file) {
  if (sizeCache[file]) return sizeCache[file];
  const b = fs.readFileSync(file);
  let w = 0, h = 0;
  if (b[0] === 0xff && b[1] === 0xd8) {                       // JPEG: walk to the SOF marker
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; }
      i += 2 + len;
    }
  } else if (b.toString('ascii', 1, 4) === 'PNG') {
    w = b.readUInt32BE(16); h = b.readUInt32BE(20);
  } else if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const fmt = b.toString('ascii', 12, 16);
    if (fmt === 'VP8X') { w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3); }
    else if (fmt === 'VP8L') { const n = b.readUInt32LE(21); w = 1 + (n & 0x3fff); h = 1 + ((n >> 14) & 0x3fff); }
    else if (fmt === 'VP8 ') { w = b.readUInt16LE(26) & 0x3fff; h = b.readUInt16LE(28) & 0x3fff; }
  }
  return (sizeCache[file] = w && h ? { w, h } : null);
}
function addImageSizes(html) {
  return html.replace(/<img\b([^>]*?)\bsrc="(img\/[^"]+)"([^>]*)>/g, (all, a, s, z) => {
    if (/\bwidth=/.test(a + z)) return all;
    const d = imageSize(path.join(out, s));
    return d ? `<img${a}src="${s}" width="${d.w}" height="${d.h}"${z}>` : all;
  });
}

const pages = [];
for (const file of fs.readdirSync(path.join(src, 'pages')).filter(f => f.endsWith('.html'))) {
  const raw = fs.readFileSync(path.join(src, 'pages', file), 'utf8');
  const m = raw.match(/^<!--\s*(\{.*?\})\s*-->\r?\n/);
  if (!m) throw new Error(file + ': missing meta comment on the first line');
  const meta = JSON.parse(m[1]);
  // <!-- @include name --> pulls in _src/parts/name.html
  const body = raw.slice(m[0].length).trim().replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, n) => fs.readFileSync(path.join(src, 'parts', n + '.html'), 'utf8').trim());

  const url = SITE + (file === 'index.html' ? '' : file);
  const ogImage = SITE + 'img/' + (meta.og || 'hawaii-plant.jpg');
  const ogDim = imageSize(path.join(out, 'img', meta.og || 'hawaii-plant.jpg'));
  const hero = (body.match(/<img\b[^>]*src="(img\/[^"]+)"[^>]*fetchpriority="high"/) || [])[1];

  const ld = meta.page === 'home'
    ? [{ '@context': 'https://schema.org', '@type': 'Organization', name: ORG.name, alternateName: ORG.alternateName, url: SITE, email: ORG.email, image: ogImage,
         address: { '@type': 'PostalAddress', addressLocality: 'Shanghai', addressCountry: 'CN' },
         description: meta.desc },
       { '@context': 'https://schema.org', '@type': 'WebSite', name: '海浦麒 Carbonjour', url: SITE, inLanguage: ['zh-CN', 'en'] }]
    : [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
         { '@type': 'ListItem', position: 1, name: '首页', item: SITE },
         { '@type': 'ListItem', position: 2, name: CRUMB[meta.page] || meta.title, item: url }] }];

  const seo = [
    `<link rel="canonical" href="${url}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large">`,
    `<meta name="theme-color" content="#0A1A20">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="海浦麒 Carbonjour">`,
    `<meta property="og:locale" content="zh_CN">`,
    `<meta property="og:locale:alternate" content="en_US">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.desc)}">`,
    `<meta property="og:image" content="${ogImage}">`,
    ogDim ? `<meta property="og:image:width" content="${ogDim.w}">\n<meta property="og:image:height" content="${ogDim.h}">` : '',
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.desc)}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    hero ? `<link rel="preload" as="image" href="${hero}" fetchpriority="high">` : '',
    ...ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`),
  ].filter(Boolean).join('\n');

  let html = layout
    .replace(/{{title}}/g, meta.title)
    .replace(/{{desc}}/g, meta.desc)
    .replace(/{{page}}/g, meta.page)
    .replace('{{seo}}', seo)
    .replace('{{body}}', body);

  // mark the current page in the main nav
  html = html.split(`data-nav="${meta.page}"`).join(`data-nav="${meta.page}" aria-current="page"`);
  html = addImageSizes(html);

  fs.writeFileSync(path.join(out, file), html);
  pages.push({ url, priority: meta.page === 'home' ? '1.0' : '0.8' });
  console.log('built', file);
}

// ---- sitemap ----
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.sort((a, b) => b.priority - a.priority).map(p => `  <url><loc>${p.url}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap);
console.log('built sitemap.xml');
