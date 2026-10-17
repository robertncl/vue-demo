<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n } from '@/i18n'
import type { PriceInsight } from '@/types/flights'

/**
 * Where today's cheapest price sits against the typical range. A meter, not
 * a chart: a neutral track split into low / typical / high, and one Cobalt
 * marker for the current price, labelled directly.
 */
const props = defineProps<{
  insight: PriceInsight
}>()

const { t, money } = useI18n()
const titleId = `insights-${useId()}`

const scale = computed(() => {
  const { low, high, current } = props.insight
  const min = Math.min(low * 0.85, current * 0.95)
  const max = Math.max(high * 1.15, current * 1.05)
  return { min, max }
})

function position(value: number) {
  const { min, max } = scale.value
  return ((value - min) / (max - min)) * 100
}

const lowEdge = computed(() => position(props.insight.low))
const highEdge = computed(() => position(props.insight.high))
const marker = computed(() => position(props.insight.current))

const verdict = computed(() => {
  const { level, low, high, current } = props.insight
  if (level === 'low') return t('insights.cheaperBy', { amount: money(low - current) })
  if (level === 'high') return t('insights.dearerBy', { amount: money(current - high) })
  return t('insights.typicalNote')
})
</script>

<template>
  <section class="acme-card price-insights" :aria-labelledby="titleId">
    <div class="acme-card__body body">
      <p class="kicker">{{ t('insights.eyebrow') }}</p>
      <h2 :id="titleId">{{ t(`insights.title_${insight.level}`) }}</h2>
      <p class="muted">
        {{ t('insights.range', { low: money(insight.low), high: money(insight.high) }) }}
        {{ verdict }}
      </p>

      <div
        class="meter"
        role="img"
        :aria-label="
          t('insights.meterLabel', {
            current: money(insight.current),
            low: money(insight.low),
            high: money(insight.high),
          })
        "
      >
        <div class="track">
          <span class="zone" :style="{ inlineSize: `${lowEdge}%` }"></span>
          <span class="zone typical" :style="{ inlineSize: `${highEdge - lowEdge}%` }"></span>
          <span class="zone" :style="{ inlineSize: `${100 - highEdge}%` }"></span>
        </div>
        <span class="marker" :style="{ insetInlineStart: `${marker}%` }">
          <span class="marker-label num">{{ money(insight.current) }}</span>
        </span>
        <div class="zone-labels" aria-hidden="true">
          <span :style="{ inlineSize: `${lowEdge}%` }">{{ t('insights.low') }}</span>
          <span :style="{ inlineSize: `${highEdge - lowEdge}%` }">{{ t('insights.typical') }}</span>
          <span :style="{ inlineSize: `${100 - highEdge}%` }">{{ t('insights.high') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.body {
  display: grid;
  gap: var(--acme-space-2);
}

.body h2 {
  margin: 0;
  font-size: var(--acme-text-xl);
}

.body p {
  margin: 0;
}

.meter {
  position: relative;
  margin-top: var(--acme-space-8);
}

.track {
  display: flex;
  gap: 2px;
  block-size: 8px;
}

.zone {
  border-radius: var(--acme-radius-sm);
  background: var(--acme-color-surface);
}

.zone.typical {
  background: var(--acme-color-border);
}

/* 12px dot with a 2px surface ring so it stays legible over the track. */
.marker {
  position: absolute;
  inset-block-start: -2px;
  translate: -50% 0;
  inline-size: 12px;
  block-size: 12px;
  border-radius: var(--acme-radius-full);
  background: var(--acme-color-data-highlight);
  box-shadow: 0 0 0 2px var(--acme-color-surface-raised);
}

.marker-label {
  position: absolute;
  inset-block-end: calc(100% + 6px);
  inset-inline-start: 50%;
  translate: -50% 0;
  font-size: var(--acme-text-sm);
  font-weight: 600;
  white-space: nowrap;
}

.zone-labels {
  display: flex;
  gap: 2px;
  margin-top: var(--acme-space-2);
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
}

.zone-labels span {
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
