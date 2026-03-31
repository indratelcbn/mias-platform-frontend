/* eslint-env node */
const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    eslint: {
      fix: true,
      include: [],
      exclude: [],
      rawOptions: {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    boot: ['axios'],

    css: ['app.scss'],

    extras: ['material-icons', 'fontawesome-v6', 'roboto-font'],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20',
      },

      vueRouterMode: 'history',

      vitePlugins: [],
    },

    devServer: {
      open: true,
      port: ctx.mode.ssr ? 9100 : 9000,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },

    framework: {
      config: {
        // Quasar config
        dark: 'auto', // support dark mode
        notify: { position: 'top-right', timeout: 3000 },
        loading: { message: 'Memuat...' },
      },

      plugins: ['Notify', 'Loading', 'Dialog', 'LocalStorage'],

      lang: 'id', // Indonesian
    },

    animations: 'all',

    ssr: { pwa: false },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },

    cordova: {},
    capacitor: { hideSplashscreen: true },
    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'mias2026-frontend',
      },
    },
    bex: {
      contentScripts: ['my-content-script'],
    },
  };
});
