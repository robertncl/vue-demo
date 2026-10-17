<script setup lang="ts">
import { computed } from 'vue'
import { dateGrid } from '@/lib/flights'
import { useI18n } from '@/i18n'
import type { FlightSearch } from '@/types/flights'

/** Cheapest round-trip totals for departures (rows) against returns (columns). */
const props = defineProps<{
  search: FlightSearch
  observed: string
}>()

const emit = defineEmits<{
  pick: [dates: { depart: string; ret: string }]
}>()

const { t, money, date } = useI18n()

const grid = computed(() => dateGrid(props.search, props.observed))
const returns = computed(() => grid.value[0]?.map((cell) => cell.ret) ?? [])

const cheapest = computed(() => {
  const totals = grid.value
    .flat()
    .map((cell) => cell.total)
    .filter((total): total is number => total !== null)
  return totals.length ? Math.min(...totals) : null
})

function isCurrent(depart: string, ret: string) {
  return depart === props.search.depart && ret === props.search.return
}
</script>

<template>
  <div class="table-wrap">
    <table class="date-grid">
      <caption class="sr-only">{{ t('dates.gridCaption') }}</caption>
      <thead>
        <tr>
          <th scope="col" class="corner">
            <span class="axis">{{ t('dates.departAxis') }} ↓</span>
            <span class="axis">{{ t('dates.returnAxis') }} →</span>
          </th>
          <th v-for="ret in returns" :key="ret" scope="col">
            <span class="weekday">{{ date(ret, 'weekday') }}</span>
            {{ date(ret, 'day') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in grid" :key="row[0]!.depart">
          <th scope="row">
            <span class="weekday">{{ date(row[0]!.depart, 'weekday') }}</span>
            {{ date(row[0]!.depart, 'day') }}
          </th>
          <td v-for="cell in row" :key="cell.ret">
            <button
              v-if="cell.total !== null"
              class="cell num"
              :class="{ current: isCurrent(cell.depart, cell.ret), cheapest: cell.total === cheapest }"
              type="button"
              :aria-pressed="isCurrent(cell.depart, cell.ret)"
              :aria-label="
                t('dates.gridCell', {
                  depart: date(cell.depart, 'long'),
                  ret: date(cell.ret, 'long'),
                  price: money(cell.total),
                })
              "
              @click="emit('pick', { depart: cell.depart, ret: cell.ret })"
            >
              {{ money(cell.total) }}
              <span v-if="cell.total === cheapest" class="tag">{{ t('dates.lowest') }}</span>
            </button>
            <span v-else class="empty" :aria-label="t('dates.noFlights')">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.date-grid {
  inline-size: 100%;
  border-collapse: separate;
  border-spacing: 2px;
  font-size: var(--acme-text-sm);
}

th {
  padding: var(--acme-space-2);
  font-size: var(--acme-text-xs);
  font-weight: 600;
  color: var(--acme-color-text-muted);
  text-align: center;
  white-space: nowrap;
}

th .weekday {
  display: block;
  font-weight: 400;
}

.corner {
  text-align: start;
}

/* On narrow screens the grid scrolls sideways; the departure dates stay put. */
tbody th,
.corner {
  position: sticky;
  inset-inline-start: 0;
  z-index: 1;
  background: var(--acme-color-surface-raised);
}

.corner .axis {
  display: block;
  font-weight: 400;
}

td {
  padding: 0;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  min-block-size: 3rem;
  padding: var(--acme-space-1);
  border: 1px solid var(--acme-color-border);
  border-radius: var(--acme-radius-sm);
  background: var(--acme-color-surface-raised);
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.cell:hover {
  background: var(--acme-color-surface);
}

.cell.cheapest {
  font-weight: 700;
}

.cell.current {
  border-color: var(--acme-color-selected);
  background: var(--acme-color-selected-soft);
  color: var(--acme-color-selected);
}

.tag {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--acme-color-text-muted);
}

.empty {
  display: grid;
  place-items: center;
  min-block-size: 3rem;
  color: var(--acme-color-text-subtle);
}
</style>
