<script setup lang="ts">
import { computed, useId } from 'vue'
import PopoverPanel from './PopoverPanel.vue'
import { findAirline } from '@/data/airlines'
import {
  airlinesActive,
  defaultFilters,
  durationActive,
  filtersActive,
  priceActive,
  stopsActive,
  timesActive,
  type FlightFilters,
} from '@/lib/flightFilters'
import { useI18n } from '@/i18n'
import type { FlightOption, StopsFilter } from '@/types/flights'

const filters = defineModel<FlightFilters>({ required: true })

const props = defineProps<{
  /** Every option before filtering, so the controls can show what exists. */
  options: FlightOption[]
  /** The total shown for an option, in USD. */
  priceOf: (option: FlightOption) => number
}>()

const { t, plural, money, time, duration } = useI18n()
const uid = useId()

function update(patch: Partial<FlightFilters>) {
  filters.value = { ...filters.value, ...patch }
}

function cheapest(options: FlightOption[]): number | null {
  return options.length ? Math.min(...options.map(props.priceOf)) : null
}

/* Stops ------------------------------------------------------------------ */

const stopChoices: StopsFilter[] = ['any', '0', '1']

const stopPrices = computed(() =>
  Object.fromEntries(
    stopChoices.map((choice) => [
      choice,
      cheapest(
        props.options.filter((option) => choice === 'any' || option.stops <= Number(choice)),
      ),
    ]),
  ) as Record<StopsFilter, number | null>,
)

/* Airlines ---------------------------------------------------------------- */

