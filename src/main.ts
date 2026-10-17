import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useSettingsStore } from './stores/settings'

// The passenger picker and filter chips are native popovers. Browsers that
// predate the Popover API get the polyfill, loaded only when it's needed.
if (!('popover' in HTMLElement.prototype)) {
  import('@oddbird/popover-polyfill')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Reflect the stored language on <html lang> before the first paint.
const settings = useSettingsStore()
document.documentElement.lang = settings.locale

app.mount('#app')
