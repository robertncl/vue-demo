<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCurrencyStore, CURRENCY_OPTIONS } from '@/stores/currency'
import { usePlannerStore } from '@/stores/planner'
import type { CurrencyCode } from '@/types/travel'

const currency = useCurrencyStore()
const planner = usePlannerStore()

function onCurrencyChange(e: Event) {
  currency.setCode((e.target as HTMLSelectElement).value as CurrencyCode)
}
</script>

<template>
  <header
    class="acme-topbar"
    style="
      display: flex;
      align-items: center;
      gap: var(--acme-space-6);
      padding: 0 var(--acme-space-6);
    "
  >
    <div style="display: flex; align-items: center; gap: var(--acme-space-3)">
      <RouterLink to="/" class="acme-wordmark">
        <span class="acme-wordmark__mark" aria-hidden="true">W</span>
        Wanderlog
      </RouterLink>
    </div>
    <nav
      aria-label="Primary"
      style="display: flex; align-items: center; gap: var(--acme-space-1); margin-left: auto"
    >
      <RouterLink to="/" class="acme-topbar__link">Explore</RouterLink>
      <RouterLink to="/destinations" class="acme-topbar__link">Destinations</RouterLink>
      <RouterLink to="/shortlist" class="acme-topbar__link">
        Shortlist
        <span
          v-if="planner.wishlist.length"
          style="font-variant-numeric: tabular-nums; color: var(--acme-color-text-subtle)"
          >{{ planner.wishlist.length }}</span
        >
      </RouterLink>
      <RouterLink to="/trips" class="acme-topbar__link">
        Trips
        <span
          v-if="planner.trips.length"
          style="font-variant-numeric: tabular-nums; color: var(--acme-color-text-subtle)"
          >{{ planner.trips.length }}</span
        >
      </RouterLink>
      <RouterLink to="/about" class="acme-topbar__link">About</RouterLink>
    </nav>
    <select
      :value="currency.code"
      class="acme-input"
      aria-label="Currency"
      style="min-height: 2rem; width: auto; font-size: var(--acme-text-sm)"
      @change="onCurrencyChange"
    >
      <option v-for="opt in CURRENCY_OPTIONS" :key="opt.code" :value="opt.code">
        {{ opt.label }}
      </option>
    </select>
  </header>
</template>
