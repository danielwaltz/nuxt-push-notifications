// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@hebilicious/vue-query-nuxt',
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
  ],
  nitro: {
    storage: {
      db: {
        driver: 'cloudflare-kv-binding',
      },
    },
    devStorage: {
      db: {
        driver: 'fsLite',
        base: './.data/db',
      },
    },
  },
  runtimeConfig: {
    push: {
      vapidPrivateKey: '',
    },
    public: {
      push: {
        vapidPublicKey: '',
      },
    },
  },
  pwa: {
    strategies: 'injectManifest',
    srcDir: './service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      theme_color: '#000000',
    },
    devOptions: {
      enabled: true,
      type: 'module',
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
    },
  },
});
