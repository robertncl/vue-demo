<script setup lang="ts">
import type { Trip } from '@/types/travel'

defineProps<{
  trips: Trip[]
  selectedTripId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <ul class="trip-list">
    <li v-if="trips.length === 0" class="empty">No trips yet — add one to start planning.</li>
    <TransitionGroup name="trip">
      <li
        v-for="trip in trips"
        :key="trip.id"
        class="trip-card"
        :class="{ active: trip.id === selectedTripId }"
        @click="emit('select', trip.id)"
      >
        <div>
          <strong>{{ trip.destination }}</strong>
          <span class="dates">{{ trip.startDate }} → {{ trip.endDate }}</span>
        </div>
        <button class="remove" type="button" @click.stop="emit('remove', trip.id)">✕</button>
      </li>
    </TransitionGroup>
  </ul>
</template>

<style scoped>
.trip-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty {
  color: var(--color-text);
  opacity: 0.7;
}

.trip-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
}

.trip-card.active {
  border-color: hsla(160, 100%, 37%, 1);
  background: var(--color-background-soft);
}

.dates {
  display: block;
  font-size: 0.8rem;
  opacity: 0.7;
}

.remove {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
}

.remove:hover {
  opacity: 1;
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
