import { loadAllLocales } from '@/i18n/load'

// Language bundles load on demand in the app. Tests switch languages and read
// text in the same tick, so every bundle is loaded up front here.
await loadAllLocales()
