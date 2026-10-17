<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch } from 'vue'
import AirportInput from './AirportInput.vue'
import PassengerPicker from './PassengerPicker.vue'
import { useFlightsStore } from '@/stores/flights'
import { useI18n } from '@/i18n'
import { addDays, daysBetween, isIsoDate } from '@/lib/dates'
import {
  BOOKING_HORIZON_DAYS,
  cabins,
  defaultSearch,
  searchProblems,
  type SearchProblem,
} from '@/lib/flightSearch'
import type { Cabin, FlightSearch, Passengers, TripType } from '@/types/flights'

const props = defineProps<{
  /** Fills the form; missing fields fall back to sensible defaults. */
  initial?: Partial<FlightSearch> | null
  /** The slimmer bar that sits above results. */
  compact?: boolean
  /** Problems found before the form was shown, e.g. in a shared link. */
  problems?: SearchProblem[]
}>()

const emit = defineEmits<{
  search: [search: FlightSearch]
}>()

const flights = useFlightsStore()
const { t } = useI18n()
const uid = useId()
const ids = {
  trip: `${uid}-trip`,
  from: `${uid}-from`,
  to: `${uid}-to`,
  depart: `${uid}-depart`,
  return: `${uid}-return`,
  cabin: `${uid}-cabin`,
}

const form = reactive({
  trip: 'round' as TripType,
  from: '',
  to: '',
  depart: '',
  return: '',
  cabin: 'economy' as Cabin,
})
const passengers = ref<Passengers>({ adults: 1, children: 0, infants: 0 })
const problems = ref<SearchProblem[]>([])

/** Remembered so moving the departure can move the return with it. */
let lastDepart = ''

function fill(initial: Partial<FlightSearch> | null | undefined) {
  const base = defaultSearch(initial?.from ?? flights.homeAirport, initial?.to ?? '', flights.today)
  const usable = (date: string | undefined) =>
    isIsoDate(date) && date >= flights.today ? date : undefined
  form.trip = initial?.trip ?? 'round'
  form.from = initial?.from ?? base.from
  form.to = initial?.to ?? ''
  form.depart = usable(initial?.depart) ?? base.depart
  form.return = usable(initial?.return) ?? addDays(form.depart, 7)
  form.cabin = initial?.cabin ?? 'economy'
  passengers.value = {
    adults: Number.isInteger(initial?.adults) ? initial!.adults! : 1,
    children: Number.isInteger(initial?.children) ? initial!.children! : 0,
    infants: Number.isInteger(initial?.infants) ? initial!.infants! : 0,
  }
  lastDepart = form.depart
  problems.value = props.problems ?? []
}

watch(() => props.initial, fill, { immediate: true, deep: true })

const maxDate = computed(() => addDays(flights.today, BOOKING_HORIZON_DAYS))

/** Moving the departure keeps the trip the same length, as most people intend. */
function onDepartChange() {
  if (isIsoDate(lastDepart) && isIsoDate(form.depart) && isIsoDate(form.return)) {
    const shifted = addDays(form.return, daysBetween(lastDepart, form.depart))
    form.return = shifted < form.depart ? form.depart : shifted
  }
  lastDepart = form.depart
  clear('depart')
}

function swap() {
  ;[form.from, form.to] = [form.to, form.from]
  clear('from')
  clear('to')
  clear('same')
}

function clear(problem: SearchProblem) {
  problems.value = problems.value.filter((p) => p !== problem)
}

function has(problem: SearchProblem) {
  return problems.value.includes(problem)
}

function build(): FlightSearch {
  const search: FlightSearch = {
    trip: form.trip,
    from: form.from,
    to: form.to,
    depart: form.depart,
    cabin: form.cabin,
    ...passengers.value,
  }
  if (form.trip === 'round') search.return = form.return
  return search
}

const FIELD_FOR: Record<SearchProblem, string | null> = {
  from: ids.from,
  to: ids.to,
  same: ids.to,
  depart: ids.depart,
  return: ids.return,
  passengers: null,
}

async function submit() {
  const search = build()
  problems.value = searchProblems(search, flights.today)
  if (problems.value.length) {
    await nextTick()
    const field = FIELD_FOR[problems.value[0]!]
    if (field) document.getElementById(field)?.focus()
    return
  }
  flights.remember(search)
  emit('search', search)
}
</script>

