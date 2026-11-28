<script setup lang="ts">
import { computed } from 'vue'
import { addDays } from '@/lib/dates'
import { priceCalendar } from '@/lib/flights'
import { useI18n } from '@/i18n'
import type { FlightSearch } from '@/types/flights'

/** The cheapest total for each departure three days either side of the one searched. */
const props = defineProps<{
  search: FlightSearch
  observed: string
}>()

const emit = defineEmits<{
  pick: [depart: string]
}>()

const { t, money, date } = useI18n()

const days = computed(() => {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(props.search.depart, i - 3)).filter(
    (day) => day >= props.observed,
  )
  return priceCalendar(props.search, dates, props.observed)
})

const lowest = computed(() => {
  const totals = days.value.map((day) => day.total).filter((total): total is number => total !== null)
  return totals.length ? Math.min(...totals) : null
})
</script>

<template>
  <ol class="date-strip" :aria-label="t('dates.stripLabel')">
    <li v-for="day in days" :key="day.date">
      <button
        class="day"
        :class="{ current: day.date === search.depart }"
        type="button"
        :aria-current="day.date === search.depart ? 'date' : undefined"
        :disabled="day.total === null"
        @click="emit('pick', day.date)"
      >
        <span class="weekday">{{ date(day.date, 'weekday') }}</span>
        <span class="when">{{ date(day.date, 'day') }}</span>
        <span class="amount num" :class="{ lowest: day.total !== null && day.total === lowest }">
          {{ day.total === null ? t('dates.noFlights') : money(day.total) }}
        </span>
        <span v-if="day.total !== null && day.total === lowest" class="tag">{{ t('dates.lowest') }}</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.date-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--mod-rule);
  border-radius: var(--mod-radius-none);
  background: var(--mod-paper);
  overflow: hidden;
}

.date-strip li + li {
  border-inline-start: 1px solid var(--mod-rule);
}

.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  inline-size: 100%;
  block-size: 100%;
  padding: var(--mod-space-2) var(--mod-space-1);
  border: none;
  border-block-end: 2px solid transparent;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.day:hover:not(:disabled) {
  background: var(--mod-paper-2);
}

.day:disabled {
  cursor: default;
  color: var(--mod-ink-3);
}

.day:focus-visible {
  outline-offset: -2px;
}

/* The searched date is a selection: the Blue underline and wash. */
.day.current {
  background: var(--mod-blue-soft);
  border-block-end-color: var(--mod-blue);
}

.weekday {
  font-size: var(--mod-size-label);
  color: var(--mod-ink-2);
}

.when {
  font-size: var(--mod-size-small);
  font-weight: 600;
}

.amount {
  font-size: var(--mod-size-small);
}

.amount.lowest {
  font-weight: 600;
}

.tag {
  font-size: var(--mod-size-label);
  font-weight: 600;
  color: var(--mod-ink-2);
}

@media (max-width: 560px) {
  .date-strip {
    grid-template-columns: repeat(7, minmax(4.5rem, 1fr));
    overflow-x: auto;
  }
}
</style>
