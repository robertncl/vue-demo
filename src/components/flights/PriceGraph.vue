<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { addDays, daysBetween } from '@/lib/dates'
import { niceMax } from '@/lib/chart'
import { priceCalendar } from '@/lib/flights'
import { BOOKING_HORIZON_DAYS } from '@/lib/flightSearch'
import { useI18n } from '@/i18n'
import type { FlightSearch } from '@/types/flights'

/**
 * Cheapest total by departure date over a 60-day window, trip length held
 * fixed. One series, so no legend: Slate bars carry the data and only the
 * searched date takes Cobalt. The cheapest bar is the one direct label.
 */
const props = defineProps<{
  search: FlightSearch
  observed: string
}>()

const emit = defineEmits<{
  pick: [depart: string]
}>()

const { t, money, date, dir } = useI18n()

const DAYS = 60
const firstDay = computed(() => addDays(props.observed, 1))
const lastStart = computed(() => addDays(props.observed, BOOKING_HORIZON_DAYS - DAYS))

function clampStart(start: string) {
  if (start < firstDay.value) return firstDay.value
  if (start > lastStart.value) return lastStart.value
  return start
}

const start = ref(clampStart(addDays(props.search.depart, -14)))
watch(
  () => props.search.depart,
  (depart) => {
    if (daysBetween(start.value, depart) < 0 || daysBetween(start.value, depart) >= DAYS) {
      start.value = clampStart(addDays(depart, -14))
    }
  },
)

function page(direction: number) {
  start.value = clampStart(addDays(start.value, direction * 30))
}

const days = computed(() =>
  priceCalendar(
    props.search,
    Array.from({ length: DAYS }, (_, i) => addDays(start.value, i)),
    props.observed,
  ),
)

const totals = computed(() =>
  days.value.map((day) => day.total).filter((total): total is number => total !== null),
)
const max = computed(() => niceMax(totals.value.length ? Math.max(...totals.value) : 1))
const cheapest = computed(() => (totals.value.length ? Math.min(...totals.value) : null))
const ticks = computed(() => [max.value, max.value / 2, 0])

/** The day under the pointer or keyboard focus, read out above the plot. */
const hovered = ref<{ date: string; total: number | null } | null>(null)

function barLabel(day: { date: string; total: number | null }) {
  const price = day.total === null ? t('dates.noFlights') : money(day.total)
  return `${date(day.date, 'long')}: ${price}`
}

/** Weekly ticks; every other one is dropped on narrow screens so labels never meet. */
function axisLabel(iso: string, index: number) {
  return index % 7 === 0 ? date(iso, 'day') : ''
}

/** The direct label aligns inward near the edges so it stays inside the plot. */
function labelAlign(index: number) {
  if (index < 4) return 'start'
  if (index > DAYS - 5) return 'end'
  return 'center'
}
</script>