<template>
  <form
    class="acme-card search-form"
    :class="{ compact }"
    role="search"
    :aria-label="t('search.label')"
    novalidate
    @submit.prevent="submit"
  >
    <div class="options">
      <fieldset class="segmented">
        <legend class="sr-only">{{ t('search.tripType') }}</legend>
        <label v-for="type in ['round', 'oneway'] as const" :key="type">
          <input v-model="form.trip" class="sr-only" type="radio" :name="ids.trip" :value="type" />
          <span>{{ t(`search.trip_${type}`) }}</span>
        </label>
      </fieldset>

      <PassengerPicker v-model="passengers" @update:model-value="clear('passengers')" />

      <label class="sr-only" :for="ids.cabin">{{ t('search.cabin') }}</label>
      <select :id="ids.cabin" v-model="form.cabin" class="acme-input cabin" name="cabin">
        <option v-for="cabin in cabins" :key="cabin" :value="cabin">
          {{ t(`search.cabin_${cabin}`) }}
        </option>
      </select>
    </div>

    <div class="fields">
      <div class="route">
        <AirportInput
          :id="ids.from"
          v-model="form.from"
          name="from"
          :label="t('search.from')"
          :placeholder="t('search.fromPlaceholder')"
          :invalid="has('from')"
          @update:model-value="clear('from')"
        />
        <button
          class="acme-btn acme-btn--secondary swap"
          type="button"
          :aria-label="t('search.swap')"
          @click="swap"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M2 5h11M10 2l3 3-3 3M14 11H3M6 8l-3 3 3 3"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </button>
        <AirportInput
          :id="ids.to"
          v-model="form.to"
          name="to"
          :label="t('search.to')"
          :placeholder="t('search.toPlaceholder')"
          :invalid="has('to') || has('same')"
          @update:model-value="clear('to'), clear('same')"
        />
      </div>

      <div class="dates">
        <div class="acme-field">
          <label class="acme-label" :for="ids.depart">{{ t('search.depart') }}</label>
          <input
            :id="ids.depart"
            v-model="form.depart"
            class="acme-input"
            type="date"
            name="depart"
            :min="flights.today"
            :max="maxDate"
            required
            :aria-invalid="has('depart')"
            @change="onDepartChange"
          />
        </div>
        <div v-if="form.trip === 'round'" class="acme-field">
          <label class="acme-label" :for="ids.return">{{ t('search.return') }}</label>
          <input
            :id="ids.return"
            v-model="form.return"
            class="acme-input"
            type="date"
            name="return"
            :min="form.depart || flights.today"
            :max="maxDate"
            required
            :aria-invalid="has('return')"
            @change="clear('return')"
          />
        </div>
      </div>

      <button class="acme-btn acme-btn--primary submit" :class="{ 'acme-btn--lg': !compact }" type="submit">
        {{ t('search.submit') }}
      </button>
    </div>

    <div v-if="problems.length" class="acme-alert acme-alert--danger problems" role="alert">
      <ul>
        <li v-for="problem in problems" :key="problem">{{ t(`search.error_${problem}`) }}</li>
      </ul>
    </div>
  </form>
</template>

<style scoped>
.search-form {
  padding: var(--acme-space-5);
  gap: var(--acme-space-4);
  overflow: visible;
}

.search-form.compact {
  padding: var(--acme-space-4);
  gap: var(--acme-space-3);
}

.options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--acme-space-2);
}

.cabin {
  width: auto;
  min-height: 2.25rem;
}

.fields {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
  gap: var(--acme-space-3);
  align-items: end;
}

.route {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: var(--acme-space-2);
  align-items: end;
}

/* Error text under one airport field must not push the swap button out of line. */
.route > :deep(.airport-field) {
  align-self: start;
}

.swap {
  align-self: start;
  margin-top: 1.6rem;
  inline-size: 2.5rem;
  padding: 0;
}

.dates {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: var(--acme-space-2);
}

.dates .acme-input {
  width: 100%;
  min-width: 0;
}

.submit {
  white-space: nowrap;
}

.problems ul {
  margin: 0;
  padding-inline-start: var(--acme-space-5);
}

@media (max-width: 860px) {
  .fields {
    grid-template-columns: minmax(0, 1fr);
  }

  .dates {
    grid-auto-flow: row;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .route {
    grid-template-columns: minmax(0, 1fr);
  }

  .swap {
    justify-self: end;
    margin-top: 0;
  }
}
</style>
