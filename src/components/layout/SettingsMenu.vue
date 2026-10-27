<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { loadLocale, useI18n } from '@/i18n'
import type { CurrencyCode, LocaleCode } from '@/types/travel'

const settings = useSettingsStore()
const { t } = useI18n()

/** Switch once the language's messages have arrived, so the page never flashes English. */
async function onLocale(event: Event) {
  const code = (event.target as HTMLSelectElement).value as LocaleCode
  await loadLocale(code).catch(() => {
    /* switch anyway; English fills in for missing strings */
  })
  settings.setLocale(code)
}

function onCurrency(event: Event) {
  settings.setCurrency((event.target as HTMLSelectElement).value as CurrencyCode)
}
</script>

<template>
  <div class="settings">
    <select
      class="acme-input picker"
      :value="settings.locale"
      :aria-label="t('settings.language')"
      @change="onLocale"
    >
      <option v-for="option in settings.locales" :key="option.code" :value="option.code">
        {{ option.label }}
      </option>
    </select>

    <select
      class="acme-input picker"
      :value="settings.currency"
      :aria-label="t('settings.currency')"
      @change="onCurrency"
    >
      <option v-for="option in settings.currencies" :key="option.code" :value="option.code">
        {{ option.symbol }} {{ option.code }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  align-items: center;
  gap: var(--acme-space-2);
}

.picker {
  min-height: 2rem;
  width: auto;
  font-size: var(--acme-text-sm);
}
</style>
