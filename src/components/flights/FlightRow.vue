<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import AirlineMark from './AirlineMark.vue'
import { findAirline } from '@/data/airlines'
import { findAirport } from '@/data/airports'
import { useI18n } from '@/i18n'
import type { Cabin, FlightOption } from '@/types/flights'

const props = defineProps<{
  option: FlightOption
  /** Total for everyone travelling, in USD. */
  total: number
  /** What the total covers, e.g. "round trip". */
  priceNote: string
  cabin: Cabin
  /** Median emissions of the result set, for the comparison line. */
  medianEmissions?: number
  /** The select button's text; omit for a read-only row. */
  actionLabel?: string
  /** Starts expanded, e.g. on the booking summary. */
  open?: boolean
}>()

const emit = defineEmits<{
  select: [option: FlightOption]
}>()

const { t, plural, money, time, duration, number } = useI18n()
const detailsId = `flight-${useId()}`
const expanded = ref(props.open ?? false)

const first = computed(() => props.option.segments[0]!)
const last = computed(() => props.option.segments[props.option.segments.length - 1]!)

const airlineNames = computed(() =>
  props.option.airlines.map((code) => findAirline(code)?.name ?? code).join(', '),
)

/** Days between the local departure date and a later local time, e.g. +1. */
function dayOffset(wallMinutes: number) {
  return Math.floor(wallMinutes / 1440) - Math.floor(props.option.departs / 1440)
}

function signed(n: number) {
  return n > 0 ? `+${n}` : `${n}`
}

const arrivalOffset = computed(() => dayOffset(props.option.arrives))

const stopsLabel = computed(() =>
  props.option.stops === 0 ? t('flights.nonstop') : plural('flights.stops', props.option.stops),
)

/** Under the stop count: the layover length and where, or every connecting airport. */
const stopsDetail = computed(() => {
  const { layovers } = props.option
  if (layovers.length === 0) return ''
  if (layovers.length === 1) return `${duration(layovers[0]!.durationMin)} ${layovers[0]!.airport}`
  return layovers.map((layover) => layover.airport).join(', ')
})

const emissionsDelta = computed(() => {
  const median = props.medianEmissions
  if (!median) return 0
  return Math.round(((props.option.emissionsKg - median) / median) * 100)
})

function airportName(code: string) {
  const airport = findAirport(code)
  return airport ? `${airport.name} (${code})` : code
}

function cityName(code: string) {
  return findAirport(code)?.city ?? code
}

function legroom(airlineCode: string, distanceKm: number) {
  if (props.cabin === 'economy') {
    return t('flights.legroom', { inches: findAirline(airlineCode)?.legroom ?? 31 })
  }
  if (props.cabin === 'premium') return t('flights.legroom', { inches: 38 })
  if (props.cabin === 'first') return t('flights.suite')
  return distanceKm > 4500 ? t('flights.flatBed') : t('flights.recliner')
}

const summaryLabel = computed(() =>
  t('flights.rowLabel', {
    airline: airlineNames.value,
    from: cityName(first.value.from),
    departs: time(props.option.departs),
    to: cityName(last.value.to),
    arrives: time(props.option.arrives),
    duration: duration(props.option.durationMin),
    stops: stopsLabel.value,
    price: money(props.total),
    note: props.priceNote,
  }),
)
</script>

