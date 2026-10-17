<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FlightSearchForm from '@/components/flights/FlightSearchForm.vue'
import FilterBar from '@/components/flights/FilterBar.vue'
import FlightRow from '@/components/flights/FlightRow.vue'
import DateStrip from '@/components/flights/DateStrip.vue'
import DateGrid from '@/components/flights/DateGrid.vue'
import PriceGraph from '@/components/flights/PriceGraph.vue'
import PriceInsights from '@/components/flights/PriceInsights.vue'
import ModalDialog from '@/components/flights/ModalDialog.vue'
import { findAirport } from '@/data/airports'
import { useFlightsStore } from '@/stores/flights'
import { useI18n } from '@/i18n'
import { addDays } from '@/lib/dates'
import { applyFilters, defaultFilters } from '@/lib/flightFilters'
import { flightsOn, medianEmissions, priceInsight, sortOptions, tripLength, tripTotal } from '@/lib/flights'
import { fromQuery, searchKey, toQuery, travellerCount } from '@/lib/flightSearch'
import type { FlightOption, FlightSearch, SortMode } from '@/types/flights'

const route = useRoute()
const router = useRouter()
const flights = useFlightsStore()
const { t, plural, date } = useI18n()

const hasQuery = computed(() => Object.keys(route.query).length > 0)
const parsed = computed(() => fromQuery(route.query, flights.today))
const search = computed(() => parsed.value.search)

watch(search, (value) => value && flights.remember(value), { immediate: true })

const city = (code: string) => findAirport(code)?.city ?? code

/* Steps: departing, then (for a round trip) returning, then booking ----- */

const outboundOptions = computed(() =>
  search.value
    ? flightsOn(search.value.from, search.value.to, search.value.depart, search.value.cabin, flights.today)
    : [],
)

const returnOptions = computed(() =>
  search.value?.trip === 'round' && search.value.return
    ? flightsOn(search.value.to, search.value.from, search.value.return, search.value.cabin, flights.today)
    : [],
)

const selectedOutbound = computed(() => {
  const id = route.query.out
  return typeof id === 'string' ? (outboundOptions.value.find((o) => o.id === id) ?? null) : null
})

const step = computed<'out' | 'return'>(() =>
  search.value?.trip === 'round' && selectedOutbound.value ? 'return' : 'out',
)

const options = computed(() => (step.value === 'out' ? outboundOptions.value : returnOptions.value))

const cheapestReturnFare = computed(() =>
  returnOptions.value.length ? Math.min(...returnOptions.value.map((o) => o.fare)) : null,
)

/** A round trip with nothing flying home can't be priced, so it can't be sold. */
const noReturn = computed(
  () => search.value?.trip === 'round' && step.value === 'out' && cheapestReturnFare.value === null,
)

/**
 * The total shown on each row. Departing round-trip rows are priced with the
 * cheapest return, as the cheapest way to book that outbound.
 */
function priceOf(option: FlightOption): number {
  const current = search.value!
  if (current.trip === 'oneway') return tripTotal([option.fare], current)
  if (step.value === 'out') return tripTotal([option.fare, cheapestReturnFare.value ?? 0], current)
  return tripTotal([selectedOutbound.value!.fare, option.fare], current)
}

const priceNote = computed(() =>
  search.value?.trip === 'oneway' ? t('flights.oneWay') : t('flights.roundTrip'),
)

/* Filters and sorting ---------------------------------------------------- */

const filters = ref(defaultFilters())
const sort = ref<SortMode>('best')
const showAll = ref(false)

watch(
  () => (search.value ? `${searchKey(search.value)}|${step.value}` : ''),
  () => {
    filters.value = defaultFilters()
    showAll.value = false
  },
)

const filtered = computed(() => applyFilters(options.value, filters.value, priceOf))
const sorted = computed(() => sortOptions(filtered.value, sort.value))
const median = computed(() => medianEmissions(options.value))

const TOP_COUNT = 3
const PAGE = 10
const top = computed(() => (sort.value === 'best' ? sorted.value.slice(0, TOP_COUNT) : []))
const others = computed(() => (sort.value === 'best' ? sorted.value.slice(TOP_COUNT) : sorted.value))
const visibleOthers = computed(() => (showAll.value ? others.value : others.value.slice(0, PAGE)))

const sortModes: SortMode[] = ['best', 'cheapest', 'fastest']

/* Navigation -------------------------------------------------------------- */

function go(next: FlightSearch, extra: Record<string, string> = {}) {
  router.push({ path: '/flights', query: { ...toQuery(next), ...extra } })
}

/** A new departure date keeps the trip the same length. */
function pickDepart(depart: string) {
  const current = search.value!
  const ret = current.trip === 'round' ? addDays(depart, tripLength(current)) : undefined
  go({ ...current, depart, return: ret })
  graphDialog.value?.close()
}

function pickDates({ depart, ret }: { depart: string; ret: string }) {
  go({ ...search.value!, depart, return: ret })
  gridDialog.value?.close()
}

