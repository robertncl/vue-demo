import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CurrencyCode } from '@/types/travel'

const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156,
  AUD: 1.52,
  CAD: 1.37,
}

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' },
  { code: 'GBP', label: '£ GBP' },
  { code: 'JPY', label: '¥ JPY' },
  { code: 'AUD', label: 'A$ AUD' },
  { code: 'CAD', label: 'C$ CAD' },
]

export const useCurrencyStore = defineStore('currency', () => {
  const code = ref<CurrencyCode>('USD')

  const rate = computed(() => RATES[code.value])

  function money(usd: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code.value,
      maximumFractionDigits: 0,
    }).format(usd * rate.value)
  }

  /** Converts an amount already expressed in `code`'s currency back to USD. */
  function toUsd(amount: number): number {
    return amount / rate.value
  }

  function setCode(next: CurrencyCode) {
    code.value = next
  }

  return { code, rate, money, toUsd, setCode }
})
