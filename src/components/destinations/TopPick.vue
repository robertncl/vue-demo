<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useTravelStore } from '@/stores/travel'
import { useI18n } from '@/i18n'
import DestinationMedia from './DestinationMedia.vue'

const store = useDestinationsStore()
const travel = useTravelStore()
const { t, money, month, region } = useI18n()

const pick = computed(() => store.topPick)
const monthName = computed(() => month(store.currentMonth))
const weekBudget = computed(() => (pick.value ? pick.value.dailyBudget * 7 : 0))

/** Hands the planner a pre-filled week at this destination. */
const planRoute = computed(() => ({
  path: '/trips',
  query: {
    destination: pick.value ? `${pick.value.name}, ${pick.value.country}` : '',
    budget: String(weekBudget.value),
  },
}))
</script>

<template>
  <div v-if="pick" class="top-pick">
    <article class="acme-card hero">
      <DestinationMedia :label="t('media.photoOf', { name: pick.name })" ratio="21 / 9" />

      <div class="acme-card__body detail">
        <div class="detail-head">
          <div>
            <p class="kicker">{{ t('topPick.eyebrow', { month: monthName }) }}</p>
            <h2>{{ pick.name }}</h2>
            <p class="where">{{ pick.country }} · {{ region(pick.region) }}</p>
          </div>
          <span v-if="store.inSeason(pick)" class="acme-badge season-flag">
            {{ t('common.inSeasonNow') }}
          </span>
        </div>

        <p class="why">{{ store.noteForMonth(pick) }}</p>

        <dl class="figures">
          <div>
            <dt>{{ t('topPick.aDay') }}</dt>
            <dd class="num">{{ money(pick.dailyBudget) }}</dd>
          </div>
          <div>
            <dt>{{ t('topPick.aWeek') }}</dt>
            <dd class="num">{{ money(weekBudget) }}</dd>
          </div>
        </dl>
      </div>

      <div class="acme-card__footer actions">
        <RouterLink class="acme-btn acme-btn--primary" :to="`/destinations/${pick.slug}`">
          {{ t('topPick.readGuideNamed', { name: pick.name }) }}
        </RouterLink>
        <RouterLink class="acme-btn acme-btn--secondary" :to="planRoute">
          {{ t('topPick.startTrip') }}
        </RouterLink>
      </div>
    </article>

    <div class="side">
      <div v-if="store.topPickRunnersUp.length" class="acme-card">
        <div class="acme-card__body side-body">
          <h3>{{ t('topPick.runnersUp', { month: monthName }) }}</h3>
          <ul class="runners">
            <li v-for="item in store.topPickRunnersUp" :key="item.slug" class="runner">
              <RouterLink :to="`/destinations/${item.slug}`">
                <span class="runner-text">
                  <strong>{{ item.name }}</strong>
                  <span class="muted">{{ store.noteForMonth(item) }}</span>
                </span>
                <span class="runner-price num">{{ money(item.dailyBudget) }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="travel.nextTrip" class="acme-card next-trip">
        <div class="acme-card__body side-body">
          <p class="kicker">{{ t('home.nextDeparture') }}</p>
          <h3>{{ travel.nextTrip.destination }}</h3>
          <p class="next-meta num">
            {{ travel.nextTrip.startDate }} → {{ travel.nextTrip.endDate }} ·
            {{ t('common.dayCount', { count: travel.durationOf(travel.nextTrip) }) }} ·
            {{ money(travel.nextTrip.budget) }}
          </p>
          <RouterLink class="acme-btn acme-btn--secondary acme-btn--sm open-planner" to="/trips">
            {{ t('home.openPlanner') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-pick {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
  gap: var(--acme-space-6);
  align-items: start;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-3);
}

.detail-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--acme-space-4);
  flex-wrap: wrap;
}

.detail-head h2 {
  margin: var(--acme-space-1) 0 0;
  font-size: var(--acme-text-3xl);
}

.where {
  margin: 0;
  color: var(--acme-color-text-muted);
  font-size: var(--acme-text-sm);
}

.season-flag {
  background: var(--acme-color-selected-soft);
  color: var(--acme-color-accent);
}

.why {
  margin: 0;
  max-width: 60ch;
  text-wrap: pretty;
}

.figures {
  display: flex;
  gap: var(--acme-space-8);
  flex-wrap: wrap;
  padding-top: var(--acme-space-2);
}

.figures dt {
  font-size: var(--acme-text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--acme-color-text-muted);
  font-weight: 600;
}

.figures dd {
  margin: 0;
  font-size: var(--acme-text-2xl);
  font-weight: 600;
}

.actions {
  gap: var(--acme-space-3);
  flex-wrap: wrap;
}

.side {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-4);
}

.side-body {
  padding: var(--acme-space-5);
}

.side-body h3 {
  margin: 0 0 var(--acme-space-3);
  font-size: var(--acme-text-lg);
}

.runners {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.runner {
  border-top: 1px solid var(--acme-color-border);
}

.runner a {
  display: flex;
  justify-content: space-between;
  gap: var(--acme-space-3);
  padding: var(--acme-space-3) 0;
  text-decoration: none;
  color: var(--acme-color-text);
}

.runner-text strong {
  display: block;
  font-weight: 600;
}

.runner-text .muted {
  font-size: var(--acme-text-sm);
}

.runner-price {
  font-weight: 600;
  white-space: nowrap;
}

.next-trip .kicker + h3 {
  margin: var(--acme-space-2) 0 0;
  font-size: var(--acme-text-xl);
}

.next-meta {
  margin: var(--acme-space-2) 0 0;
  font-size: var(--acme-text-sm);
  color: var(--acme-color-text-muted);
}

.open-planner {
  align-self: flex-start;
  margin-top: var(--acme-space-3);
}

.next-trip .side-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

@media (max-width: 900px) {
  .top-pick {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
