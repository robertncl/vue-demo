<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { niceMax } from '@/lib/chart'
import { useI18n } from '@/i18n'

/**
 * A tracked search's cheapest price over the last month. One series, so no
 * legend: a 2px Slate line, the latest value as a Cobalt end dot with its
 * label, and a crosshair readout on hover or arrow keys.
 */
const props = defineProps<{
  points: { date: string; total: number | null }[]
  label: string
}>()

const { t, money, date, dir } = useI18n()

const HEIGHT = 140
const PAD = { top: 16, right: 56, bottom: 22, left: 8 }

const root = ref<HTMLElement | null>(null)
const width = ref(480)
let observer: ResizeObserver | null = null

onMounted(() => {
  if (!root.value || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(([entry]) => {
    if (entry) width.value = Math.max(240, Math.round(entry.contentRect.width))
  })
  observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

const known = computed(() =>
  props.points
    .map((point, index) => ({ ...point, index }))
    .filter((point): point is { date: string; total: number; index: number } => point.total !== null),
)

const domain = computed(() => {
  const totals = known.value.map((point) => point.total)
  const min = Math.min(...totals)
  const max = Math.max(...totals)
  // Don't zero the axis: a fare's movement is the story, and the ticks say where it sits.
  const spread = Math.max(max - min, max * 0.05)
  const lo = Math.max(0, Math.floor((min - spread * 0.25) / 10) * 10)
  return { lo, hi: lo + niceMax(max + spread * 0.25 - lo) }
})

const x = (index: number) =>
  PAD.left + (index / Math.max(1, props.points.length - 1)) * (width.value - PAD.left - PAD.right)
const y = (value: number) =>
  PAD.top +
  (1 - (value - domain.value.lo) / (domain.value.hi - domain.value.lo)) * (HEIGHT - PAD.top - PAD.bottom)

const path = computed(() =>
  known.value
    .map((point, i) => `${i === 0 ? 'M' : 'L'}${x(point.index).toFixed(1)},${y(point.total).toFixed(1)}`)
    .join(' '),
)

const last = computed(() => known.value[known.value.length - 1] ?? null)
const ticks = computed(() => [domain.value.hi, (domain.value.hi + domain.value.lo) / 2, domain.value.lo])

const active = ref<number | null>(null)
const activePoint = computed(() =>
  active.value === null ? null : (known.value.find((point) => point.index === active.value) ?? null),
)

function onPointer(event: PointerEvent) {
  const box = (event.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (event.clientX - box.left - PAD.left) / (box.width - PAD.left - PAD.right)
  const index = Math.round(ratio * (props.points.length - 1))
  const nearest = known.value.reduce<(typeof known.value)[number] | null>(
    (best, point) =>
      !best || Math.abs(point.index - index) < Math.abs(best.index - index) ? point : best,
    null,
  )
  active.value = nearest?.index ?? null
}

function onKey(event: KeyboardEvent) {
  if (!known.value.length) return
  const positions = known.value.map((point) => point.index)
  const current = active.value === null ? positions.length - 1 : positions.indexOf(active.value)
  if (event.key === 'ArrowLeft') active.value = positions[Math.max(0, current - 1)]!
  else if (event.key === 'ArrowRight') active.value = positions[Math.min(positions.length - 1, current + 1)]!
  else return
  event.preventDefault()
}
</script>

<template>
  <figure ref="root" class="history">
    <p class="readout num" aria-live="polite" :dir="dir">
      <template v-if="activePoint">
        <strong>{{ money(activePoint.total) }}</strong>
        <span class="muted"> · {{ date(activePoint.date, 'long') }}</span>
      </template>
      <span v-else class="muted">{{ t('tracked.historyHint') }}</span>
    </p>
    <!-- SVG coordinates and text anchors are physical; keep the chart LTR in every language. -->
    <svg
      dir="ltr"
      v-if="known.length > 1"
      :width="width"
      :height="HEIGHT"
      :viewBox="`0 0 ${width} ${HEIGHT}`"
      role="img"
      tabindex="0"
      :aria-label="label"
      @pointermove="onPointer"
      @pointerleave="active = null"
      @keydown="onKey"
      @blur="active = null"
    >
      <g aria-hidden="true">
        <g v-for="tick in ticks" :key="tick">
          <line
            :x1="PAD.left"
            :x2="width - PAD.right"
            :y1="y(tick)"
            :y2="y(tick)"
            class="grid"
            :class="{ base: tick === domain.lo }"
          />
          <text :x="width - PAD.right + 6" :y="y(tick) + 4" class="tick">{{ money(tick) }}</text>
        </g>
        <text :x="PAD.left" :y="HEIGHT - 4" class="tick">{{ date(points[0]!.date, 'day') }}</text>
        <text :x="width - PAD.right" :y="HEIGHT - 4" class="tick" text-anchor="end">
          {{ t('tracked.today') }}
        </text>
        <path :d="path" class="line" />
        <line
          v-if="activePoint"
          :x1="x(activePoint.index)"
          :x2="x(activePoint.index)"
          :y1="PAD.top"
          :y2="HEIGHT - PAD.bottom"
          class="crosshair"
        />
        <circle
          v-if="activePoint"
          :cx="x(activePoint.index)"
          :cy="y(activePoint.total)"
          r="4"
          class="dot"
        />
        <circle v-if="last" :cx="x(last.index)" :cy="y(last.total)" r="5" class="dot end" />
      </g>
    </svg>
    <figcaption class="sr-only">{{ label }}</figcaption>
    <details class="table-view">
      <summary>{{ t('graph.showTable') }}</summary>
      <div class="table-wrap">
        <table class="acme-table">
          <tbody>
            <tr v-for="point in points" :key="point.date">
              <td>{{ date(point.date, 'long') }}</td>
              <td class="acme-table__num">
                {{ point.total === null ? t('dates.noFlights') : money(point.total) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>
</template>

<style scoped>
.history {
  margin: 0;
  display: grid;
  gap: var(--acme-space-2);
  min-width: 0;
}

.readout {
  margin: 0;
  font-size: var(--acme-text-sm);
}

svg {
  display: block;
  max-inline-size: 100%;
  overflow: visible;
  touch-action: pan-y;
}

.grid {
  stroke: var(--acme-color-border);
  stroke-width: 1;
}

.grid.base {
  stroke: var(--acme-color-border-strong);
}

.tick {
  font: 400 11px var(--acme-font-sans);
  fill: var(--acme-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.line {
  fill: none;
  stroke: var(--acme-color-data);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.crosshair {
  stroke: var(--acme-color-border-strong);
  stroke-width: 1;
}

.dot {
  fill: var(--acme-color-data);
  stroke: var(--acme-color-surface-raised);
  stroke-width: 2;
}

.dot.end {
  fill: var(--acme-color-data-highlight);
}

.table-view summary {
  cursor: pointer;
  font-size: var(--acme-text-sm);
  color: var(--acme-color-link);
}

.table-view .table-wrap {
  max-block-size: 220px;
  overflow: auto;
  margin-top: var(--acme-space-2);
}
</style>