const airlineChoices = computed(() => {
  const codes = [...new Set(props.options.flatMap((option) => option.airlines))]
  return codes
    .map((code) => ({
      code,
      name: findAirline(code)?.name ?? code,
      price: cheapest(props.options.filter((option) => option.airlines.includes(code))),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

function toggleAirline(code: string, included: boolean) {
  const excluded = new Set(filters.value.excludedAirlines)
  if (included) excluded.delete(code)
  else excluded.add(code)
  update({ excludedAirlines: [...excluded] })
}

function setAllAirlines(included: boolean) {
  update({ excludedAirlines: included ? [] : airlineChoices.value.map((choice) => choice.code) })
}

const includedCount = computed(
  () =>
    airlineChoices.value.filter((choice) => !filters.value.excludedAirlines.includes(choice.code))
      .length,
)

/* Price ------------------------------------------------------------------- */

const priceRange = computed(() => {
  const prices = props.options.map(props.priceOf)
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null
})

const priceStep = computed(() =>
  priceRange.value ? Math.max(1, Math.round((priceRange.value.max - priceRange.value.min) / 50)) : 1,
)

function onPrice(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  update({ maxPrice: priceRange.value && value >= priceRange.value.max ? null : value })
}

/* Times ------------------------------------------------------------------- */

function hourLabel(hour: number) {
  return hour >= 24 ? t('filters.midnight') : time(hour * 60)
}

type HourKey = 'departAfter' | 'departBefore' | 'arriveAfter' | 'arriveBefore'

/** Keeps "after" at or below "before" by moving the other handle with it. */
function onHour(key: HourKey, event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  const patch: Partial<FlightFilters> = { [key]: value }
  if (key === 'departAfter' && value > filters.value.departBefore) patch.departBefore = value
  if (key === 'departBefore' && value < filters.value.departAfter) patch.departAfter = value
  if (key === 'arriveAfter' && value > filters.value.arriveBefore) patch.arriveBefore = value
  if (key === 'arriveBefore' && value < filters.value.arriveAfter) patch.arriveAfter = value
  update(patch)
}

const timeGroups = [
  { key: 'depart', after: 'departAfter', before: 'departBefore' },
  { key: 'arrive', after: 'arriveAfter', before: 'arriveBefore' },
] as const

/* Duration ---------------------------------------------------------------- */

const durationRange = computed(() => {
  const durations = props.options.map((option) => option.durationMin)
  if (!durations.length) return null
  const step = 30
  return {
    min: Math.floor(Math.min(...durations) / step) * step,
    max: Math.ceil(Math.max(...durations) / step) * step,
    step,
  }
})

function onDuration(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  update({ maxDuration: durationRange.value && value >= durationRange.value.max ? null : value })
}

/* Chip labels ------------------------------------------------------------- */

const stopsLabel = computed(() =>
  stopsActive(filters.value) ? t(`filters.stops_${filters.value.stops}`) : t('filters.stops'),
)
const airlinesLabel = computed(() =>
  airlinesActive(filters.value)
    ? plural('filters.airlinesCount', includedCount.value)
    : t('filters.airlines'),
)
const priceLabel = computed(() =>
  filters.value.maxPrice !== null
    ? t('filters.under', { amount: money(filters.value.maxPrice) })
    : t('filters.price'),
)
const durationLabel = computed(() =>
  filters.value.maxDuration !== null
    ? t('filters.under', { amount: duration(filters.value.maxDuration) })
    : t('filters.duration'),
)
</script>

<template>
  <div class="filter-bar" role="group" :aria-label="t('filters.label')">
    <PopoverPanel :label="stopsLabel" :panel-label="t('filters.stops')" :active="stopsActive(filters)">
      <fieldset class="group">
        <legend class="group-title">{{ t('filters.stops') }}</legend>
        <label v-for="choice in stopChoices" :key="choice" class="acme-choice option">
          <input
            type="radio"
            :name="`${uid}-stops`"
            :value="choice"
            :checked="filters.stops === choice"
            :disabled="stopPrices[choice] === null"
            @change="update({ stops: choice })"
          />
          <span class="option-label">{{ t(`filters.stops_${choice}`) }}</span>
          <span class="option-price num">
            {{ stopPrices[choice] === null ? t('filters.none') : money(stopPrices[choice]!) }}
          </span>
        </label>
      </fieldset>
    </PopoverPanel>

    <PopoverPanel
      :label="airlinesLabel"
      :panel-label="t('filters.airlines')"
      :active="airlinesActive(filters)"
    >
      <label class="acme-switch">
        <input
          type="checkbox"
          :checked="!airlinesActive(filters)"
          @change="setAllAirlines(($event.target as HTMLInputElement).checked)"
        />
        {{ t('filters.allAirlines') }}
      </label>
      <fieldset class="group">
        <legend class="sr-only">{{ t('filters.airlines') }}</legend>
        <label v-for="choice in airlineChoices" :key="choice.code" class="acme-choice option">
          <input
            type="checkbox"
            :checked="!filters.excludedAirlines.includes(choice.code)"
            @change="toggleAirline(choice.code, ($event.target as HTMLInputElement).checked)"
          />
          <span class="option-label">{{ choice.name }}</span>
          <span class="option-price num">{{ choice.price === null ? '' : money(choice.price) }}</span>
        </label>
      </fieldset>
    </PopoverPanel>

    <PopoverPanel :label="priceLabel" :panel-label="t('filters.price')" :active="priceActive(filters)">
      <template v-if="priceRange">
        <label class="acme-label" :for="`${uid}-price`">
          {{
            filters.maxPrice === null
              ? t('filters.anyPrice')
              : t('filters.upTo', { amount: money(filters.maxPrice) })
          }}
        </label>
        <input
          :id="`${uid}-price`"
          type="range"
          :min="priceRange.min"
          :max="priceRange.max"
          :step="priceStep"
          :value="filters.maxPrice ?? priceRange.max"
          :aria-valuetext="filters.maxPrice === null ? t('filters.anyPrice') : money(filters.maxPrice)"
          @input="onPrice"
        />
        <p class="range-ends num">
          <span>{{ money(priceRange.min) }}</span><span>{{ money(priceRange.max) }}</span>
        </p>
      </template>
    </PopoverPanel>

    <PopoverPanel :label="t('filters.times')" :active="timesActive(filters)">
      <fieldset v-for="group in timeGroups" :key="group.key" class="group">
        <legend class="group-title">
          {{ t(`filters.${group.key}`) }}
          <span class="muted range-value num">
            {{ hourLabel(filters[group.after]) }} – {{ hourLabel(filters[group.before]) }}
          </span>
        </legend>
        <label class="acme-help" :for="`${uid}-${group.after}`">{{ t('filters.earliest') }}</label>
        <input
          :id="`${uid}-${group.after}`"
          type="range"
          min="0"
          max="24"
          step="1"
          :value="filters[group.after]"
          :aria-valuetext="hourLabel(filters[group.after])"
          @input="onHour(group.after, $event)"
        />
        <label class="acme-help" :for="`${uid}-${group.before}`">{{ t('filters.latest') }}</label>
        <input
          :id="`${uid}-${group.before}`"
          type="range"
          min="0"
          max="24"
          step="1"
          :value="filters[group.before]"
          :aria-valuetext="hourLabel(filters[group.before])"
          @input="onHour(group.before, $event)"
        />
      </fieldset>
    </PopoverPanel>

    <PopoverPanel
      :label="durationLabel"
      :panel-label="t('filters.duration')"
      :active="durationActive(filters)"
    >
      <template v-if="durationRange">
        <label class="acme-label" :for="`${uid}-duration`">
          {{
            filters.maxDuration === null
              ? t('filters.anyDuration')
              : t('filters.under', { amount: duration(filters.maxDuration) })
          }}
        </label>
        <input
          :id="`${uid}-duration`"
          type="range"
          :min="durationRange.min"
          :max="durationRange.max"
          :step="durationRange.step"
          :value="filters.maxDuration ?? durationRange.max"
          :aria-valuetext="
            filters.maxDuration === null ? t('filters.anyDuration') : duration(filters.maxDuration)
          "
          @input="onDuration"
        />
        <p class="range-ends num">
          <span>{{ duration(durationRange.min) }}</span><span>{{ duration(durationRange.max) }}</span>
        </p>
      </template>
    </PopoverPanel>

    <button
      v-if="filtersActive(filters)"
      class="acme-btn acme-btn--ghost acme-btn--sm clear"
      type="button"
      @click="filters = defaultFilters()"
    >
      {{ t('common.reset') }}
    </button>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--acme-space-2);
}

.group {
  display: grid;
  gap: var(--acme-space-2);
  margin: 0;
  padding: 0;
  border: none;
  min-width: 240px;
}

.group + .group {
  margin-top: var(--acme-space-2);
}

.group-title {
  display: flex;
  justify-content: space-between;
  gap: var(--acme-space-3);
  width: 100%;
  margin-bottom: var(--acme-space-1);
  font-size: var(--acme-text-sm);
  font-weight: 600;
}

.range-value {
  font-weight: 400;
}

.option {
  align-items: center;
}

.option-label {
  flex: 1;
}

.option-price {
  color: var(--acme-color-text-muted);
}

.range-ends {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
}
</style>
