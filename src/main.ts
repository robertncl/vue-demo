import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useSettingsStore } from './stores/settings'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Reflect the stored language on <html lang> before the first paint.
const settings = useSettingsStore()
document.documentElement.lang = settings.locale

app.mount('#app')