function select(option: FlightOption) {
  const current = search.value!
  if (current.trip === 'oneway') {
    router.push({ path: '/flights/booking', query: { ...toQuery(current), out: option.id } })
  } else if (step.value === 'out') {
    go(current, { out: option.id })
  } else {
    router.push({
      path: '/flights/booking',
      query: { ...toQuery(current), out: selectedOutbound.value!.id, ret: option.id },
    })
  }
}

function changeOutbound() {
  go(search.value!)
}

/* Tools ------------------------------------------------------------------- */

const gridDialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const graphDialog = ref<InstanceType<typeof ModalDialog> | null>(null)

const insight = computed(() =>
  search.value && step.value === 'out' && !noReturn.value
    ? priceInsight(search.value, flights.today)
    : null,
)

const tracked = computed(() => (search.value ? flights.isTracked(search.value) : false))

const summary = computed(() => {
  const current = search.value!
  const dates =
    current.trip === 'round' && current.return
      ? `${date(current.depart)} – ${date(current.return)}`
      : date(current.depart)
  return [dates, plural('search.travellers', travellerCount(current)), t(`search.cabin_${current.cabin}`)].join(' · ')
})

const listHeading = (kind: 'top' | 'other') =>
  t(`flights.${kind}${step.value === 'out' ? 'Departing' : 'Returning'}`)
</script>

<template>
  <main class="page results">
    <FlightSearchForm
      compact
      :initial="hasQuery ? parsed.draft : flights.lastSearch"
      :problems="hasQuery ? parsed.problems : []"
      @search="go"
    />

    <template v-if="search">
      <header class="results-head">
        <div>
          <p class="kicker">{{ t(search.trip === 'round' ? 'search.trip_round' : 'search.trip_oneway') }}</p>
          <h1>{{ t('flights.title', { from: city(search.from), to: city(search.to) }) }}</h1>
          <p class="sub num">{{ summary }}</p>
        </div>
        <div class="track">
          <label class="acme-switch">
            <input
              type="checkbox"
              :checked="tracked"
              :disabled="noReturn"
              @change="flights.toggleTracked(search)"
            />
            {{ t('flights.trackPrices') }}
          </label>
          <p class="acme-help">
            <template v-if="tracked">
              {{ t('flights.trackingOn') }}
              <RouterLink to="/tracked">{{ t('flights.seeTracked') }}</RouterLink>
            </template>
            <template v-else>{{ t('flights.trackingOff') }}</template>
          </p>
        </div>
      </header>

      <nav v-if="search.trip === 'round'" class="steps" :aria-label="t('flights.stepsLabel')">
        <ol>
          <li :aria-current="step === 'out' ? 'step' : undefined">
            <span class="step-n">1</span>{{ t('flights.stepDepart') }}
          </li>
          <li :aria-current="step === 'return' ? 'step' : undefined">
            <span class="step-n">2</span>{{ t('flights.stepReturn') }}
          </li>
          <li><span class="step-n">3</span>{{ t('flights.stepBook') }}</li>
        </ol>
      </nav>

      <section v-if="step === 'return' && selectedOutbound" class="chosen">
        <div class="section-head">
          <h2>{{ t('flights.chosenDeparting', { date: date(search.depart) }) }}</h2>
          <button class="acme-btn acme-btn--ghost acme-btn--sm" type="button" @click="changeOutbound">
            {{ t('flights.changeFlight') }}
          </button>
        </div>
        <ul class="acme-card flight-list">
          <FlightRow
            :option="selectedOutbound"
            :total="tripTotal([selectedOutbound.fare], search)"
            :price-note="t('flights.oneWayFare')"
            :cabin="search.cabin"
            :median-emissions="medianEmissions(outboundOptions)"
          />
        </ul>
      </section>

      <section v-if="step === 'out'" class="date-tools" :aria-label="t('dates.toolsLabel')">
        <DateStrip :search="search" :observed="flights.today" @pick="pickDepart" />
        <div class="tool-buttons">
          <button
            v-if="search.trip === 'round'"
            class="acme-btn acme-btn--secondary acme-btn--sm"
            type="button"
            @click="gridDialog?.open()"
          >
            {{ t('dates.gridTitle') }}
          </button>
          <button class="acme-btn acme-btn--secondary acme-btn--sm" type="button" @click="graphDialog?.open()">
            {{ t('graph.title') }}
          </button>
        </div>
      </section>

      <div class="controls">
        <FilterBar v-model="filters" :options="options" :price-of="priceOf" />
        <fieldset class="segmented sort">
          <legend class="sr-only">{{ t('flights.sortLabel') }}</legend>
          <label v-for="mode in sortModes" :key="mode">
            <input v-model="sort" class="sr-only" type="radio" name="sort" :value="mode" />
            <span>{{ t(`flights.sort_${mode}`) }}</span>
          </label>
        </fieldset>
      </div>

      <p class="price-note">
        <span class="sr-only" aria-live="polite">{{ plural('flights.resultCount', filtered.length) }}. </span>
        {{ plural('flights.priceNote', travellerCount(search)) }}
      </p>

      <div v-if="noReturn" class="acme-card empty-state">
        <h2>{{ t('flights.noReturnTitle') }}</h2>
        <p class="muted">{{ t('flights.noReturnBody', { date: date(search.return!) }) }}</p>
      </div>

      <div v-else-if="options.length === 0" class="acme-card empty-state">
        <h2>{{ t('flights.noFlightsTitle') }}</h2>
        <p class="muted">{{ t('flights.noFlightsBody') }}</p>
      </div>

      <div v-else-if="filtered.length === 0" class="acme-card empty-state">
        <h2>{{ t('flights.noMatchTitle') }}</h2>
        <p class="muted">{{ plural('flights.noMatchBody', options.length) }}</p>
        <button class="acme-btn acme-btn--secondary" type="button" @click="filters = defaultFilters()">
          {{ t('flights.clearFilters') }}
        </button>
      </div>

      <template v-else>
        <section v-if="top.length" class="list-section">
          <h2>{{ listHeading('top') }}</h2>
          <p class="acme-help">{{ t('flights.bestNote') }}</p>
          <ul class="acme-card flight-list">
            <FlightRow
              v-for="option in top"
              :key="option.id"
              :option="option"
              :total="priceOf(option)"
              :price-note="priceNote"
              :cabin="search.cabin"
              :median-emissions="median"
              :action-label="t('flights.select')"
              @select="select"
            />
          </ul>
        </section>

        <PriceInsights v-if="insight" :insight="insight" />

        <section v-if="others.length" class="list-section">
          <h2>{{ sort === 'best' ? listHeading('other') : t(`flights.sortedBy_${sort}`) }}</h2>
          <ul class="acme-card flight-list">
            <FlightRow
              v-for="option in visibleOthers"
              :key="option.id"
              :option="option"
              :total="priceOf(option)"
              :price-note="priceNote"
              :cabin="search.cabin"
              :median-emissions="median"
              :action-label="t('flights.select')"
              @select="select"
            />
          </ul>
          <button
            v-if="!showAll && others.length > PAGE"
            class="acme-btn acme-btn--secondary show-more"
            type="button"
            @click="showAll = true"
          >
            {{ plural('flights.showMore', others.length - PAGE) }}
          </button>
        </section>
      </template>

      <ModalDialog ref="gridDialog" :title="t('dates.gridTitle')">
        <DateGrid :search="search" :observed="flights.today" @pick="pickDates" />
      </ModalDialog>
      <ModalDialog ref="graphDialog" :title="t('graph.title')">
        <PriceGraph :search="search" :observed="flights.today" @pick="pickDepart" />
      </ModalDialog>
    </template>

    <div v-else-if="!hasQuery" class="acme-card empty-state start">
      <h1>{{ t('flights.startTitle') }}</h1>
      <p class="muted">{{ t('flights.startBody') }}</p>
    </div>
  </main>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-5);
  padding-top: var(--acme-space-6);
}

