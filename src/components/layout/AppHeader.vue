<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'
import SettingsMenu from './SettingsMenu.vue'

const route = useRoute()
const travel = useTravelStore()
const destinationsStore = useDestinationsStore()
const { t } = useI18n()

/** Counts ride along on the two links that hold saved work. */
const links = computed(() => [
  { to: '/', label: t('nav.explore'), count: 0 },
  { to: '/destinations', label: t('nav.destinations'), count: 0 },
  { to: '/wishlist', label: t('nav.wishlist'), count: destinationsStore.wishlist.length },
  { to: '/trips', label: t('nav.trips'), count: travel.trips.length },
  { to: '/about', label: t('nav.about'), count: 0 },
])

/**
 * The design marks only the page you are on, so a destination guide leaves the
 * whole bar unmarked — the breadcrumbs carry the orientation there instead.
 */
function current(to: string) {
  return route.path === to ? 'page' : undefined
}
</script>

<template>
  <header class="acme-topbar site-header">
    <RouterLink to="/" class="brand">
      <span class="acme-wordmark">
        <span class="acme-wordmark__mark" aria-hidden="true">A</span>
        ACME
      </span>
      <span class="product">{{ t('brand.name') }}</span>
    </RouterLink>

    <nav class="nav" :aria-label="t('nav.primary')">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="acme-topbar__link"
        active-class=""
        exact-active-class=""
        :aria-current="current(link.to)"
      >
        {{ link.label }}
        <span v-if="link.count" class="count num">{{ link.count }}</span>
      </RouterLink>
    </nav>

    <SettingsMenu />
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: var(--acme-space-3) var(--acme-space-6);
  flex-wrap: wrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--acme-space-3);
  text-decoration: none;
  color: var(--acme-color-text);
}

.product {
  font-size: var(--acme-text-sm);
  color: var(--acme-color-text-muted);
  border-left: 1px solid var(--acme-color-border);
  padding-left: var(--acme-space-3);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--acme-space-1);
  margin-left: auto;
}

.acme-topbar__link {
  display: inline-flex;
  align-items: center;
  gap: var(--acme-space-2);
  white-space: nowrap;
}

.count {
  color: var(--acme-color-text-subtle);
}

@media (max-width: 900px) {
  .site-header {
    gap: var(--acme-space-3);
  }

  .nav {
    order: 3;
    width: 100%;
    margin-left: 0;
    overflow-x: auto;
  }
}
</style>
