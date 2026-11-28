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
  border-top: var(--mod-stroke-rule) solid var(--mod-ink);
  background: var(--mod-paper);
  padding: var(--mod-space-4) var(--mod-space-5) var(--mod-space-6);
}

.inner {
  width: 100%;
  max-width: calc(var(--mod-grid-max) - 2 * var(--mod-space-5));
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: var(--mod-space-3);
  flex-wrap: wrap;
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
}

.inner p {
  margin: 0;
}

.inner p + p {
  margin-top: var(--mod-space-1);
}

.links {
  display: flex;
  gap: var(--mod-space-3);
}

.links a {
  font-weight: 600;
}
</style>
