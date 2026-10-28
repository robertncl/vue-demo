import { shallowReactive } from 'vue'
import { en } from './messages.en'
import type { Messages } from './messages.en'
import type { LocaleCode } from '@/types/travel'

/**
 * Message bundles, loaded on demand. English ships in the main bundle as the
 * fallback; every other language is its own chunk, so a visitor downloads one
 * language rather than all twelve.
 */
const loaders: Record<Exclude<LocaleCode, 'en'>, () => Promise<Messages>> = {
  es: () => import('./messages.es').then((m) => m.es),
  fr: () => import('./messages.fr').then((m) => m.fr),
  de: () => import('./messages.de').then((m) => m.de),
  ja: () => import('./messages.ja').then((m) => m.ja),
  zh: () => import('./messages.zh').then((m) => m.zh),
  hi: () => import('./messages.hi').then((m) => m.hi),
  ar: () => import('./messages.ar').then((m) => m.ar),
  bn: () => import('./messages.bn').then((m) => m.bn),
  pt: () => import('./messages.pt').then((m) => m.pt),
  ru: () => import('./messages.ru').then((m) => m.ru),
  ur: () => import('./messages.ur').then((m) => m.ur),
}

/** Reactive, so text re-renders the moment a bundle arrives. */
const loaded = shallowReactive(new Map<LocaleCode, Messages>([['en', en]]))
const pending = new Map<LocaleCode, Promise<Messages>>()

/** The bundle for a language if it has loaded, otherwise undefined. */
export function bundleFor(code: LocaleCode): Messages | undefined {
  return loaded.get(code)
}

/**
 * Loads a language's bundle once; concurrent calls share one request. A failed
 * request is forgotten, so the next call retries rather than replaying the error.
 */
export function loadLocale(code: LocaleCode): Promise<Messages> {
  const ready = loaded.get(code)
  if (ready) return Promise.resolve(ready)
  let request = pending.get(code)
  if (!request) {
    request = loaders[code as Exclude<LocaleCode, 'en'>]()
      .then((bundle) => {
        loaded.set(code, bundle)
        return bundle
      })
      .finally(() => pending.delete(code))
    pending.set(code, request)
  }
  return request
}

/** Every language, for tests that switch freely between them. */
export function loadAllLocales(): Promise<Messages[]> {
  return Promise.all(
    (['en', ...Object.keys(loaders)] as LocaleCode[]).map((code) => loadLocale(code)),
  )
}
