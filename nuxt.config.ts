// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@pinia/colada-nuxt",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@vueuse/nuxt",
  ],
  css: ["~/assets/css/main.css"],
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
  experimental: {
    typescriptPlugin: true,
  },
  compatibilityDate: "2026-05-12",
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
