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

    <ul v-else class="trip-list">
      <li
        v-for="trip in trips"
        :key="trip.id"
        class="trip-card"
        :class="{ active: trip.id === selectedTripId }"
      >
        <button class="info" type="button" @click="emit('select', trip.id)">
          <strong>{{ trip.destination }}</strong>
          <span class="dates num">{{ trip.startDate }} → {{ trip.endDate }}</span>
          <span class="meta">
            {{
              t('trips.tripMeta', {
                count: trip.activities.length,
                spent: money(spend(trip)),
                budget: money(trip.budget),
              })
            }}
          </span>
        </button>
        <button
          class="acme-btn acme-btn--ghost acme-btn--sm remove"
          type="button"
          :aria-label="t('trips.removeTrip', { name: trip.destination })"
          @click="emit('remove', trip.id)"
        >
          {{ t('common.delete') }}
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 var(--acme-space-3);
  font-size: var(--acme-text-lg);
}

.empty {
  margin: 0;
  font-size: var(--acme-text-sm);
}

.trip-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-2);
}

.trip-card {
  display: flex;
  align-items: center;
  gap: var(--acme-space-3);
  padding: var(--acme-space-3) var(--acme-space-4);
  border: 1px solid var(--acme-color-border);
  border-radius: var(--acme-radius-lg);
  background: var(--acme-color-surface-raised);
}

/* Selection is orientation, so it takes Clay rather than a second fill. */
.trip-card.active {
  border-color: var(--acme-color-selected);
  background: var(--acme-color-selected-soft);
}

.info {
  flex: 1;
  min-width: 0;
  text-align: start;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font: inherit;
}

.info strong {
  display: block;
  font-weight: 600;
}

.dates,
.meta {
  display: block;
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
}
</style>