<template>
  <div class="price-graph">
    <!-- Time runs left to right in every language, so the plot and its paging stay LTR. -->
    <div class="toolbar" dir="ltr">
      <button
        class="acme-btn acme-btn--secondary acme-btn--sm"
        type="button"
        :disabled="start <= firstDay"
        @click="page(-1)"
      >
        {{ t('graph.earlier') }}
      </button>
      <p class="readout num" aria-live="polite" :dir="dir">
        <template v-if="hovered">
          <strong>{{ hovered.total === null ? t('dates.noFlights') : money(hovered.total) }}</strong>
          <span class="muted"> · {{ date(hovered.date, 'long') }}</span>
        </template>
        <span v-else class="muted">{{ t('graph.hint') }}</span>
      </p>
      <button
        class="acme-btn acme-btn--secondary acme-btn--sm"
        type="button"
        :disabled="start >= lastStart"
        @click="page(1)"
      >
        {{ t('graph.later') }}
      </button>
    </div>

    <div class="plot" dir="ltr">
      <div class="y-axis num" aria-hidden="true">
        <span v-for="tick in ticks" :key="tick">{{ money(tick) }}</span>
      </div>
      <div class="area">
        <div class="gridlines" aria-hidden="true">
          <span v-for="tick in ticks" :key="tick"></span>
        </div>
        <div class="bars" role="group" :aria-label="t('graph.title')" @pointerleave="hovered = null">
          <button
            v-for="(day, index) in days"
            :key="day.date"
            class="slot"
            type="button"
            :disabled="day.total === null"
            :aria-pressed="day.date === search.depart"
            :aria-label="barLabel(day)"
            @click="emit('pick', day.date)"
            @pointerenter="hovered = day"
            @focus="hovered = day"
            @blur="hovered = null"
          >
            <span
              v-if="day.total !== null"
              class="bar"
              :class="{ selected: day.date === search.depart }"
              :style="{ height: `${(day.total / max) * 100}%` }"
            ></span>
            <!-- The one direct label rides in a lane above the plot, tied to its bar by a leader. -->
            <template v-if="day.total !== null && day.total === cheapest">
              <span class="leader" :style="{ insetBlockEnd: `${(day.total / max) * 100}%` }"></span>
              <span class="direct-label num" :class="`align-${labelAlign(index)}`" :dir="dir">
                {{ t('graph.lowestLabel', { price: money(day.total) }) }}
              </span>
            </template>
          </button>
        </div>
        <div class="x-axis" aria-hidden="true">
          <span
            v-for="(day, index) in days"
            :key="day.date"
            :class="{ minor: index % 14 !== 0 }"
          >
            {{ axisLabel(day.date, index) }}
          </span>
        </div>
      </div>
    </div>

    <details class="table-view">
      <summary>{{ t('graph.showTable') }}</summary>
      <div class="table-wrap">
        <table class="acme-table">
          <thead>
            <tr>
              <th scope="col">{{ t('graph.departure') }}</th>
              <th scope="col" class="acme-table__num">{{ t('graph.cheapest') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in days" :key="day.date">
              <td>{{ date(day.date, 'long') }}</td>
              <td class="acme-table__num">
                {{ day.total === null ? t('dates.noFlights') : money(day.total) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>

<style scoped>
.price-graph {
  display: grid;
  gap: var(--acme-space-3);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--acme-space-3);
}

.readout {
  margin: 0;
  text-align: center;
  font-size: var(--acme-text-sm);
}

.plot {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--acme-space-2);
  /* The lane the direct label sits in, clear of every bar. */
  padding-top: var(--acme-space-6);
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  block-size: 200px;
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
  text-align: end;
  /* Centre each tick label on its gridline. */
  margin-block: -0.5em;
}

.area {
  position: relative;
  min-width: 0;
}

.gridlines {
  position: absolute;
  inset: 0 0 auto;
  block-size: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.gridlines span {
  block-size: 1px;
  background: var(--acme-color-border);
}

/* The baseline is the one rule that reads as an axis. */
.gridlines span:last-child {
  background: var(--acme-color-border-strong);
}

.bars {
  position: relative;
  display: grid;
  grid-template-columns: repeat(60, minmax(0, 1fr));
  block-size: 200px;
}

/* The whole column is the hit target; the bar inside is only the mark. */
.slot {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 1px;
  border: none;
  background: none;
  cursor: pointer;
}

.slot:disabled {
  cursor: default;
}

.slot:focus-visible {
  outline-offset: 0;
}

.bar {
  position: relative;
  inline-size: 100%;
  max-inline-size: 24px;
  min-block-size: 2px;
  border-radius: 4px 4px 0 0;
  background: var(--acme-color-data);
  transition: filter var(--acme-duration-fast) var(--acme-ease-out);
}

.slot:hover .bar,
.slot:focus-visible .bar {
  filter: brightness(0.85);
}

.bar.selected {
  background: var(--acme-color-data-highlight);
}

.leader {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 50%;
  inline-size: 1px;
  background: var(--acme-color-border-strong);
  pointer-events: none;
}

.direct-label {
  position: absolute;
  inset-block-end: calc(100% + 4px);
  font-size: var(--acme-text-xs);
  font-weight: 600;
  color: var(--acme-color-text);
  white-space: nowrap;
  pointer-events: none;
}

.direct-label.align-center {
  inset-inline-start: 50%;
  translate: -50% 0;
}

.direct-label.align-start {
  inset-inline-start: 0;
}

.direct-label.align-end {
  inset-inline-end: 0;
}

.x-axis {
  display: grid;
  grid-template-columns: repeat(60, minmax(0, 1fr));
  padding-top: var(--acme-space-1);
  font-size: 0.625rem;
  color: var(--acme-color-text-muted);
  white-space: nowrap;
}

@media (max-width: 560px) {
  .x-axis .minor {
    visibility: hidden;
  }
}

.table-view summary {
  cursor: pointer;
  font-size: var(--acme-text-sm);
  color: var(--acme-color-link);
}

.table-view .table-wrap {
  max-block-size: 260px;
  overflow: auto;
  margin-top: var(--acme-space-2);
}
</style>
