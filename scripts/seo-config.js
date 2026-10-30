/* eslint-env node */
/**
 * Konfigurasi SEO terpusat untuk proses prerender & sitemap.
 * Domain produksi dapat di-override lewat environment variable SITE_URL,
 * contoh:  SITE_URL=https://www.miasdepok.com npm run build
 */
const SITE_URL = (process.env.SITE_URL || 'https://www.miasdepok.com').replace(/\/+$/, '');
const SITE_NAME = "Masjid Imam Asy-Syafi'i Depok";
const DEFAULT_IMAGE = `${SITE_URL}/logo-mias.png`;

/**
 * Daftar halaman publik statis (tanpa parameter dinamis) yang akan di-prerender
 * dan dimasukkan ke sitemap. Halaman berbasis data (detail kajian/artikel/dll.)
 * tetap mengandalkan meta reaktif via useMeta di sisi klien.
 *
 * changefreq & priority mengikuti anjuran sitemap.org.
 */
const ROUTES = [
  { path: '/', title: `${SITE_NAME} — Masjid, Dakwah, Pendidikan & Sosial`, description: `Website resmi ${SITE_NAME}. Informasi kajian, jadwal sholat, pendidikan, program sosial, donasi, umroh, dan kegiatan masjid.`, changefreq: 'daily', priority: '1.0' },
  { path: '/kajian', title: 'Kajian & Ceramah', description: `Rekaman dan jadwal kajian rutin bersama para asatidz di ${SITE_NAME}.`, changefreq: 'daily', priority: '0.8' },
  { path: '/dakwah/mias-tv', title: 'MIAS TV — Streaming Dakwah', description: `Siaran langsung dan rekaman dakwah ${SITE_NAME} melalui MIAS TV.`, changefreq: 'weekly', priority: '0.6' },
  { path: '/dakwah/kegiatan-ramadhan', title: 'Kegiatan Ramadhan', description: `Program dan kegiatan Ramadhan di ${SITE_NAME}.`, changefreq: 'monthly', priority: '0.6' },
  { path: '/dakwah/kegiatan-qurban', title: 'Kegiatan Qurban', description: `Informasi dan pelaksanaan ibadah qurban bersama ${SITE_NAME}.`, changefreq: 'monthly', priority: '0.6' },
  { path: '/dakwah/sholat-ied', title: 'Sholat Ied', description: `Jadwal dan informasi pelaksanaan Sholat Ied di ${SITE_NAME}.`, changefreq: 'monthly', priority: '0.6' },
  { path: '/pendidikan/jadwal', title: 'Jadwal Pendidikan', description: `Jadwal program pendidikan dan pengajaran di ${SITE_NAME}.`, changefreq: 'weekly', priority: '0.6' },
  { path: '/usaha/umroh', title: 'Program Umroh Bersama MIAS', description: `Program perjalanan ibadah Umroh bersama ${SITE_NAME} dengan bimbingan terpercaya. Hubungi kami untuk informasi jadwal, harga, dan pendaftaran.`, changefreq: 'weekly', priority: '0.9' },
  { path: '/usaha/mias-mart', title: 'MIAS Mart', description: `Produk dan layanan usaha ${SITE_NAME} melalui MIAS Mart.`, changefreq: 'weekly', priority: '0.6' },
  { path: '/profil/sejarah', title: 'Sejarah Masjid', description: `Sejarah berdirinya ${SITE_NAME}.`, changefreq: 'yearly', priority: '0.5' },
  { path: '/profil/visi-misi', title: 'Visi & Misi', description: `Visi dan misi ${SITE_NAME}.`, changefreq: 'yearly', priority: '0.5' },
  { path: '/profil/fasilitas', title: 'Fasilitas Masjid', description: `Fasilitas yang tersedia di ${SITE_NAME}.`, changefreq: 'yearly', priority: '0.5' },
  { path: '/profil/struktur', title: 'Struktur Pengurus', description: `Struktur kepengurusan ${SITE_NAME}.`, changefreq: 'yearly', priority: '0.5' },
  { path: '/profil/pemateri', title: 'Profil Pemateri', description: `Profil para pemateri dan asatidz ${SITE_NAME}.`, changefreq: 'monthly', priority: '0.5' },
  { path: '/artikel', title: 'Artikel Islami', description: `Kumpulan artikel dan tulisan islami dari ${SITE_NAME}.`, changefreq: 'daily', priority: '0.8' },
  { path: '/donasi', title: 'Donasi & Infaq', description: `Salurkan donasi, infaq, dan sedekah Anda melalui ${SITE_NAME}.`, changefreq: 'weekly', priority: '0.8' },
  { path: '/donasi/program-donasi', title: 'Program Donasi', description: `Program donasi dan penggalangan dana ${SITE_NAME}.`, changefreq: 'weekly', priority: '0.7' },
  { path: '/donasi/program-wakaf', title: 'Program Wakaf', description: `Program wakaf ${SITE_NAME}.`, changefreq: 'weekly', priority: '0.7' },
  { path: '/kontak', title: 'Hubungi Kami', description: `Hubungi ${SITE_NAME} untuk kritik, saran, dan pertanyaan.`, changefreq: 'yearly', priority: '0.5' },
  { path: '/ujian', title: 'Ujian Online', description: `Ikuti ujian online ${SITE_NAME} tanpa perlu login.`, changefreq: 'weekly', priority: '0.5' },
  { path: '/murojaah', title: "Muroja'ah Hafalan", description: `Program muroja'ah hafalan Al-Qur'an di ${SITE_NAME}.`, changefreq: 'weekly', priority: '0.6' },
];

module.exports = { SITE_URL, SITE_NAME, DEFAULT_IMAGE, ROUTES };
