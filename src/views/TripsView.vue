<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import { useI18n } from '@/i18n'
import TripForm from '@/components/travel/TripForm.vue'
import TripList from '@/components/travel/TripList.vue'
import ItineraryPlanner from '@/components/travel/ItineraryPlanner.vue'
import StatusIcon from '@/components/common/StatusIcon.vue'
import type { TripDraft } from '@/types/travel'

const route = useRoute()
const travel = useTravelStore()
const { t, plural, money } = useI18n()

/** Destination pages link here with the trip details pre-filled. Budget is in USD. */
const prefill = computed<Partial<TripDraft> | null>(() => {
  const destination = route.query.destination
  if (typeof destination !== 'string') return null
  const budget = Number(route.query.budget)
  return { destination, budget: Number.isFinite(budget) && budget > 0 ? budget : undefined }
})

/**
 * Warns about every unfinished trip whose activities cost more than its
 * budget. One trip gets the figures and a way to open it; several get a list.
 */
const overBudget = computed(() => {
  const trips = travel.overBudgetTrips
  const only = trips.length === 1 ? trips[0]! : null
  if (!trips.length) return null
  if (!only) {
    return {
      trip: null,
      title: plural('trips.overManyTitle', trips.length),
      body: t('trips.overManyBody', { names: trips.map((trip) => trip.destination).join(', ') }),
    }
  }
  const spent = travel.spentOn(only)
  return {
    trip: only,
    title: t('trips.overOneTitle', { name: only.destination }),
    body: t('trips.overOneBody', {
      spent: money(spent),
      over: money(spent - only.budget),
      budget: money(only.budget),
    }),
  }
})
</script>

<template>
  <main class="page trips">
    <header class="head">
      <p class="kicker">{{ t('trips.eyebrow') }}</p>
      <h1>{{ t('trips.title') }}</h1>
      <p class="sub">{{ t('trips.subtitle') }}</p>
    </header>

    <div v-if="overBudget" class="mod-alert mod-alert--warning over-alert" role="status">
      <span class="mod-alert__icon"><StatusIcon variant="warning" /></span>
      <div class="over-text">
        <p class="mod-alert__title">{{ overBudget.title }}</p>
        <p>{{ overBudget.body }}</p>
      </div>
      <button
        v-if="overBudget.trip && overBudget.trip.id !== travel.selectedTripId"
        class="mod-btn mod-btn--secondary mod-btn--sm over-open"
        type="button"
        @click="travel.selectTrip(overBudget.trip.id)"
      >
        {{ t('trips.openTrip', { name: overBudget.trip.destination }) }}
      </button>
    </div>

    <div class="layout">
      <aside>
        <TripForm :prefill="prefill" @create="travel.addTrip" />
        <TripList
          :trips="travel.trips"
          :selected-trip-id="travel.selectedTripId"
          @select="travel.selectTrip"
          @remove="travel.removeTrip"
        />
      </aside>

      <ItineraryPlanner
        v-if="travel.selectedTrip"
        :trip="travel.selectedTrip"
        :spent-amount="travel.spentAmount"
        :remaining-budget="travel.remainingBudget"
        :duration-days="travel.tripDurationDays"
        :budget-used-percent="travel.budgetUsedPercent"
        @add-activity="travel.addActivity"
        @remove-activity="travel.removeActivity"
      />

      <div v-else class="mod-card empty-state">
        <h2>{{ t('trips.nothingSelected') }}</h2>
        <p class="muted">{{ t('trips.selectPrompt') }}</p>
        <RouterLink class="mod-btn mod-btn--secondary" to="/destinations">
          {{ t('trips.findDestination') }}
        </RouterLink>
      </div>
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

.over-alert {
  align-items: flex-start;
  margin-bottom: var(--mod-space-4);
}

.over-text {
  flex: 1;
  min-width: 0;
}

.over-open {
  flex: none;
  align-self: center;
}

.layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: var(--mod-space-5);
  align-items: start;
}

aside {
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-4);
}

.empty-state h2 {
  margin: 0 0 var(--mod-space-2);
  font-size: var(--mod-size-heading-3);
}

.empty-state p {
  margin: 0 0 var(--mod-space-4);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
