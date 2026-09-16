<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import { useI18n } from '@/i18n'
import TripForm from '@/components/travel/TripForm.vue'
import TripList from '@/components/travel/TripList.vue'
import ItineraryPlanner from '@/components/travel/ItineraryPlanner.vue'
import type { TripDraft } from '@/types/travel'

const route = useRoute()
const travel = useTravelStore()
const { t } = useI18n()

/** Destination pages link here with the trip details pre-filled. Budget is in USD. */
const prefill = computed<Partial<TripDraft> | null>(() => {
  const destination = route.query.destination
  if (typeof destination !== 'string') return null
  const budget = Number(route.query.budget)
  return { destination, budget: Number.isFinite(budget) && budget > 0 ? budget : undefined }
})
</script>

<template>
  <main class="page">
    <div class="container">
      <header class="page-head">
        <p class="eyebrow">{{ t('trips.eyebrow') }}</p>
        <h1>{{ t('trips.title') }}</h1>
        <p>{{ t('trips.subtitle') }}</p>
      </header>

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

        <div v-else class="placeholder card">
          <span class="mark" aria-hidden="true">🧳</span>
          <h2>{{ t('trips.nothingSelected') }}</h2>
          <p class="muted">{{ t('trips.selectPrompt') }}</p>
          <RouterLink class="btn btn-ghost" to="/destinations">
            {{ t('trips.findDestination') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(260px, 340px) 1fr;
  gap: 2rem;
  align-items: start;
}

aside {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.placeholder {
  padding: 3.5rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.mark {
  font-size: 2.5rem;
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
