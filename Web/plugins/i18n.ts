import { createI18n } from 'vue-i18n'
import { watch, ref } from 'vue'

const SUPPORTED_LOCALES = ['es', 'en']

export default defineNuxtPlugin(async (nuxtApp) => {
  const localeCookie = useCookie('locale')
  let browserLocale = 'es'
  if (process.client) {
    browserLocale = navigator.language.split('-')[0]
  }

  // Determina el idioma inicial
  const defaultLocale = localeCookie.value && SUPPORTED_LOCALES.includes(localeCookie.value)
    ? localeCookie.value
    : (SUPPORTED_LOCALES.includes(browserLocale) ? browserLocale : 'es')

  // Crear instancia i18n con un idioma inicial vacío para mensajes
  const i18n = createI18n({
    legacy: false,
    locale: defaultLocale,
    fallbackLocale: 'es',
    messages: {}, // vacio para cargar dinámicamente
    missingWarn: false,
    fallbackWarn: false
  })

  nuxtApp.vueApp.use(i18n)

  // Función para cargar los mensajes dinámicamente
  async function loadLocaleMessages(locale: string) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      locale = 'es' // fallback
    }

    // Verifica si ya están cargados para no volver a cargar
    if (!i18n.global.availableLocales.includes(locale)) {
      const messages = await import(
        /* @vite-ignore */
        `../locales/${locale}.json`
      )
      i18n.global.setLocaleMessage(locale, messages.default)
    }

    i18n.global.locale.value = locale
    if (process.client) {
        document.documentElement.lang = locale
    }
  }

  // Cargar idioma inicial
  await loadLocaleMessages(defaultLocale)

  // Watch para guardar la cookie cuando cambie idioma y cargar nuevos mensajes
  if (process.client) {
    watch(() => i18n.global.locale.value, async (newLocale) => {
      localeCookie.value = newLocale
      await loadLocaleMessages(newLocale)
    })
  }
})
