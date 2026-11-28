<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import AirportInput from '@/components/flights/AirportInput.vue'
import DealCard from '@/components/flights/DealCard.vue'
import { findAirport } from '@/data/airports'
import { regions } from '@/data/destinations'
import { useFlightsStore } from '@/stores/flights'
import { useI18n } from '@/i18n'
import { NIGHTS, dealsFrom, departuresInMonth, tripLengths, upcomingMonths, type TripLength } from '@/lib/deals'
import type { Region } from '@/types/travel'

const flights = useFlightsStore()
const { t, plural, date, region: regionName } = useI18n()
const uid = useId()

const origin = ref(flights.homeAirport)
const months = computed(() => upcomingMonths(flights.today))
const month = ref(months.value[1]!)
const length = ref<TripLength>('week')
const region = ref<Region | 'all'>('all')
const nonstopOnly = ref(false)

/** The last airport that resolved, so a half-typed one doesn't empty the page. */
const from = ref(origin.value)
watch(origin, (code) => {
  if (findAirport(code)) from.value = code
})

const deals = computed(() =>
  dealsFrom(from.value, departuresInMonth(month.value, length.value), NIGHTS[length.value], flights.today),
)

const shown = computed(() =>
  deals.value.filter(
    (deal) =>
      (region.value === 'all' || deal.destination.region === region.value) &&
      (!nonstopOnly.value || deal.outbound.stops === 0),
  ),
)

const fromCity = computed(() => findAirport(from.value)?.city ?? from.value)
</script>

<template>
  <main class="page explore">
    <header class="head">
      <p class="kicker">{{ t('explore.eyebrow') }}</p>
      <h1>{{ t('explore.title', { city: fromCity }) }}</h1>
      <p class="sub">{{ t('explore.subtitle') }}</p>
    </header>

    <form class="mod-card controls" :aria-label="t('explore.controlsLabel')" @submit.prevent>
      <AirportInput :id="`${uid}-from`" v-model="origin" name="from" :label="t('search.from')" />

      <div class="mod-field">
        <label class="mod-label" :for="`${uid}-month`">{{ t('explore.when') }}</label>
        <select :id="`${uid}-month`" v-model="month" class="mod-input" name="month">
          <option v-for="option in months" :key="option" :value="option">{{ date(option, 'month') }}</option>
        </select>
      </div>

      <fieldset class="mod-field length">
        <legend class="mod-label">{{ t('explore.length') }}</legend>
        <div class="segmented">
          <label v-for="option in tripLengths" :key="option">
            <input v-model="length" class="mod-visually-hidden" type="radio" :name="`${uid}-length`" :value="option" />
            <span>{{ t(`explore.length_${option}`) }}</span>
          </label>
        </div>
      </fieldset>

      <div class="mod-field">
        <label class="mod-label" :for="`${uid}-region`">{{ t('destinations.region') }}</label>
        <select :id="`${uid}-region`" v-model="region" class="mod-input" name="region">
          <option value="all">{{ t('destinations.allRegions') }}</option>
          <option v-for="option in regions" :key="option" :value="option">{{ regionName(option) }}</option>
        </select>
      </div>

      <label class="mod-switch nonstop">
        <input v-model="nonstopOnly" type="checkbox" name="nonstop" />
        {{ t('explore.nonstopOnly') }}
      </label>
    </form>

    <p class="count" aria-live="polite">
      {{ plural('explore.count', shown.length) }} {{ t('explore.priceNote') }}
    </p>

    <div v-if="shown.length" class="card-grid">
      <DealCard v-for="deal in shown" :key="deal.destination.slug" :deal="deal" />
    </div>
    <div v-else class="mod-card empty-state">
      <h2>{{ t('explore.emptyTitle') }}</h2>
      <p class="muted">{{ t('explore.emptyBody') }}</p>
    </div>
  </main>
</template>

<style scoped>
.head {
  margin-bottom: var(--mod-space-4);
}

.head h1 {
  margin: var(--mod-space-2) 0 0;
}

.sub {
  margin: var(--mod-space-2) 0 0;
  color: var(--mod-ink-2);
  max-width: 60ch;
}

.controls {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--mod-space-3);
  padding: var(--mod-space-3) var(--mod-space-4);
  overflow: visible;
}

.controls > :first-child {
  flex: 1 1 220px;
}

.length {
  margin: 0;
  padding: 0;
  border: none;
}

.nonstop {
  min-height: 2.5rem;
}

.count {
  margin: var(--mod-space-4) 0 var(--mod-space-3);
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
}
</style>
