import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const routes = [
  // ─── Public Layout ─────────────────────────────────────────────────────────
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), name: 'home' },
      { path: 'kajian', component: () => import('pages/KajianPage.vue'), name: 'kajian' },
      { path: 'kajian/:id', component: () => import('pages/KajianDetailPage.vue'), name: 'kajian-detail' },
      { path: 'dakwah/mias-tv', component: () => import('pages/MiasTVPage.vue'), name: 'mias-tv' },
      { path: 'dakwah/kegiatan-ramadhan', component: () => import('pages/KegiatanRamadhanPage.vue'), name: 'kegiatan-ramadhan' },
      { path: 'dakwah/sholat-ied', component: () => import('pages/SholatIedPage.vue'), name: 'sholat-ied' },
      { path: 'sosial/:slug', component: () => import('pages/ProgramSosialPage.vue'), name: 'sosial-program' },
      { path: 'pendidikan/:slug', component: () => import('pages/PendidikanPage.vue'), name: 'pendidikan' },
      { path: 'usaha/umroh', component: () => import('pages/UmrohPage.vue'), name: 'umroh' },
      { path: 'usaha/mias-mart', component: () => import('pages/MiasMartPage.vue'), name: 'mias-mart' },
      { path: 'profil/sejarah',    component: () => import('pages/ProfilSejarahPage.vue'),   name: 'profil-sejarah' },
      { path: 'profil/visi-misi',  component: () => import('pages/ProfilVisiMisiPage.vue'),  name: 'profil-visi-misi' },
      { path: 'profil/fasilitas',  component: () => import('pages/ProfilFasilitasPage.vue'), name: 'profil-fasilitas' },
      { path: 'profil/struktur',   component: () => import('pages/ProfilStrukturPage.vue'),  name: 'profil-struktur' },
      { path: 'profil/pemateri',   component: () => import('pages/ProfilPemateriPage.vue'),  name: 'profil-pemateri' },
      { path: 'artikel', component: () => import('pages/ArtikelPage.vue'), name: 'artikel' },
      { path: 'artikel/:slug', component: () => import('pages/ArtikelDetailPage.vue'), name: 'artikel-detail' },
      { path: 'donasi', component: () => import('pages/DonasiPage.vue'), name: 'donasi' },
      { path: 'kontak', component: () => import('pages/KontakPage.vue'), name: 'kontak' },
    ],
  },

  // ─── Admin Layout ──────────────────────────────────────────────────────────
  {
    path: '/admin/login',
    component: () => import('pages/admin/LoginPage.vue'),
    name: 'admin-login',
    meta: { guestOnly: true },
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('pages/admin/DashboardPage.vue'), name: 'admin-dashboard' },
      { path: 'kajian', component: () => import('pages/admin/AdminKajianPage.vue'), name: 'admin-kajian' },
      { path: 'artikel', component: () => import('pages/admin/AdminArtikelPage.vue'), name: 'admin-artikel' },
      { path: 'donasi', component: () => import('pages/admin/AdminDonasiPage.vue'), name: 'admin-donasi' },
      { path: 'galeri', component: () => import('pages/admin/AdminGaleriPage.vue'), name: 'admin-galeri' },
      { path: 'streaming', component: () => import('pages/admin/AdminStreamingPage.vue'), name: 'admin-streaming' },
      { path: 'sosial', component: () => import('pages/admin/AdminSosialPage.vue'), name: 'admin-sosial' },
      { path: 'pendidikan', component: () => import('pages/admin/AdminPendidikanPage.vue'), name: 'admin-pendidikan' },
      { path: 'usaha', component: () => import('pages/admin/AdminUsahaPage.vue'), name: 'admin-usaha' },
      { path: 'profil', component: () => import('pages/admin/AdminProfilPage.vue'), name: 'admin-profil' },
      { path: 'setting', component: () => import('pages/admin/AdminSettingPage.vue'), name: 'admin-setting' },
    ],
  },

  // ─── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default route(function ({ store /*, ssrContext */ }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guard
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore(store);

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return next({ name: 'admin-login' });
    }

    if (to.meta.guestOnly && authStore.isLoggedIn) {
      return next({ name: 'admin-dashboard' });
    }

    next();
  });

  return Router;
});
