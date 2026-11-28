<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { toQuery } from '@/lib/flightSearch'
import { useI18n } from '@/i18n'
import StatusIcon from '@/components/common/StatusIcon.vue'
import type { Deal } from '@/lib/deals'

/** A catalog destination with its cheapest round trip from the chosen airport. */
const props = defineProps<{
  deal: Deal
}>()

const store = useDestinationsStore()
const { t, plural, money, date, duration, region } = useI18n()

const stops = computed(() =>
  props.deal.outbound.stops === 0
    ? t('flights.nonstop')
    : plural('flights.stops', props.deal.outbound.stops),
)
const flightsRoute = computed(() => ({ path: '/flights', query: toQuery(props.deal.search) }))
</script>

<template>
  <article class="mod-card mod-card--interactive deal-card">
    <div class="mod-card__body body">
      <div class="head">
        <div>
          <h3 class="mod-card__title">{{ deal.destination.name }}</h3>
          <p class="where">{{ deal.destination.country }} · {{ region(deal.destination.region) }}</p>
        </div>
        <span v-if="store.inSeason(deal.destination)" class="mod-badge mod-badge--success">
          <StatusIcon variant="success" :size="12" />
          {{ t('common.inSeasonNow') }}
        </span>
      </div>

      <p class="price">
        <span class="amount">{{ money(deal.total) }}</span>
        <span class="note">{{ t('flights.roundTrip') }}</span>
      </p>
      <p class="facts num">
        {{ date(deal.search.depart) }} – {{ date(deal.search.return!) }}
      </p>
      <p class="facts">{{ stops }} · {{ duration(deal.outbound.durationMin) }}</p>
    </div>

    <div class="mod-card__footer actions">
      <RouterLink class="mod-btn mod-btn--secondary mod-btn--sm" :to="flightsRoute">
        {{ t('deals.viewFlights') }}
        <span class="mod-visually-hidden">{{ t('deals.toPlace', { name: deal.destination.name }) }}</span>
      </RouterLink>
      <RouterLink class="guide-link" :to="`/destinations/${deal.destination.slug}`">
        {{ t('deals.guide') }}
        <span class="mod-visually-hidden">{{ t('deals.toPlace', { name: deal.destination.name }) }}</span>
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.body {
  display: grid;
  gap: var(--mod-space-1);
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--mod-space-3);
  margin-bottom: var(--mod-space-2);
}

.where {
  margin: 0;
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
}

.price {
  display: flex;
  align-items: baseline;
  gap: var(--mod-space-2);
  margin: 0;
}

.amount {
  font-size: var(--mod-size-heading-2);
  font-weight: 700;
  letter-spacing: var(--mod-tracking-heading-2);
}

.note {
  font-size: var(--mod-size-label);
  color: var(--mod-ink-2);
}

.facts {
  margin: 0;
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
}

.actions {
  justify-content: space-between;
}

.guide-link {
  font-size: var(--mod-size-small);
  font-weight: 600;
}
</style>
