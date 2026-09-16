<script setup lang="ts">
import { useI18n } from '@/i18n'
import type { Trip } from '@/types/travel'

defineProps<{
  trips: Trip[]
  selectedTripId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  remove: [id: string]
}>()

const { t, money } = useI18n()

function spend(trip: Trip) {
  return trip.activities.reduce((sum, activity) => sum + activity.cost, 0)
}
</script>

<template>
  <section class="trip-list-wrap">
    <h2>{{ t('trips.yourTrips') }}</h2>

    <p v-if="trips.length === 0" class="empty muted">{{ t('trips.noTrips') }}</p>

    <TransitionGroup v-else tag="ul" name="trip" class="trip-list">
      <li
        v-for="trip in trips"
        :key="trip.id"
        class="trip-card card"
        :class="{ active: trip.id === selectedTripId }"
        @click="emit('select', trip.id)"
      >
        <div class="info">
          <strong>{{ trip.destination }}</strong>
          <span class="dates muted">{{ trip.startDate }} → {{ trip.endDate }}</span>
          <span class="meta muted">
            {{
              t('trips.tripMeta', {
                count: trip.activities.length,
                spent: money(spend(trip)),
                budget: money(trip.budget),
              })
            }}
          </span>
        </div>
        <button
          class="icon-btn remove"
          type="button"
          :aria-label="t('trips.removeTrip', { name: trip.destination })"
          @click.stop="emit('remove', trip.id)"
        >
          ✕
        </button>
      </li>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.trip-list-wrap h2 {
  font-size: 1.05rem;
  margin-bottom: 0.65rem;
}

.trip-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.empty {
  font-size: 0.9rem;
}

.trip-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.trip-card:hover {
  background: var(--c-surface-soft);
}

.trip-card.active {
  border-left-color: var(--c-brand);
  background: var(--c-brand-soft);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.info strong {
  color: var(--c-heading);
}

.dates,
.meta {
  font-size: 0.78rem;
}

.trip-enter-active,
.trip-leave-active {
  transition: all 0.2s ease;
}

.trip-enter-from,
.trip-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
