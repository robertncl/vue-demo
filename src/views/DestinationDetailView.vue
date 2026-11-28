<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useTravelStore } from '@/stores/travel'
import { useFlightsStore } from '@/stores/flights'
import { useI18n } from '@/i18n'
import DestinationMedia from '@/components/destinations/DestinationMedia.vue'
import StatusIcon from '@/components/common/StatusIcon.vue'
import { findAirport } from '@/data/airports'
import { addDays } from '@/lib/dates'
import { cheapestTrip, departureWindow } from '@/lib/deals'
import { toQuery } from '@/lib/flightSearch'
import type { Destination } from '@/types/travel'

const route = useRoute()
const store = useDestinationsStore()
const travel = useTravelStore()
const flights = useFlightsStore()
const { t, money, month, region, date } = useI18n()

const destination = computed(() => store.bySlug(String(route.params.slug)))

/** The cheapest week here from your airport, leaving in the next two to eight weeks. */
const flightDeal = computed(() =>
  destination.value
    ? cheapestTrip(
        destination.value,
        flights.homeAirport,
        departureWindow(addDays(flights.today, 14), 42, 4),
        7,
        flights.today,
      )
    : null,
)
const homeCity = computed(() => findAirport(flights.homeAirport)?.city ?? flights.homeAirport)

/** A sensible one-week budget to pre-fill the planner with. */
const weekBudget = computed(() => (destination.value ? destination.value.dailyBudget * 7 : 0))

/**
 * Where a day's money goes. Bars are scaled against the largest line, and only
 * that line takes the Blue highlight — the rest stay neutral data marks.
 */
const breakdown = computed(() => {
  const d = destination.value
  if (!d) return []
  const parts = [
    { key: 'stay', label: t('detail.stay'), value: d.budgetBreakdown.stay },
    { key: 'food', label: t('detail.food'), value: d.budgetBreakdown.food },
    { key: 'transport', label: t('detail.transport'), value: d.budgetBreakdown.transport },
    { key: 'activities', label: t('detail.activitiesCost'), value: d.budgetBreakdown.activities },
  ]
  const max = Math.max(...parts.map((part) => part.value)) || 1
  return parts.map((part) => ({
    ...part,
    percent: Math.round((part.value / max) * 100),
    leads: part.value === max,
  }))
})

const practical = computed(() => {
  const d = destination.value
  if (!d) return []
  return [
    { label: t('detail.language'), value: d.practical.language },
    { label: t('detail.localCurrency'), value: d.practical.currency },
    { label: t('detail.timeZone'), value: d.practical.timeZone },
    { label: t('detail.plug'), value: d.practical.plug },
    { label: t('detail.visa'), value: d.practical.visa },
    { label: t('detail.gettingAround'), value: d.practical.gettingAround },
    { label: t('detail.safety'), value: d.practical.safety },
  ]
})

const related = computed(() =>
  destination.value
    ? store.catalog
        .filter(
          (d: Destination) =>
            d.slug !== destination.value!.slug && d.region === destination.value!.region,
        )
        .slice(0, 3)
    : [],
)

const alreadyPlanned = computed(
  () =>
    !!destination.value &&
    travel.trips.some((trip) => trip.destination.includes(destination.value!.name)),
)

/** Hands the planner a pre-filled week at this destination. */
const planRoute = computed(() => ({
  path: '/trips',
  query: {
    destination: destination.value ? `${destination.value.name}, ${destination.value.country}` : '',
    budget: String(weekBudget.value),
  },
}))
</script>

