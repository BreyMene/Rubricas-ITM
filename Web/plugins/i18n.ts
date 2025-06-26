import { createI18n } from 'vue-i18n'
import { watch, ref } from 'vue'

const SUPPORTED_LOCALES = ['es', 'en']

export default defineNuxtPlugin(async (nuxtApp) => {
  const localeCookie = useCookie('locale')
  const headers = useRequestHeaders()

  const SUPPORTED_LOCALES = ['es', 'en']
  let serverLocale = 'es'

  // Solo en SSR
  if (process.server && headers['accept-language']) {
    const lang = headers['accept-language'].split(',')[0].split('-')[0]
    if (SUPPORTED_LOCALES.includes(lang)) {
      serverLocale = lang
    }
  }

  // En client
  if (process.client && typeof navigator !== 'undefined') {
    serverLocale = navigator.language.split('-')[0]
  }

  const defaultLocale = localeCookie.value && SUPPORTED_LOCALES.includes(localeCookie.value)
    ? localeCookie.value
    : serverLocale

  const i18n = createI18n({
    legacy: false,
    locale: defaultLocale,
    fallbackLocale: 'es',
    messages: {},
    missingWarn: false,
    fallbackWarn: false
  })

  nuxtApp.vueApp.use(i18n)

  async function loadLocaleMessages(locale: string) {
    if (!SUPPORTED_LOCALES.includes(locale)) locale = 'es'

    if (!i18n.global.availableLocales.includes(locale)) {
      const messages = await import(`../locales/${locale}.json`)
      i18n.global.setLocaleMessage(locale, messages.default)
    }

    i18n.global.locale.value = locale
    if (process.client) document.documentElement.lang = locale
  }

  await loadLocaleMessages(defaultLocale)

  if (process.client && !localeCookie.value && SUPPORTED_LOCALES.includes(serverLocale)) {
    localeCookie.value = defaultLocale
  }

  if (process.client) {
    watch(() => i18n.global.locale.value, async (newLocale) => {
      localeCookie.value = newLocale
      await loadLocaleMessages(newLocale)
    })
  }
})
