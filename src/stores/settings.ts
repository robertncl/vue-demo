import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  currencies,
  currencyList,
  defaultCurrency,
  isCurrencyCode,
  isLocaleCode,
  localeList,
  locales,
  resolveBrowserLocale,
} from '@/i18n/config'
import type { CurrencyCode, LocaleCode } from '@/types/travel'

const LOCALE_KEY = 'wanderlog-locale'
const CURRENCY_KEY = 'wanderlog-currency'

function readStored<T>(key: string, guard: (value: unknown) => value is T, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return guard(raw) ? raw : fallback
  } catch {
    return fallback
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<LocaleCode>(
    readStored(LOCALE_KEY, isLocaleCode, resolveBrowserLocale(globalThis.navigator?.language)),
  )
  const currency = ref<CurrencyCode>(readStored(CURRENCY_KEY, isCurrencyCode, defaultCurrency))

  const activeLocale = computed(() => locales[locale.value])
  const activeCurrency = computed(() => currencies[currency.value])

  // Written synchronously so a reload immediately after a change keeps the choice.
  watch(
    locale,
    (value) => {
      try {
        localStorage.setItem(LOCALE_KEY, value)
      } catch {
        /* storage unavailable — the choice just won't persist */
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = value
      }
    },
    { flush: 'sync' },
  )

  watch(
    currency,
    (value) => {
      try {
        localStorage.setItem(CURRENCY_KEY, value)
      } catch {
        /* storage unavailable — the choice just won't persist */
      }
    },
    { flush: 'sync' },
  )

  /** Converts a USD amount into the active currency. */
  function fromBase(usd: number): number {
    return usd * activeCurrency.value.rate
  }

  /** Converts an amount entered in the active currency back into USD for storage. */
  function toBase(amount: number): number {
    return amount / activeCurrency.value.rate
  }

  function setLocale(value: LocaleCode) {
    locale.value = value
  }

  function setCurrency(value: CurrencyCode) {
    currency.value = value
  }

  return {
    locale,
    currency,
    activeLocale,
    activeCurrency,
    locales: localeList,
    currencies: currencyList,
    fromBase,
    toBase,
    setLocale,
    setCurrency,
  }
})
