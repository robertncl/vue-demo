<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useTravelStore } from '@/stores/travel'
import { useI18n } from '@/i18n'
import type { Destination } from '@/types/travel'

const route = useRoute()
const router = useRouter()
const store = useDestinationsStore()
const travel = useTravelStore()
const { t, money, month, region, tag } = useI18n()

const destination = computed(() => store.bySlug(String(route.params.slug)))

const banner = computed(() => {
  const d = destination.value
  return d ? `linear-gradient(135deg, ${d.gradient[0]}, ${d.gradient[1]})` : ''
})

/** A sensible one-week budget to pre-fill the planner with. */
const weekBudget = computed(() => (destination.value ? destination.value.dailyBudget * 7 : 0))

const breakdown = computed(() => {
  const d = destination.value
  if (!d) return []
  const parts = [
    { key: 'detail.stay', value: d.budgetBreakdown.stay },
    { key: 'detail.food', value: d.budgetBreakdown.food },
    { key: 'detail.transport', value: d.budgetBreakdown.transport },
    { key: 'detail.activitiesCost', value: d.budgetBreakdown.activities },
  ]
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1
  return parts.map((part) => ({ ...part, percent: Math.round((part.value / total) * 100) }))
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

function planTrip() {
  const d = destination.value
  if (!d) return
  router.push({
    path: '/trips',
    query: { destination: `${d.name}, ${d.country}`, budget: String(weekBudget.value) },
  })
}
</script>

<template>
  <main class="page">
    <div class="container">
      <template v-if="destination">
        <RouterLink class="back" to="/destinations">← {{ t('detail.back') }}</RouterLink>

        <section class="hero card" :style="{ background: banner }">
          <span class="emoji" aria-hidden="true">{{ destination.emoji }}</span>
          <div class="hero-text">
            <p class="region">{{ region(destination.region) }}</p>
            <h1>{{ destination.name }}</h1>
            <p class="country">{{ destination.country }} · {{ destination.tagline }}</p>
          </div>
          <span v-if="store.inSeason(destination)" class="season-flag">
            {{ t('topPick.inSeason') }}
          </span>
        </section>

        <div class="layout">
          <article class="main">
            <section>
              <h2>{{ t('detail.overview') }}</h2>
              <p class="summary">{{ destination.summary }}</p>
            </section>

            <section>
              <h2>{{ t('detail.guide') }}</h2>
              <p v-for="(para, i) in destination.overview" :key="i" class="prose">{{ para }}</p>
            </section>

            <section>
              <h2>{{ t('detail.dontMiss') }}</h2>
              <ul class="highlights">
                <li v-for="highlight in destination.highlights" :key="highlight" class="card">
                  {{ highlight }}
                </li>
              </ul>
            </section>

            <section>
              <h2>{{ t('detail.neighbourhoods') }}</h2>
              <ul class="areas">
                <li v-for="area in destination.neighbourhoods" :key="area.name" class="card area">
                  <h3>{{ area.name }}</h3>
                  <p class="best-for">
                    <span class="chip chip-brand">{{ t('detail.bestFor') }}</span>
                    {{ area.bestFor }}
                  </p>
                  <p class="muted">{{ area.description }}</p>
                </li>
              </ul>
            </section>

            <section>
              <h2>{{ t('detail.itinerary') }}</h2>
              <ol class="itinerary">
                <li v-for="plan in destination.sampleItinerary" :key="plan.day" class="card plan">
                  <header>
                    <span class="day-badge">{{ t('planner.dayLabel', { n: plan.day }) }}</span>
                    <h3>{{ plan.title }}</h3>
                  </header>
                  <dl>
                    <div>
                      <dt>{{ t('detail.morning') }}</dt>
                      <dd>{{ plan.morning }}</dd>
                    </div>
                    <div>
                      <dt>{{ t('detail.afternoon') }}</dt>
                      <dd>{{ plan.afternoon }}</dd>
                    </div>
                    <div>
                      <dt>{{ t('detail.evening') }}</dt>
                      <dd>{{ plan.evening }}</dd>
                    </div>
                  </dl>
                </li>
              </ol>
            </section>

            <section class="two-up">
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

            <section>
              <h2>{{ t('detail.seasons') }}</h2>
              <ul class="seasons">
                <li v-for="season in destination.seasons" :key="season.label" class="card season">
                  <div class="season-months">
                    <span v-for="m in season.months" :key="m" class="chip">{{
                      month(m, true)
                    }}</span>
                  </div>
                  <h3>{{ season.label }}</h3>
                  <p class="muted">{{ season.note }}</p>
                </li>
              </ul>
            </section>

            <section>
              <h2>{{ t('detail.practical') }}</h2>
              <dl class="practical card">
                <div>
                  <dt>{{ t('detail.language') }}</dt>
                  <dd>{{ destination.practical.language }}</dd>
                </div>
                <div>
                  <dt>{{ t('detail.localCurrency') }}</dt>
                  <dd>{{ destination.practical.currency }}</dd>
                </div>
                <div>
                  <dt>{{ t('detail.timeZone') }}</dt>
                  <dd>{{ destination.practical.timeZone }}</dd>
                </div>
                <div>
                  <dt>{{ t('detail.plug') }}</dt>
                  <dd>{{ destination.practical.plug }}</dd>
                </div>
                <div>
                  <dt>{{ t('detail.visa') }}</dt>
                  <dd>{{ destination.practical.visa }}</dd>
                </div>
                <div>
                  <dt>{{ t('detail.gettingAround') }}</dt>
                  <dd>{{ destination.practical.gettingAround }}</dd>
                </div>
                <div class="wide">
                  <dt>{{ t('detail.safety') }}</dt>
                  <dd>{{ destination.practical.safety }}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h2>{{ t('detail.tags') }}</h2>
              <ul class="tags">
                <li v-for="item in destination.tags" :key="item" class="chip chip-brand">
                  {{ tag(item) }}
                </li>
              </ul>
            </section>
          </article>

          <aside class="side">
            <div class="card panel">
              <dl class="figures">
                <div>
                  <dt>{{ t('detail.dailyBudget') }}</dt>
                  <dd>{{ money(destination.dailyBudget) }}</dd>
                </div>
                <div>
                  <dt>{{ t('detail.oneWeek') }}</dt>
                  <dd>{{ money(weekBudget) }}</dd>
                </div>
                <div>
                  <dt>{{ t('detail.bestMonths') }}</dt>
                  <dd>{{ destination.bestMonths.map((m) => month(m, true)).join(', ') }}</dd>
                </div>
              </dl>

              <div class="breakdown">
                <p class="breakdown-title">{{ t('detail.breakdown') }}</p>
                <div class="bar" role="presentation">
                  <span
                    v-for="part in breakdown"
                    :key="part.key"
                    :class="`seg seg-${part.key.split('.')[1]}`"
                    :style="{ width: `${part.percent}%` }"
                  ></span>
                </div>
                <ul class="legend">
                  <li v-for="part in breakdown" :key="part.key">
                    <span :class="`dot dot-${part.key.split('.')[1]}`"></span>
                    <span class="legend-label">{{ t(part.key) }}</span>
                    <span class="legend-value">{{ money(part.value) }}</span>
                  </li>
                </ul>
                <p class="muted note">{{ t('detail.breakdownNote') }}</p>
              </div>

              <button class="btn" type="button" @click="planTrip">
                {{ t('detail.planTrip') }}
              </button>
              <button
                class="btn btn-ghost"
                type="button"
                @click="store.toggleWishlist(destination.slug)"
              >
                {{
                  store.isWishlisted(destination.slug)
                    ? `★ ${t('detail.saved')}`
                    : `☆ ${t('detail.save')}`
                }}
              </button>
              <p v-if="alreadyPlanned" class="planned muted">{{ t('detail.alreadyPlanned') }}</p>
            </div>
          </aside>
        </div>

        <section v-if="related.length" class="related">
          <h2>{{ t('detail.moreIn', { region: region(destination.region) }) }}</h2>
          <ul>
            <li v-for="item in related" :key="item.slug" class="card related-item">
              <RouterLink :to="`/destinations/${item.slug}`">
                <span aria-hidden="true">{{ item.emoji }}</span>
                <strong>{{ item.name }}</strong>
                <span class="muted">{{ money(item.dailyBudget) }}{{ t('common.perDay') }}</span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </template>

      <div v-else class="missing card">
        <h1>{{ t('detail.notFoundTitle') }}</h1>
        <p class="muted">{{ t('detail.notFoundBody', { slug: String(route.params.slug) }) }}</p>
        <RouterLink class="btn" to="/destinations">{{ t('detail.notFoundCta') }}</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2.25rem 1.75rem;
  border: none;
  color: var(--c-on-gradient);
}

.emoji {
  font-size: 3.5rem;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
}

.hero h1 {
  color: var(--c-on-gradient);
}

.region {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
  opacity: 0.75;
}

.country {
  font-weight: 550;
  opacity: 0.85;
}

.season-flag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: var(--c-season-bg);
  color: var(--c-season-text);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2.5rem;
  margin-top: 2rem;
  align-items: start;
}

