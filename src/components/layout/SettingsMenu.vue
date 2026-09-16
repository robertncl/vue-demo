<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/i18n'
import type { CurrencyCode, LocaleCode } from '@/types/travel'

const settings = useSettingsStore()
const { t } = useI18n()

function onLocale(event: Event) {
  settings.setLocale((event.target as HTMLSelectElement).value as LocaleCode)
}

function onCurrency(event: Event) {
  settings.setCurrency((event.target as HTMLSelectElement).value as CurrencyCode)
}
</script>

<template>
  <div class="settings">
    <label class="control">
      <span class="sr-only">{{ t('settings.language') }}</span>
      <select
        class="picker"
        :value="settings.locale"
        :title="t('settings.language')"
        :aria-label="t('settings.language')"
        @change="onLocale"
      >
        <option v-for="option in settings.locales" :key="option.code" :value="option.code">
          {{ option.flag }} {{ option.label }}
        </option>
      </select>
    </label>

    <label class="control">
      <span class="sr-only">{{ t('settings.currency') }}</span>
      <select
        class="picker"
        :value="settings.currency"
        :title="t('settings.currency')"
        :aria-label="t('settings.currency')"
        @change="onCurrency"
      >
        <option v-for="option in settings.currencies" :key="option.code" :value="option.code">
          {{ option.symbol }} {{ option.code }}
        </option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.control {
  display: block;
}

.picker {
  width: auto;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 999px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  cursor: pointer;
}

.picker:hover {
  border-color: var(--c-brand);
}

@media (max-width: 760px) {
  .settings {
    width: 100%;
  }

  .picker {
    width: 100%;
  }
}
</style>
