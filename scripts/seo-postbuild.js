/* eslint-env node */
/**
 * Post-build SEO:
 *  1. Prerender meta tags (title, description, canonical, Open Graph, Twitter,
 *     JSON-LD) ke dalam salinan index.html untuk setiap halaman publik statis,
 *     sehingga crawler non-JS (Google, WhatsApp, Facebook, Twitter) langsung
 *     membaca metadata yang benar. SPA tetap boot & hydrate seperti biasa.
 *  2. Menghasilkan sitemap.xml.
 *
 * Dijalankan otomatis setelah `npm run build` lewat npm lifecycle "postbuild".
 * Mengandalkan Nginx `try_files $uri $uri/ /index.html` agar file per-rute dilayani.
 */
const fs = require('fs');
const path = require('path');
const { SITE_URL, SITE_NAME, DEFAULT_IMAGE, ROUTES } = require('./seo-config');

const DIST = path.resolve(__dirname, '..', 'dist', 'spa');
const BASE_HTML = path.join(DIST, 'index.html');

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildHead = (route) => {
  const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  const fullTitle = route.path === '/' ? route.title : `${route.title} | ${SITE_NAME}`;
  const image = route.image || DEFAULT_IMAGE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: fullTitle,
        description: route.description,
        inLanguage: 'id-ID',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: DEFAULT_IMAGE,
      },
    ],
  };

  return [
    `<meta name="description" content="${esc(route.description)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="id_ID" />`,
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join('\n    ');
};

// Hapus tag SEO yang sudah ada (toleran terhadap HTML minified / atribut tanpa kutip)
// agar tidak terjadi duplikasi saat menyuntikkan tag per-rute.
const stripExistingSeo = (html) =>
  html
    .replace(/<meta[^>]*name=["']?description["']?[^>]*>/gi, '')
    .replace(/<meta[^>]*name=["']?robots["']?[^>]*>/gi, '')
    .replace(/<meta[^>]*property=["']?og:[^\s"'>]+["']?[^>]*>/gi, '')
    .replace(/<meta[^>]*name=["']?twitter:[^\s"'>]+["']?[^>]*>/gi, '')
    .replace(/<link[^>]*rel=["']?canonical["']?[^>]*>/gi, '');

const renderHtml = (template, route) => {
  const fullTitle = route.path === '/' ? route.title : `${route.title} | ${SITE_NAME}`;
  let html = template;

  // Ganti <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(fullTitle)}</title>`);

  // Bersihkan SEO lama lalu suntik set baru sebelum </head>
  html = stripExistingSeo(html);
  html = html.replace(/<\/head>/i, `  ${buildHead(route)}\n  </head>`);
  return html;
};

const writeRoute = (template, route) => {
  const html = renderHtml(template, route);
  const outPath =
    route.path === '/' ? BASE_HTML : path.join(DIST, route.path.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
};

const generateSitemap = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map((r) => {
    const loc = `${SITE_URL}${r.path === '/' ? '/' : r.path}`;
    return [
      '  <url>',
      `    <loc>${esc(loc)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
};

const main = () => {
  if (!fs.existsSync(BASE_HTML)) {
    console.error(`[seo] dist/spa/index.html tidak ditemukan. Jalankan "quasar build" lebih dulu.`);
    process.exit(1);
  }

  const template = fs.readFileSync(BASE_HTML, 'utf8');
  ROUTES.forEach((route) => writeRoute(template, route));
  generateSitemap();

  console.log(`[seo] Prerender ${ROUTES.length} halaman + sitemap.xml selesai. (SITE_URL=${SITE_URL})`);
};

main();
