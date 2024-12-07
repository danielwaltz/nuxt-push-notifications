// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@hebilicious/vue-query-nuxt",
    "@nuxt/eslint",
    "@nuxt/ui",
    "@vite-pwa/nuxt",
    "@vueuse/nuxt",
  ],
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
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2024-11-04",
  nitro: {
    storage: {
      db: {
        driver: "fsLite",
        base: "./.data/db",
      },
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
