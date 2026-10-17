<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FlightRow from '@/components/flights/FlightRow.vue'
import { findAirport } from '@/data/airports'
import { findDestination } from '@/data/destinations'
import { useFlightsStore } from '@/stores/flights'
import { useTravelStore } from '@/stores/travel'
import { useI18n } from '@/i18n'
import { daysBetween, wallClock } from '@/lib/dates'
import { fareBreakdown, findFlight } from '@/lib/flights'
import { fromQuery, toQuery, travellerCount } from '@/lib/flightSearch'
import type { FlightOption } from '@/types/flights'

const route = useRoute()
const router = useRouter()
const flights = useFlightsStore()
const travel = useTravelStore()
const { t, plural, money, date } = useI18n()

const search = computed(() => fromQuery(route.query, flights.today).search)

function pick(from: string, to: string, day: string | undefined, id: unknown): FlightOption | null {
  if (!search.value || !day || typeof id !== 'string') return null
  return findFlight(from, to, day, search.value.cabin, flights.today, id) ?? null
}

const outbound = computed(() =>
  search.value ? pick(search.value.from, search.value.to, search.value.depart, route.query.out) : null,
)
const inbound = computed(() =>
  search.value?.trip === 'round'
    ? pick(search.value.to, search.value.from, search.value.return, route.query.ret)
    : null,
)

/** Everything the link promised could be found again. */
const ready = computed(
  () => Boolean(search.value && outbound.value && (search.value.trip === 'oneway' || inbound.value)),
)

const fares = computed(() =>
  [outbound.value, inbound.value].filter((o): o is FlightOption => o !== null).map((o) => o.fare),
)
const breakdown = computed(() => fareBreakdown(fares.value, search.value!))

const origin = computed(() => findAirport(search.value!.from)!)
const destinationAirport = computed(() => findAirport(search.value!.to)!)
const guide = computed(() =>
  destinationAirport.value.destination ? findDestination(destinationAirport.value.destination) : undefined,
)

const lines = computed(() => {
  const { adults, children, infants } = search.value!
  return [
    { key: 'adults', count: adults, amount: breakdown.value.adults },
    { key: 'children', count: children, amount: breakdown.value.children },
    { key: 'infants', count: infants, amount: breakdown.value.infants },
  ].filter((line) => line.count > 0)
})

const backToResults = computed(() => ({
  path: '/flights',
  query: search.value?.trip === 'round' ? { ...toQuery(search.value), out: String(route.query.out) } : toQuery(search.value!),
}))

const tracked = computed(() => (search.value ? flights.isTracked(search.value) : false))

/**
 * Turns the booking into a trip: dated, budgeted for the flights plus the
 * guide's daily budget for each traveller who pays, with the flights on the
 * itinerary as its first and last entries.
 */
function addToTrips() {
  const current = search.value!
  const out = outbound.value!
  const back = inbound.value
  const endDate = current.trip === 'round' && current.return ? current.return : current.depart
  const days = daysBetween(current.depart, endDate) + 1
  const payers = current.adults + current.children
  const stay = guide.value ? guide.value.dailyBudget * Math.max(1, days - 1) * payers : 0
  const total = breakdown.value.total
  const outCost = back ? Math.round((total * out.fare) / (out.fare + back.fare)) : total

  const place = guide.value
    ? `${guide.value.name}, ${guide.value.country}`
    : `${destinationAirport.value.city}, ${destinationAirport.value.country}`
  travel.addTrip({
    destination: place,
    startDate: current.depart,
    endDate,
    budget: total + stay,
  })

  const flightTitle = (option: FlightOption, from: string, to: string) =>
    t('booking.flightActivity', {
      numbers: option.segments.map((segment) => segment.flightNumber).join(' + '),
      from,
      to,
    })
  travel.addActivity({
    day: 1,
    time: wallClock(out.departs),
    title: flightTitle(out, current.from, current.to),
    cost: outCost,
  })
  if (back) {
    travel.addActivity({
      day: days,
      time: wallClock(back.departs),
      title: flightTitle(back, current.to, current.from),
      cost: total - outCost,
    })
  }
  router.push('/trips')
}
</script>