<template>
  <main class="page page--tight">
    <template v-if="destination">
      <nav class="mod-breadcrumbs" :aria-label="t('detail.breadcrumbs')">
        <RouterLink to="/destinations">{{ t('nav.guides') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ destination.name }}</span>
      </nav>

      <div class="layout">
        <article>
          <header class="guide-head">
            <div class="guide-kicker">
              <p class="kicker">{{ region(destination.region) }} · {{ destination.country }}</p>
              <span v-if="store.inSeason(destination)" class="mod-badge mod-badge--success season-flag">
                <StatusIcon variant="success" :size="12" />
                {{ t('common.inSeasonNow') }}
              </span>
            </div>
            <h1>{{ destination.name }}</h1>
            <p class="tagline">{{ destination.tagline }}</p>
          </header>

          <div class="hero">
            <DestinationMedia :label="t('media.photoOf', { name: destination.name })" />
          </div>

          <section class="prose">
            <p class="summary">{{ destination.summary }}</p>
            <p v-for="(para, index) in destination.overview" :key="index">{{ para }}</p>
          </section>

          <section class="block">
            <h2>{{ t('detail.dontMiss') }}</h2>
            <ul class="highlights">
              <li v-for="item in destination.highlights" :key="item" class="mod-badge highlight">
                {{ item }}
              </li>
            </ul>
          </section>

          <section class="block">
            <h2>{{ t('detail.neighbourhoods') }}</h2>
            <div class="areas">
              <div v-for="area in destination.neighbourhoods" :key="area.name" class="mod-card">
                <div class="mod-card__body area">
                  <h3>{{ area.name }}</h3>
                  <p class="best-for">{{ t('detail.bestFor', { what: area.bestFor }) }}</p>
                  <p class="area-body">{{ area.description }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="block">
            <h2>{{ t('detail.itinerary') }}</h2>
            <div class="plans">
              <div v-for="plan in destination.sampleItinerary" :key="plan.day" class="mod-card">
                <div class="mod-card__body plan">
                  <div class="plan-head">
                    <span class="numeral" aria-hidden="true">{{ plan.day }}</span>
                    <h3>{{ plan.title }}</h3>
                  </div>
                  <table class="mod-table">
                    <tbody>
                      <tr>
                        <th scope="row">{{ t('detail.morning') }}</th>
                        <td>{{ plan.morning }}</td>
                      </tr>
                      <tr>
                        <th scope="row">{{ t('detail.afternoon') }}</th>
                        <td>{{ plan.afternoon }}</td>
                      </tr>
                      <tr>
                        <th scope="row">{{ t('detail.evening') }}</th>
                        <td>{{ plan.evening }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section class="block lists">
            <div>
              <h2>{{ t('detail.foodPicks') }}</h2>
              <ul class="bullets">
                <li v-for="item in destination.foodPicks" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div>
              <h2>{{ t('detail.dayTrips') }}</h2>
              <ul class="bullets">
                <li v-for="item in destination.dayTrips" :key="item">{{ item }}</li>
              </ul>
            </div>
          </section>

          <section class="block">
            <h2>{{ t('detail.seasons') }}</h2>
            <div class="mod-card table-card">
              <table class="mod-table">
                <tbody>
                  <tr v-for="item in destination.seasons" :key="item.label" class="season">
                    <td class="season-months num">
                      {{ item.months.map((m) => month(m, true)).join(' · ') }}
                    </td>
                    <td class="season-label">{{ item.label }}</td>
                    <td>{{ item.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="block">
            <h2>{{ t('detail.practical') }}</h2>
            <div class="mod-card table-card practical">
              <table class="mod-table">
                <tbody>
                  <tr v-for="row in practical" :key="row.label">
                    <th scope="row" class="practical-label">{{ row.label }}</th>
                    <td>{{ row.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="related.length">
            <h2>{{ t('detail.moreIn', { region: region(destination.region) }) }}</h2>
            <div class="related">
              <RouterLink
                v-for="item in related"
                :key="item.slug"
                class="mod-card mod-card--interactive related-item"
                :to="`/destinations/${item.slug}`"
              >
                <strong>{{ item.name }}</strong>
                <span class="num muted">{{ money(item.dailyBudget) }}</span>
              </RouterLink>
            </div>
          </section>
        </article>

        <aside class="mod-card panel">
          <div class="figures">
            <p class="panel-label">{{ t('detail.dailyBudget') }}</p>
            <p class="panel-price num">{{ money(destination.dailyBudget) }}</p>
            <p class="panel-note">{{ t('detail.weekNote', { amount: money(weekBudget) }) }}</p>
          </div>

          <div class="panel-section">
            <p class="panel-label">{{ t('detail.breakdown') }}</p>
            <div v-for="part in breakdown" :key="part.key" class="legend">
              <div class="legend-row">
                <span>{{ part.label }}</span>
                <span class="num legend-amount">{{ money(part.value) }}</span>
              </div>
              <div class="bar">
                <span
                  class="seg"
                  :class="{ leads: part.leads }"
                  :style="{ width: `${part.percent}%` }"
                ></span>
              </div>
            </div>
          </div>

          <div v-if="flightDeal" class="panel-section flights">
            <p class="panel-label">{{ t('detail.flightsFrom', { city: homeCity }) }}</p>
            <p class="panel-price num">{{ money(flightDeal.total) }}</p>
            <p class="panel-note">
              {{
                t('detail.flightsNote', {
                  dates: `${date(flightDeal.search.depart)} – ${date(flightDeal.search.return!)}`,
                })
              }}
            </p>
            <RouterLink
              class="mod-btn mod-btn--secondary"
              :to="{ path: '/flights', query: toQuery(flightDeal.search) }"
            >
              {{ t('deals.viewFlights') }}
            </RouterLink>
          </div>

          <div class="panel-section actions">
            <RouterLink class="mod-btn mod-btn--primary" :to="planRoute">
              {{ t('detail.planTrip') }}
            </RouterLink>
            <button
              class="mod-btn mod-btn--secondary"
              type="button"
              :aria-pressed="store.isWishlisted(destination.slug)"
              @click="store.toggleWishlist(destination.slug)"
            >
              {{ store.isWishlisted(destination.slug) ? t('detail.saved') : t('detail.save') }}
            </button>
            <div v-if="alreadyPlanned" class="mod-alert planned" role="status">
              <span class="mod-alert__icon"><StatusIcon variant="info" /></span>
              <p>{{ t('detail.alreadyPlanned') }}</p>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="mod-card empty-state">
      <h1>{{ t('detail.notFoundTitle') }}</h1>
      <p class="muted">{{ t('detail.notFoundBody', { slug: String(route.params.slug) }) }}</p>
      <RouterLink class="mod-btn mod-btn--primary" to="/destinations">
        {{ t('detail.notFoundCta') }}
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.page--tight {
  padding-top: var(--mod-space-4);
}

.mod-breadcrumbs {
  margin-bottom: var(--mod-space-4);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--mod-space-6);
  align-items: start;
}

.guide-head {
  margin-bottom: var(--mod-space-4);
}

.guide-kicker {
  display: flex;
  align-items: center;
  gap: var(--mod-space-3);
  flex-wrap: wrap;
}

.guide-head h1 {
  margin: var(--mod-space-2) 0 0;
  font-size: var(--mod-size-display);
}

.tagline {
  margin: var(--mod-space-2) 0 0;
  font-size: var(--mod-size-heading-3);
  color: var(--mod-ink-2);
}

.hero {
  border: 1px solid var(--mod-rule);
  border-radius: var(--mod-radius-none);
  overflow: hidden;
  margin: var(--mod-space-5) 0;
}

.prose {
  max-width: 68ch;
  margin-bottom: var(--mod-space-6);
}

.prose p {
  text-wrap: pretty;
}

.summary {
  font-size: var(--mod-size-heading-3);
}

.block {
  margin-bottom: var(--mod-space-6);
}

h2 {
  margin: 0 0 var(--mod-space-3);
  font-size: var(--mod-size-heading-2);
}

.highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--mod-space-2);
}

.highlight {
  font-size: var(--mod-size-small);
  padding: var(--mod-space-2) var(--mod-space-3);
}

.areas {
  display: grid;
  gap: var(--mod-space-3);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.area h3 {
  margin: 0 0 var(--mod-space-1);
  font-size: var(--mod-size-heading-3);
}

.best-for {
  margin: 0 0 var(--mod-space-2);
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
  font-weight: 600;
}

.area-body {
  margin: 0;
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
  text-wrap: pretty;
}

.plans {
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-3);
}

.plan-head {
  display: flex;
  align-items: baseline;
  gap: var(--mod-space-3);
  margin-bottom: var(--mod-space-3);
}

.plan-head .numeral {
  font-size: var(--mod-size-heading-2);
}

.plan-head h3 {
  margin: 0;
  font-size: var(--mod-size-heading-3);
}

.plan .mod-table th {
  width: 7rem;
  text-transform: none;
  letter-spacing: 0;
  font-size: var(--mod-size-small);
  font-weight: 400;
  border-block-end: 1px solid var(--mod-rule);
}

.lists {
  display: grid;
  gap: var(--mod-space-5);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.bullets {
  margin: 0;
  padding-inline-start: var(--mod-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-2);
  font-size: var(--mod-size-small);
}

.season-months {
  width: 9rem;
  color: var(--mod-ink-2);
}

.season-label {
  width: 11rem;
  font-weight: 600;
}

.practical-label {
  width: 11rem;
  text-transform: none;
  letter-spacing: 0;
  font-size: var(--mod-size-small);
  font-weight: 400;
  color: var(--mod-ink-2);
  border-block-end: 1px solid var(--mod-rule);
}

.related {
  display: grid;
  gap: var(--mod-space-3);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.related-item {
  flex-direction: row;
  justify-content: space-between;
  gap: var(--mod-space-3);
  padding: var(--mod-space-3);
  text-decoration: none;
  color: var(--mod-ink);
}

.panel {
  padding: var(--mod-space-4);
  gap: var(--mod-space-3);
  position: sticky;
  /* Clears the sticky top bar. */
  top: var(--mod-space-8);
}

.panel-label {
  margin: 0;
  font-size: var(--mod-size-label);
  font-weight: 600;
  color: var(--mod-ink-2);
}

.panel-price {
  margin: 0;
  font-size: var(--mod-size-heading-2);
  font-weight: 600;
}

.panel-note {
  margin: 0;
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
}

.panel-section {
  border-top: 1px solid var(--mod-rule);
  padding-top: var(--mod-space-3);
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-3);
}

.legend-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--mod-size-small);
  margin-bottom: var(--mod-space-1);
}

.legend-amount {
  font-weight: 600;
}

.bar {
  height: 6px;
  background: var(--mod-paper-2);
  border: 1px solid var(--mod-rule);
  border-radius: var(--mod-radius-none);
  overflow: hidden;
}

.seg {
  display: block;
  height: 100%;
  background: var(--mod-data-line);
}

.seg.leads {
  background: var(--mod-data-highlight);
}

.actions {
  gap: var(--mod-space-2);
}

.planned {
  margin: var(--mod-space-2) 0 0;
}

.empty-state h1 {
  font-size: var(--mod-size-heading-2);
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel {
    position: static;
  }
}
</style>
