<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import { useFlightsStore } from '@/stores/flights'
import { useI18n } from '@/i18n'
import SettingsMenu from './SettingsMenu.vue'

const route = useRoute()
const travel = useTravelStore()
const flights = useFlightsStore()
const { t } = useI18n()

/** Counts ride along on the two links that hold saved work. */
const links = computed(() => [
  { to: '/', label: t('nav.flights'), count: 0, also: ['/flights'] },
  { to: '/explore', label: t('nav.explore'), count: 0, also: [] },
  { to: '/tracked', label: t('nav.tracked'), count: flights.tracked.length, also: [] },
  { to: '/trips', label: t('nav.trips'), count: travel.trips.length, also: [] },
  { to: '/destinations', label: t('nav.guides'), count: 0, also: [] },
])

/**
 * The design marks only the page you are on, so a destination guide leaves the
 * whole bar unmarked — the breadcrumbs carry the orientation there instead.
 * Flight results are the one exception: they are the Flights page, searched.
 */
function current(link: { to: string; also: string[] }) {
  return route.path === link.to || link.also.includes(route.path) ? 'page' : undefined
}
</script>

<template>
  <header class="mod-topbar site-header">
    <RouterLink to="/" class="mod-wordmark brand">{{ t('brand.name') }}</RouterLink>

    <nav class="mod-topbar__nav nav" :aria-label="t('nav.primary')">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="mod-topbar__link"
        active-class=""
        exact-active-class=""
        :aria-current="current(link)"
      >
        {{ link.label }}
        <span v-if="link.count" class="count num">{{ link.count }}</span>
      </RouterLink>
    </nav>

    <div class="mod-topbar__actions">
      <SettingsMenu />
    </div>
  </header>
</template>

<style scoped>
/* Modernist top bar: an 8px ink bar, the product name in Archivo 800, the
   pages beside it, then the actions slot pushed to the end. */
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
}

.mod-topbar__link {
  white-space: nowrap;
}

.count {
  padding: 2px 6px;
  border: 1px solid currentColor;
  font-size: var(--mod-size-label);
  font-weight: 700;
  line-height: 1.2;
}

@media (max-width: 900px) {
  .nav {
    order: 3;
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
  }
}
</style>
