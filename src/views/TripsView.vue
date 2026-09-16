<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import TripForm from '@/components/travel/TripForm.vue'
import TripList from '@/components/travel/TripList.vue'
import ItineraryPlanner from '@/components/travel/ItineraryPlanner.vue'
import type { TripDraft } from '@/types/travel'

const route = useRoute()
const travel = useTravelStore()

/** Destination pages link here with the trip details pre-filled. */
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
        <p class="eyebrow">Planner</p>
        <h1>My trips</h1>
        <p>
          Create a trip, then build it out day by day. Costs roll up against the budget as you go,
          and everything is saved in this browser.
        </p>
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
          <h2>Nothing selected</h2>
          <p class="muted">Select or create a trip to start planning the itinerary.</p>
          <RouterLink class="btn btn-ghost" to="/destinations">Find a destination</RouterLink>
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
