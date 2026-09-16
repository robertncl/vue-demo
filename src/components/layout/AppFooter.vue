<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <div class="container inner">
      <p>
        <strong>{{ t('brand.name') }}</strong> — {{ t('footer.blurb') }}
      </p>
      <p class="muted">{{ t('footer.built') }}</p>
      <p class="muted rates">{{ t('settings.rateNote') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
  padding: 1.75rem 0;
  font-size: 0.875rem;
}

.inner {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  flex-wrap: wrap;
}

.rates {
  flex-basis: 100%;
  font-size: 0.8rem;
}
</style>
