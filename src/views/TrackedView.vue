<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import PriceHistoryChart from '@/components/flights/PriceHistoryChart.vue'
import { findAirport } from '@/data/airports'
import { useFlightsStore } from '@/stores/flights'
import { useI18n } from '@/i18n'
import { cheapestTotal, priceHistory } from '@/lib/flights'
import { toQuery, travellerCount } from '@/lib/flightSearch'

const flights = useFlightsStore()
const { t, plural, money, date } = useI18n()

const city = (code: string) => findAirport(code)?.city ?? code

const cards = computed(() =>
  flights.trackedByDeparture.map((entry) => {
    const { search } = entry
    const departed = search.depart < flights.today
    const current = departed ? null : cheapestTotal(search, flights.today)
    const history = departed ? [] : priceHistory(search, flights.today)
    const totals = history.map((point) => point.total).filter((total): total is number => total !== null)
    return {
      entry,
      departed,
      current,
      change: current === null ? 0 : current - entry.priceAtTrack,
      lowest: totals.length ? Math.min(...totals) : null,
      history,
      route: { path: '/flights', query: toQuery(search) },
      title: t('flights.title', { from: city(search.from), to: city(search.to) }),
      dates:
        search.trip === 'round' && search.return
          ? `${date(search.depart)} – ${date(search.return)}`
          : date(search.depart),
      party: `${plural('search.travellers', travellerCount(search))} · ${t(`search.cabin_${search.cabin}`)}`,
    }
  }),
)
</script>

<template>
  <main class="page tracked">
    <header class="head">
      <p class="kicker">{{ t('tracked.eyebrow') }}</p>
      <h1>{{ t('tracked.title') }}</h1>
      <p class="sub">{{ t('tracked.subtitle') }}</p>
    </header>

    <ul v-if="cards.length" class="list">
      <li v-for="card in cards" :key="card.entry.id" class="mod-card tracked-card">
        <div class="mod-card__body body">
          <div class="summary">
            <div>
              <h2>{{ card.title }}</h2>
              <p class="muted num">{{ card.dates }}</p>
              <p class="muted">{{ card.party }}</p>
            </div>

            <dl v-if="!card.departed && card.current !== null" class="figures">
              <div>
                <dt>{{ t('tracked.now') }}</dt>
                <dd class="hero">{{ money(card.current) }}</dd>
              </div>
              <div>
                <dt>{{ t('tracked.since', { date: date(card.entry.trackedOn, 'day') }) }}</dt>
                <dd>
                  <template v-if="card.change < 0">{{ t('tracked.down', { amount: money(-card.change) }) }}</template>
                  <template v-else-if="card.change > 0">{{ t('tracked.up', { amount: money(card.change) }) }}</template>
                  <template v-else>{{ t('tracked.same') }}</template>
                </dd>
              </div>
              <div v-if="card.lowest !== null">
                <dt>{{ t('tracked.lowest') }}</dt>
                <dd class="num">{{ money(card.lowest) }}</dd>
              </div>
            </dl>
            <p v-else class="mod-badge">{{ card.departed ? t('tracked.departed') : t('tracked.soldOut') }}</p>
          </div>

          <PriceHistoryChart
            v-if="card.history.length"
            :points="card.history"
            :label="t('tracked.historyLabel', { route: card.title })"
          />
        </div>

        <div class="mod-card__footer">
          <RouterLink v-if="!card.departed" class="mod-btn mod-btn--secondary mod-btn--sm" :to="card.route">
            {{ t('deals.viewFlights') }}
          </RouterLink>
          <button
            class="mod-btn mod-btn--ghost mod-btn--sm"
            type="button"
            :aria-label="t('tracked.stopNamed', { route: card.title })"
            @click="flights.untrack(card.entry.id)"
          >
            {{ t('tracked.stop') }}
          </button>
        </div>
      </li>
    </ul>

    <div v-else class="mod-card empty-state">
      <h2>{{ t('tracked.emptyTitle') }}</h2>
      <p class="muted">{{ t('tracked.emptyBody') }}</p>
      <RouterLink class="mod-btn mod-btn--primary" to="/">{{ t('tracked.emptyCta') }}</RouterLink>
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

.list {
  display: grid;
  gap: var(--mod-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.body {
  display: grid;
  gap: var(--mod-space-3);
}

.summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--mod-space-4);
  flex-wrap: wrap;
}

.summary h2 {
  margin: 0 0 var(--mod-space-1);
  font-size: var(--mod-size-heading-3);
}

.summary p {
  margin: 0;
  font-size: var(--mod-size-small);
}

.figures {
  display: flex;
  gap: var(--mod-space-5);
  margin: 0;
}

.figures dt {
  font-size: var(--mod-size-label);
  font-weight: 600;
  color: var(--mod-ink-2);
}

.figures dd {
  margin: var(--mod-space-1) 0 0;
  font-size: var(--mod-size-heading-3);
  font-weight: 600;
}

/* The one hero figure per card: same sans, proportional figures. */
.figures dd.hero {
  font-size: var(--mod-size-heading-2);
  font-weight: 600;
  line-height: 1;
}
</style>
