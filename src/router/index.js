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
      { path: 'dakwah/kegiatan-qurban', component: () => import('pages/KegiatanQurbanPage.vue'), name: 'kegiatan-qurban' },
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
      { path: 'donasi/program-donasi', component: () => import('pages/ProgramDonasiPage.vue'), name: 'program-donasi' },
      { path: 'donasi/program-wakaf', component: () => import('pages/ProgramWakafPage.vue'), name: 'program-wakaf' },
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
      { path: 'dashboard', component: () => import('pages/admin/DashboardPage.vue'), name: 'admin-dashboard', meta: { menuKey: 'admin-dashboard' } },
      { path: 'kajian', component: () => import('pages/admin/AdminKajianPage.vue'), name: 'admin-kajian', meta: { menuKey: 'admin-kajian' } },
      { path: 'artikel', component: () => import('pages/admin/AdminArtikelPage.vue'), name: 'admin-artikel', meta: { menuKey: 'admin-artikel' } },
      { path: 'donasi', component: () => import('pages/admin/AdminDonasiPage.vue'), name: 'admin-donasi', meta: { menuKey: 'admin-donasi' } },
      { path: 'pesan', component: () => import('pages/admin/AdminPesanPage.vue'), name: 'admin-pesan', meta: { menuKey: 'admin-pesan' } },
      { path: 'qurban', redirect: '/admin/galeri' },
      { path: 'galeri', component: () => import('pages/admin/AdminGaleriPage.vue'), name: 'admin-galeri', meta: { menuKey: 'admin-galeri' } },
      { path: 'streaming', component: () => import('pages/admin/AdminStreamingPage.vue'), name: 'admin-streaming', meta: { menuKey: 'admin-streaming' } },
      { path: 'sosial', component: () => import('pages/admin/AdminSosialPage.vue'), name: 'admin-sosial', meta: { menuKey: 'admin-sosial' } },
      { path: 'mustahik', component: () => import('pages/admin/AdminMustahikPage.vue'), name: 'admin-mustahik', meta: { menuKey: 'admin-mustahik' } },
      { path: 'pendidikan', component: () => import('pages/admin/AdminPendidikanPage.vue'), name: 'admin-pendidikan', meta: { menuKey: 'admin-pendidikan' } },
      { path: 'usaha', component: () => import('pages/admin/AdminUsahaPage.vue'), name: 'admin-usaha', meta: { menuKey: 'admin-usaha' } },
      { path: 'profil', component: () => import('pages/admin/AdminProfilPage.vue'), name: 'admin-profil', meta: { menuKey: 'admin-profil' } },
      { path: 'setting', component: () => import('pages/admin/AdminSettingPage.vue'), name: 'admin-setting', meta: { menuKey: 'admin-setting' } },
      { path: 'hero-banner', component: () => import('pages/admin/AdminHeroBannerPage.vue'), name: 'admin-hero-banner', meta: { menuKey: 'admin-setting' } },
      { path: 'users', component: () => import('pages/admin/AdminUsersPage.vue'), name: 'admin-users', meta: { menuKey: 'admin-users', superadminOnly: true } },
      
      // Finance Routes
      { path: 'finance/dashboard', component: () => import('pages/admin/AdminFinanceDashboardPage.vue'), name: 'admin-finance-dashboard', meta: { menuKey: 'admin-finance' } },
      { path: 'finance/accounts', component: () => import('pages/admin/AdminFinanceAccountsPage.vue'), name: 'admin-finance-accounts', meta: { menuKey: 'admin-finance' } },
      { path: 'finance/transactions', component: () => import('pages/admin/AdminFinanceTransactionsPage.vue'), name: 'admin-finance-transactions', meta: { menuKey: 'admin-finance' } },
      { path: 'finance/reconciliation', component: () => import('pages/admin/AdminFinanceReconciliationPage.vue'), name: 'admin-finance-reconciliation', meta: { menuKey: 'admin-finance' } },
      { path: 'finance/report', component: () => import('pages/admin/AdminFinanceReportPage.vue'), name: 'admin-finance-report', meta: { menuKey: 'admin-finance' } },
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

    // Must be logged in for requiresAuth routes
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return next({ name: 'admin-login' });
    }

    // Redirect logged-in users away from guest-only pages
    if (to.meta.guestOnly && authStore.isLoggedIn) {
      const landing = authStore.landingRoute || 'admin-dashboard';
      return next({ name: landing });
    }

    // SUPERADMIN-only routes
    if (to.meta.superadminOnly && !authStore.isSuperadmin) {
      const landing = authStore.landingRoute;
      if (landing && landing !== to.name) return next({ name: landing });
      return next(false);
    }

    // Permission-based guard for admin menu pages
    if (to.meta.menuKey && authStore.isLoggedIn) {
      if (!authStore.hasPermission(to.meta.menuKey)) {
        const landing = authStore.landingRoute;
        // Avoid infinite redirect: if user has no permitted page or already
        // navigating to it, fall back to login.
        if (!landing) {
          authStore.logout();
          return next({ name: 'admin-login' });
        }
        if (landing === to.name) {
          return next(false);
        }
        return next({ name: landing });
      }
    }

    next();
  });

  return Router;
});