<template>
  <li class="flight-row" :class="{ expanded }">
    <button
      class="summary"
      type="button"
      :aria-expanded="expanded"
      :aria-controls="detailsId"
      :aria-label="summaryLabel"
      @click="expanded = !expanded"
    >
      <AirlineMark :codes="option.airlines" />
      <span class="col when">
        <span class="lead num">
          {{ time(option.departs) }} – {{ time(option.arrives)
          }}<sup v-if="arrivalOffset" class="offset">{{ signed(arrivalOffset) }}</sup>
        </span>
        <span class="sub">{{ airlineNames }}</span>
      </span>
      <span class="col length">
        <span class="lead">{{ duration(option.durationMin) }}</span>
        <span class="sub">{{ first.from }}–{{ last.to }}</span>
      </span>
      <span class="col stops">
        <span class="lead">{{ stopsLabel }}</span>
        <span class="sub">{{ stopsDetail }}</span>
      </span>
      <span class="col emissions">
        <span class="lead num">{{ t('flights.emissions', { kg: number(option.emissionsKg) }) }}</span>
        <span v-if="emissionsDelta <= -10" class="sub">
          {{ t('flights.emissionsLower', { pct: -emissionsDelta }) }}
        </span>
        <span v-else-if="emissionsDelta >= 10" class="sub">
          {{ t('flights.emissionsHigher', { pct: emissionsDelta }) }}
        </span>
        <span v-else class="sub">{{ t('flights.emissionsTypical') }}</span>
      </span>
      <span class="col price">
        <span class="lead amount">{{ money(total) }}</span>
        <span class="sub">{{ priceNote }}</span>
      </span>
      <svg class="chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </button>

    <div v-if="expanded" :id="detailsId" class="details">
      <ol class="timeline">
        <template v-for="(segment, index) in option.segments" :key="segment.flightNumber">
          <li class="segment">
            <p class="stop">
              <strong class="num">{{ time(segment.departs) }}</strong>
              <sup v-if="dayOffset(segment.departs)" class="offset">
                {{ signed(dayOffset(segment.departs)) }}
              </sup>
              · {{ airportName(segment.from) }}
            </p>
            <p class="travel">{{ t('flights.travelTime', { duration: duration(segment.durationMin) }) }}</p>
            <p class="stop">
              <strong class="num">{{ time(segment.arrives) }}</strong>
              <sup v-if="dayOffset(segment.arrives)" class="offset">
                {{ signed(dayOffset(segment.arrives)) }}
              </sup>
              · {{ airportName(segment.to) }}
            </p>
            <p class="meta">
              {{ findAirline(segment.airline)?.name }} · {{ t(`search.cabin_${cabin}`) }} ·
              {{ segment.aircraft }} · {{ segment.flightNumber }} ·
              {{ legroom(segment.airline, segment.distanceKm) }}
            </p>
          </li>
          <li v-if="option.layovers[index]" class="layover">
            {{
              t('flights.layover', {
                duration: duration(option.layovers[index]!.durationMin),
                city: cityName(option.layovers[index]!.airport),
                code: option.layovers[index]!.airport,
              })
            }}
            <span v-if="option.layovers[index]!.overnight" class="acme-badge">
              {{ t('flights.overnight') }}
            </span>
          </li>
        </template>
      </ol>

      <div v-if="actionLabel" class="actions">
        <button class="acme-btn acme-btn--primary select" type="button" @click="emit('select', option)">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.flight-row {
  list-style: none;
  border-block-end: 1px solid var(--acme-color-border);
  /* The row lays itself out by its own width, so it fits a narrow column on a
     wide screen (the booking summary) as well as a phone. */
  container: flight-row / inline-size;
}

.flight-row:last-child {
  border-block-end: none;
}

.summary {
  display: grid;
  grid-template-columns: auto minmax(0, 2.2fr) minmax(0, 1.3fr) minmax(0, 1.4fr) minmax(0, 1.3fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--acme-space-4);
  inline-size: 100%;
  padding: var(--acme-space-4) var(--acme-space-5);
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: start;
  cursor: pointer;
  transition: background-color var(--acme-duration-base) var(--acme-ease-out);
}

.summary:hover {
  background: var(--acme-color-surface);
}

.summary:focus-visible {
  outline-offset: -2px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.lead {
  font-size: var(--acme-text-md);
  font-weight: 600;
}

.sub {
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.offset {
  margin-inline-start: 0.125rem;
  font-size: 0.7em;
  font-weight: 600;
  color: var(--acme-color-text-muted);
}

.price {
  align-items: flex-end;
  text-align: end;
}

.emissions .lead {
  font-size: var(--acme-text-sm);
  font-weight: 500;
}

.chevron {
  color: var(--acme-color-text-muted);
  transition: rotate var(--acme-duration-base) var(--acme-ease-out);
}

.expanded .chevron {
  rotate: 180deg;
}

.details {
  display: grid;
  gap: var(--acme-space-4);
  padding: 0 var(--acme-space-5) var(--acme-space-5) calc(var(--acme-space-5) + 2.25rem + var(--acme-space-4));
}

.timeline {
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--acme-space-3);
}

.segment {
  list-style: none;
  padding-inline-start: var(--acme-space-4);
  border-inline-start: 2px solid var(--acme-color-border);
}

.segment p {
  margin: 0;
  font-size: var(--acme-text-sm);
}

.travel,
.meta {
  color: var(--acme-color-text-muted);
}

.travel {
  padding-block: var(--acme-space-1);
}

.meta {
  margin-top: var(--acme-space-2) !important;
  font-size: var(--acme-text-xs) !important;
}

.layover {
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--acme-space-2);
  padding: var(--acme-space-2) var(--acme-space-3);
  border-block: 1px solid var(--acme-color-border);
  font-size: var(--acme-text-sm);
  color: var(--acme-color-text-muted);
}

.actions {
  display: flex;
  justify-content: flex-end;
}

@container flight-row (max-width: 820px) {
  .summary {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'mark when price'
      'mark length price'
      'mark stops chevron';
    row-gap: var(--acme-space-1);
  }

  .summary > :first-child {
    grid-area: mark;
    align-self: start;
  }

  .when {
    grid-area: when;
  }

  .length {
    grid-area: length;
    flex-direction: row;
    gap: var(--acme-space-2);
  }

  .stops {
    grid-area: stops;
    flex-direction: row;
    gap: var(--acme-space-2);
  }

  .price {
    grid-area: price;
    align-self: start;
  }

  .chevron {
    grid-area: chevron;
    justify-self: end;
  }

  .emissions {
    display: none;
  }

  .length .lead,
  .stops .lead {
    font-size: var(--acme-text-sm);
    font-weight: 500;
  }

  .details {
    padding-inline-start: var(--acme-space-5);
  }
}
</style>