.main section {
  margin-bottom: 2.25rem;
}

.main h2 {
  margin-bottom: 0.85rem;
}

.summary,
.prose {
  max-width: 68ch;
}

.prose + .prose {
  margin-top: 0.9rem;
}

.highlights,
.tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.highlights li {
  padding: 0.65rem 0.9rem;
  font-size: 0.925rem;
}

.areas,
.seasons {
  list-style: none;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.area,
.season {
  padding: 1rem 1.1rem;
}

.area h3,
.season h3 {
  margin-bottom: 0.35rem;
}

.best-for {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
}

.season-months {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.itinerary {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.plan {
  padding: 1.1rem 1.25rem;
}

.plan header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
  flex-wrap: wrap;
}

.day-badge {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.plan dl {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  font-weight: 700;
}

.plan dd {
  font-size: 0.925rem;
}

.two-up {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.bullets {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.bullets li {
  position: relative;
  padding-left: 1.25rem;
  font-size: 0.925rem;
}

.bullets li::before {
  content: '·';
  position: absolute;
  left: 0.35rem;
  color: var(--c-brand);
  font-weight: 900;
}

.practical {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem 1.5rem;
  padding: 1.25rem;
}

.practical .wide {
  grid-column: 1 / -1;
}

.practical dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.practical dd {
  font-size: 0.9rem;
}

.panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  position: sticky;
  top: 84px;
}

.figures {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.figures > div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: baseline;
}

.figures dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  font-weight: 650;
}

.figures dd {
  font-weight: 650;
  color: var(--c-heading);
  text-align: right;
}

.breakdown {
  border-top: 1px solid var(--c-border);
  padding-top: 0.9rem;
}

.breakdown-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  font-weight: 650;
  margin-bottom: 0.5rem;
}

.bar {
  display: flex;
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--c-surface-soft);
}

/* A 2px surface gap keeps adjacent segments legible without a border colour.
   Taken from the inside so the percentage widths stay accurate. */
.bar .seg {
  box-sizing: border-box;
  border-right: 2px solid var(--c-surface);
}

.bar .seg:last-child {
  border-right: none;
}

.seg-stay {
  background: var(--c-series-stay);
}
.seg-food {
  background: var(--c-series-food);
}
.seg-transport {
  background: var(--c-series-transport);
}
.seg-activitiesCost {
  background: var(--c-series-activities);
}

.legend {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.7rem;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
}

.dot-stay {
  background: var(--c-series-stay);
}
.dot-food {
  background: var(--c-series-food);
}
.dot-transport {
  background: var(--c-series-transport);
}
.dot-activitiesCost {
  background: var(--c-series-activities);
}

.legend-label {
  flex: 1;
  color: var(--c-muted);
}

.legend-value {
  font-weight: 650;
  color: var(--c-heading);
}

.note {
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.planned {
  font-size: 0.82rem;
  text-align: center;
}

.related {
  margin-top: 1rem;
}

.related ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.related-item a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--c-text);
}

.missing {
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 920px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .panel {
    position: static;
  }
}
</style>
