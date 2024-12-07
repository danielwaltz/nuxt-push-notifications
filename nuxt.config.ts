// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-04",
  modules: [
    "@hebilicious/vue-query-nuxt",
    "@nuxt/eslint",
    "@nuxt/ui",
    "@vite-pwa/nuxt",
    "@vueuse/nuxt",
  ],
  future: {
    compatibilityVersion: 4,
  },
  nitro: {
    storage: {
      db: {
        driver: "fsLite",
        base: "./.data/db",
      },
    },
  },
  runtimeConfig: {
    push: {
      vapidPrivateKey: "",
    },
    public: {
      push: {
        vapidPublicKey: "",
      },
      siteUrl: "http://localhost:3000",
    },
  },
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
  pwa: {
    strategies: "injectManifest",
    srcDir: "./service-worker",
    filename: "sw.ts",
    registerType: "autoUpdate",
    manifest: {
      theme_color: "#000000",
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },
});