<template>
  <main class="page booking">
    <template v-if="ready && search">
      <nav class="acme-breadcrumbs" :aria-label="t('detail.breadcrumbs')">
        <RouterLink to="/">{{ t('nav.flights') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <RouterLink :to="backToResults">{{ t('booking.results') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ t('booking.title') }}</span>
      </nav>

      <header class="head">
        <p class="kicker">{{ t('booking.title') }}</p>
        <h1>{{ t('flights.title', { from: origin.city, to: destinationAirport.city }) }}</h1>
        <p class="sub">
          {{ plural('search.travellers', travellerCount(search)) }} ·
          {{ t(`search.cabin_${search.cabin}`) }} ·
          {{ t(search.trip === 'round' ? 'flights.roundTrip' : 'flights.oneWay') }}
        </p>
      </header>

      <div class="layout">
        <div class="legs">
          <section>
            <h2>{{ t('booking.departing', { date: date(search.depart, 'long') }) }}</h2>
            <ul class="acme-card flight-list">
              <FlightRow
                :option="outbound!"
                :total="fareBreakdown([outbound!.fare], search).total"
                :price-note="t('flights.oneWayFare')"
                :cabin="search.cabin"
                open
              />
            </ul>
          </section>
          <section v-if="inbound">
            <h2>{{ t('booking.returning', { date: date(search.return!, 'long') }) }}</h2>
            <ul class="acme-card flight-list">
              <FlightRow
                :option="inbound"
                :total="fareBreakdown([inbound.fare], search).total"
                :price-note="t('flights.oneWayFare')"
                :cabin="search.cabin"
                open
              />
            </ul>
          </section>
        </div>

        <aside class="acme-card summary">
          <div class="acme-card__body">
            <h2>{{ t('booking.priceTitle') }}</h2>
            <table class="acme-table fares">
              <tbody>
                <tr v-for="line in lines" :key="line.key">
                  <th scope="row">{{ plural(`booking.${line.key}`, line.count) }}</th>
                  <td class="acme-table__num">{{ money(line.amount) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">{{ t('booking.total') }}</th>
                  <td class="acme-table__num total">{{ money(breakdown.total) }}</td>
                </tr>
              </tfoot>
            </table>
            <p class="acme-help">{{ t('booking.fareNote') }}</p>

            <div class="actions">
              <button class="acme-btn acme-btn--primary" type="button" @click="addToTrips">
                {{ t('booking.addToTrips') }}
              </button>
              <label class="acme-switch">
                <input type="checkbox" :checked="tracked" @change="flights.toggleTracked(search)" />
                {{ t('flights.trackPrices') }}
              </label>
            </div>

            <p class="acme-alert demo">{{ t('booking.demoNote') }}</p>
            <RouterLink v-if="guide" class="guide" :to="`/destinations/${guide.slug}`">
              {{ t('topPick.readGuideNamed', { name: guide.name }) }}
            </RouterLink>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="acme-card empty-state">
      <h1>{{ t('booking.missingTitle') }}</h1>
      <p class="muted">{{ t('booking.missingBody') }}</p>
      <RouterLink class="acme-btn acme-btn--primary" :to="search ? { path: '/flights', query: toQuery(search) } : '/'">
        {{ t('booking.searchAgain') }}
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.booking {
  padding-top: var(--acme-space-6);
}

.acme-breadcrumbs {
  margin-bottom: var(--acme-space-5);
}

.head {
  margin-bottom: var(--acme-space-6);
}

.head h1 {
  margin: var(--acme-space-1) 0 0;
}

.sub {
  margin: var(--acme-space-1) 0 0;
  color: var(--acme-color-text-muted);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--acme-space-8);
  align-items: start;
}

.legs {
  display: grid;
  gap: var(--acme-space-6);
}

.legs h2,
.summary h2 {
  margin: 0 0 var(--acme-space-3);
  font-size: var(--acme-text-xl);
}

.flight-list {
  margin: 0;
  padding: 0;
}

.summary {
  position: sticky;
  top: 5rem;
}

.fares th {
  padding: var(--acme-space-3) 0;
  border-block-end: 1px solid var(--acme-color-border);
  text-transform: none;
  letter-spacing: 0;
  font-size: var(--acme-text-sm);
  font-weight: 400;
  color: var(--acme-color-text);
}

.fares td {
  padding-inline: 0;
}

.fares tfoot th {
  font-weight: 700;
}

.fares tfoot th,
.fares tfoot td {
  border-block-end: none;
  font-size: var(--acme-text-sm);
  color: var(--acme-color-text);
}

.total {
  font-size: var(--acme-text-xl) !important;
  font-weight: 700;
}

.actions {
  display: grid;
  gap: var(--acme-space-3);
  margin: var(--acme-space-4) 0;
}

.demo {
  margin: 0 0 var(--acme-space-3);
}

.guide {
  font-size: var(--acme-text-sm);
  font-weight: 600;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary {
    position: static;
  }
}
</style>
