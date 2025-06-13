// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  modules: ['@nuxt/image', '@nuxt/fonts', '@nuxt/ui', '@pinia/nuxt','pinia-plugin-persistedstate/nuxt', "nuxt-charts"],

  colorMode: {
    preference: 'system', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
    classSuffix: '', // Class name suffix for color mode
  },

  devServer: {
    host: '0.0.0.0'
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,
    },
  },
})
