<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import FlightSearchForm from '@/components/flights/FlightSearchForm.vue'
import DealCard from '@/components/flights/DealCard.vue'
import TopPick from '@/components/destinations/TopPick.vue'
import { findAirport } from '@/data/airports'
import { useFlightsStore } from '@/stores/flights'
import { useI18n } from '@/i18n'
import { addDays } from '@/lib/dates'
import { dealsFrom, departureWindow } from '@/lib/deals'
import { toQuery } from '@/lib/flightSearch'
import type { FlightSearch } from '@/types/flights'

const router = useRouter()
const flights = useFlightsStore()
const { t } = useI18n()

const initial = computed(() => flights.lastSearch ?? { from: flights.homeAirport })

function go(search: FlightSearch) {
  router.push({ path: '/flights', query: toQuery(search) })
}

/** A week away, leaving some time in the next two to eight weeks. */
const deals = computed(() =>
  dealsFrom(flights.homeAirport, departureWindow(addDays(flights.today, 14), 42, 4), 7, flights.today).slice(0, 6),
)

const homeCity = computed(() => findAirport(flights.homeAirport)?.city ?? flights.homeAirport)

const tools = ['grid', 'graph', 'track'] as const
</script>

<template>
  <main class="page page--roomy home">
    <section class="intro">
      <p class="kicker">{{ t('home.eyebrow') }}</p>
      <h1>{{ t('home.title') }}</h1>
      <p class="lede">{{ t('home.lede') }}</p>
    </section>

    <FlightSearchForm :initial="initial" @search="go" />

    <section class="block">
      <div class="section-head">
        <h2>{{ t('home.dealsTitle', { city: homeCity }) }}</h2>
        <RouterLink to="/explore">{{ t('home.exploreAll') }}</RouterLink>
      </div>
      <p class="muted note">{{ t('home.dealsNote') }}</p>
      <div class="card-grid">
        <DealCard v-for="deal in deals" :key="deal.destination.slug" :deal="deal" />
      </div>
    </section>

    <section class="block">
      <TopPick />
    </section>

    <section class="block block--ruled">
      <h2>{{ t('home.toolsTitle') }}</h2>
      <ol class="steps">
        <li v-for="(tool, index) in tools" :key="tool">
          <p class="numeral" aria-hidden="true">{{ index + 1 }}</p>
          <h3>{{ t(`home.tool_${tool}Title`) }}</h3>
          <p class="muted">{{ t(`home.tool_${tool}Body`) }}</p>
        </li>
      </ol>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}

.intro {
  max-width: 60ch;
  margin-bottom: var(--acme-space-6);
}

.intro h1 {
  margin: var(--acme-space-2) 0 0;
  font-size: var(--acme-text-5xl);
}

.lede {
  margin: var(--acme-space-3) 0 0;
  font-size: var(--acme-text-lg);
  color: var(--acme-color-text-muted);
  text-wrap: pretty;
}

.block {
  margin-top: var(--acme-space-16);
}

.block--ruled {
  border-top: 1px solid var(--acme-color-border);
  padding-top: var(--acme-space-8);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--acme-space-4);
}

.section-head h2,
.block--ruled h2 {
  margin: 0;
  font-size: var(--acme-text-2xl);
}

.block--ruled h2 {
  margin-bottom: var(--acme-space-5);
}

.section-head a {
  font-size: var(--acme-text-sm);
  font-weight: 600;
}

.note {
  margin: var(--acme-space-2) 0 var(--acme-space-5);
  font-size: var(--acme-text-sm);
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--acme-space-6);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.steps .numeral {
  margin: 0;
  font-size: var(--acme-text-4xl);
}

.steps h3 {
  margin: var(--acme-space-2) 0 var(--acme-space-1);
  font-size: var(--acme-text-lg);
}

.steps p:last-of-type {
  margin: 0;
  font-size: var(--acme-text-sm);
}
</style>
