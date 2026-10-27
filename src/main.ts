import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useSettingsStore } from './stores/settings'
import { loadLocale } from './i18n/load'

// The passenger picker and filter chips are native popovers. Browsers that
// predate the Popover API get the polyfill, loaded only when it's needed.
if (!('popover' in HTMLElement.prototype)) {
  import('@oddbird/popover-polyfill')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Reflect the stored language on <html lang> and <html dir> before the first paint.
const settings = useSettingsStore()
document.documentElement.lang = settings.locale
document.documentElement.dir = settings.activeLocale.dir

// Fetch the saved language before the first render, so it never flashes English.
await loadLocale(settings.locale).catch(() => {
  /* offline or blocked: render in English rather than not at all */
})

app.mount('#app')
