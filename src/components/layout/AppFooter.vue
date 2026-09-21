<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <div class="inner">
      <p>{{ t('footer.blurb') }}</p>
      <p>{{ t('settings.rateNote') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--acme-color-border);
  background: var(--acme-color-surface-raised);
  padding: var(--acme-space-6);
}

.inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: var(--acme-space-4);
  flex-wrap: wrap;
  font-size: var(--acme-text-sm);
  color: var(--acme-color-text-muted);
}

.inner p {
  margin: 0;
}
</style>
