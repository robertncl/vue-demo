<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Destination } from '@/types/travel'
import { useCurrencyStore } from '@/stores/currency'
import { usePlannerStore } from '@/stores/planner'
import { isInSeason } from '@/composables/useSeason'
import DestinationPhoto from './DestinationPhoto.vue'

const props = defineProps<{ destination: Destination }>()

const router = useRouter()
const currency = useCurrencyStore()
const planner = usePlannerStore()

const saved = computed(() => planner.isSaved(props.destination.slug))
const inSeason = computed(() => isInSeason(props.destination))
const price = computed(() => currency.money(props.destination.dailyBudget))

function open() {
  router.push({ name: 'destination', params: { slug: props.destination.slug } })
}

function toggleWish(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  planner.toggleWish(props.destination.slug)
}
</script>

<template>
  <article class="acme-card acme-card--interactive" style="height: 100%">
    <div class="acme-card__media" style="position: relative; padding: 0">
      <DestinationPhoto
        :gradient="destination.gradient"
        :emoji="destination.emoji"
        :label="`Photo of ${destination.name}`"
      />
      <div
        style="
          position: absolute;
          top: var(--acme-space-3);
          left: var(--acme-space-3);
          display: flex;
          gap: var(--acme-space-2);
          pointer-events: none;
        "
      >
        <span
          class="acme-badge"
          style="
            background: var(--acme-color-surface-raised);
            border: 1px solid var(--acme-color-border);
          "
          >{{ destination.region }}</span
        >
        <span
          v-if="inSeason"
          class="acme-badge"
          style="
            background: var(--acme-color-selected-soft);
            color: var(--acme-color-accent);
            border: 1px solid var(--acme-color-border);
          "
          >In season now</span
        >
      </div>
    </div>

    <div
      class="acme-card__body"
      style="display: flex; flex-direction: column; gap: var(--acme-space-2)"
    >
      <div
        style="
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--acme-space-3);
        "
      >
        <div>
          <h3
            class="acme-card__title"
            style="font-family: var(--acme-font-display); font-weight: 700; margin: 0"
          >
            {{ destination.name }}
          </h3>
          <p style="margin: 0; font-size: var(--acme-text-sm); color: var(--acme-color-text-muted)">
            {{ destination.country }}
          </p>
        </div>
        <button
          type="button"
          class="acme-btn acme-btn--ghost acme-btn--sm"
          :aria-pressed="saved"
          :style="saved ? { color: 'var(--acme-color-accent)', fontWeight: 600 } : {}"
          @click="toggleWish"
        >
          {{ saved ? 'Saved' : 'Save' }}
        </button>
      </div>

      <p
        style="
          margin: 0;
          font-size: var(--acme-text-sm);
          color: var(--acme-color-text);
          text-wrap: pretty;
        "
      >
        {{ destination.tagline }}
      </p>

      <div
        style="
          display: flex;
          flex-wrap: wrap;
          gap: var(--acme-space-2);
          margin-top: var(--acme-space-1);
        "
      >
        <span v-for="tag in destination.tags" :key="tag" class="acme-badge">{{ tag }}</span>
      </div>
    </div>

    <div
      class="acme-card__footer"
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--acme-space-3);
      "
    >
      <div>
        <p
          style="
            margin: 0;
            font-size: var(--acme-text-lg);
            font-weight: 600;
            font-variant-numeric: tabular-nums;
          "
        >
          {{ price
          }}<span
            style="
              font-size: var(--acme-text-sm);
              font-weight: 400;
              color: var(--acme-color-text-muted);
            "
          >
            a day</span
          >
        </p>
        <p style="margin: 0; font-size: var(--acme-text-xs); color: var(--acme-color-text-muted)">
          Best {{ destination.bestMonths.join(', ') }}
        </p>
      </div>
      <button type="button" class="acme-btn acme-btn--secondary acme-btn--sm" @click="open">
        Read the guide
      </button>
    </div>
  </article>
</template>
