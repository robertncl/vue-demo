<script setup lang="ts">
import { useTravelStore } from '@/stores/travel'
import TripForm from '@/components/travel/TripForm.vue'
import TripList from '@/components/travel/TripList.vue'
import ItineraryPlanner from '@/components/travel/ItineraryPlanner.vue'

const travel = useTravelStore()
</script>

<template>
  <main class="travel-planner">
    <h1>Travel Planner</h1>
    <p class="subtitle">A small demo app showing Pinia state, computed budgets, and reactive forms.</p>

    <div class="layout">
      <aside>
        <TripForm @create="travel.addTrip" />
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
        @add-activity="travel.addActivity"
        @remove-activity="travel.removeActivity"
      />
      <p v-else class="placeholder">Select or create a trip to start planning the itinerary.</p>
    </div>
  </main>
</template>

<style scoped>
.travel-planner {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
}

.subtitle {
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.layout {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
  gap: 1.5rem;
  align-items: start;
}

aside {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.placeholder {
  opacity: 0.7;
}

@media (max-width: 720px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