.results-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--acme-space-6);
  flex-wrap: wrap;
  margin-top: var(--acme-space-3);
}

.results-head h1 {
  margin: var(--acme-space-1) 0 0;
  font-size: var(--acme-text-4xl);
}

.sub {
  margin: var(--acme-space-1) 0 0;
  color: var(--acme-color-text-muted);
}

.track {
  display: grid;
  gap: var(--acme-space-1);
  justify-items: end;
  text-align: end;
}

.track .acme-help {
  margin: 0;
}

.steps ol {
  display: flex;
  gap: var(--acme-space-6);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--acme-text-sm);
  color: var(--acme-color-text-muted);
}

.steps li {
  display: inline-flex;
  align-items: center;
  gap: var(--acme-space-2);
}

.step-n {
  display: inline-grid;
  place-items: center;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border: 1px solid var(--acme-color-border-strong);
  border-radius: var(--acme-radius-full);
  font-size: var(--acme-text-xs);
  font-weight: 600;
}

.steps [aria-current='step'] {
  color: var(--acme-color-selected);
  font-weight: 600;
}

.steps [aria-current='step'] .step-n {
  border-color: var(--acme-color-selected);
  background: var(--acme-color-selected-soft);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--acme-space-4);
  margin-bottom: var(--acme-space-3);
}

.section-head h2,
.list-section h2 {
  margin: 0;
  font-size: var(--acme-text-xl);
}

.date-tools {
  display: grid;
  gap: var(--acme-space-2);
}

.tool-buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--acme-space-2);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--acme-space-3);
  flex-wrap: wrap;
}

.price-note {
  margin: 0;
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
}

.list-section {
  display: grid;
  gap: var(--acme-space-2);
}

.list-section .acme-help {
  margin: 0;
}

.flight-list {
  margin: 0;
  padding: 0;
}

.show-more {
  justify-self: center;
  margin-top: var(--acme-space-2);
}

.start h1 {
  font-size: var(--acme-text-3xl);
}

@media (max-width: 640px) {
  .track {
    justify-items: start;
    text-align: start;
  }

  .steps ol {
    gap: var(--acme-space-3);
  }
}
</style>
