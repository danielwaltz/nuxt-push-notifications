// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt', '@vueuse/nuxt', '@nuxt/ui'],
  nitro: {
    storage: {
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
  devServer: {
    host: '0.0.0.0',
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
