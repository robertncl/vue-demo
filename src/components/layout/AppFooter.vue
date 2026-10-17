<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'

const destinations = useDestinationsStore()
const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <div class="inner">
      <div>
        <p>{{ t('footer.blurb') }}</p>
        <p>{{ t('settings.rateNote') }} {{ t('footer.demoNote') }}</p>
      </div>
      <nav class="links" :aria-label="t('footer.label')">
        <RouterLink to="/wishlist">
          {{ t('nav.wishlist') }}
          <span v-if="destinations.wishlist.length" class="num">({{ destinations.wishlist.length }})</span>
        </RouterLink>
        <RouterLink to="/about">{{ t('nav.about') }}</RouterLink>
      </nav>
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

.inner p + p {
  margin-top: var(--acme-space-1);
}

.links {
  display: flex;
  gap: var(--acme-space-4);
}

.links a {
  color: var(--acme-color-text-muted);
  font-weight: 500;
}
</style>
