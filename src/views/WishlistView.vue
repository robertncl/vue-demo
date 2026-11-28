<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'
import StatusIcon from '@/components/common/StatusIcon.vue'
import type { Destination, MonthKey } from '@/types/travel'

const store = useDestinationsStore()
const { t, money, month, region, tag } = useI18n()

const inSeasonCount = computed(
  () => store.catalog.filter((destination) => store.inSeason(destination)).length,
)

function monthsOf(months: MonthKey[]) {
  return months.map((m) => month(m, true)).join(', ')
}

/** Hands the planner a pre-filled week at this destination. */
function planRoute(destination: Destination) {
  return {
    path: '/trips',
    query: {
      destination: `${destination.name}, ${destination.country}`,
      budget: String(destination.dailyBudget * 7),
    },
  }
}
</script>

<template>
  <main class="page shortlist">
    <header class="head">
      <p class="kicker">{{ t('wishlist.eyebrow') }}</p>
      <h1>{{ t('wishlist.title') }}</h1>
      <p class="sub">{{ t('wishlist.subtitle') }}</p>
    </header>

    <div v-if="store.wishlistDestinations.length" class="mod-card table-card">
      <div class="table-wrap">
        <table class="mod-table">
          <thead>
            <tr>
              <th scope="col">{{ t('destinations.colDestination') }}</th>
              <th scope="col">{{ t('destinations.colVibes') }}</th>
              <th scope="col">{{ t('destinations.colMonths') }}</th>
              <th scope="col" class="mod-table__num">{{ t('destinations.colDay') }}</th>
              <th scope="col" class="mod-table__num">{{ t('destinations.colWeek') }}</th>
              <th scope="col">
                <span class="mod-visually-hidden">{{ t('common.actions') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in store.wishlistDestinations" :key="d.slug" class="saved-row">
              <td>
                <RouterLink class="row-name" :to="`/destinations/${d.slug}`">
                  {{ d.name }}
                </RouterLink>
                <span class="row-sub">{{ d.country }} · {{ region(d.region) }}</span>
              </td>
              <td>{{ d.tags.map(tag).join(', ') }}</td>
              <td>
                {{ monthsOf(d.bestMonths) }}
                <span v-if="store.inSeason(d)" class="mod-badge mod-badge--success now">
                  <StatusIcon variant="success" :size="12" />
                  {{ t('common.now') }}
                </span>
              </td>
              <td class="mod-table__num price">{{ money(d.dailyBudget) }}</td>
              <td class="mod-table__num">{{ money(d.dailyBudget * 7) }}</td>
              <td class="row-actions">
                <RouterLink class="mod-btn mod-btn--secondary mod-btn--sm" :to="planRoute(d)">
                  {{ t('wishlist.startTrip') }}
                </RouterLink>
                <button
                  class="mod-btn mod-btn--ghost mod-btn--sm wish"
                  type="button"
                  :aria-label="t('card.removeAria', { name: d.name })"
                  @click="store.toggleWishlist(d.slug)"
                >
                  {{ t('common.remove') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="mod-card empty-state">
      <h2>{{ t('wishlist.emptyTitle') }}</h2>
      <p class="muted">
        {{ t('wishlist.emptyBody', { count: store.catalog.length, inSeason: inSeasonCount }) }}
      </p>
      <RouterLink class="mod-btn mod-btn--primary" to="/destinations">
        {{ t('wishlist.cta') }}
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.head {
  margin-bottom: var(--mod-space-4);
}

.head h1 {
  margin: var(--mod-space-2) 0 0;
}

.sub {
  margin: var(--mod-space-2) 0 0;
  color: var(--mod-ink-2);
  max-width: 60ch;
}

.row-name {
  font-weight: 600;
}

.row-sub {
  display: block;
  font-size: var(--mod-size-label);
  color: var(--mod-ink-2);
}

.price {
  font-weight: 600;
}

.now {
  margin-inline-start: var(--mod-space-2);
}

.row-actions {
  text-align: end;
  white-space: nowrap;
}

.row-actions .wish {
  margin-inline-start: var(--mod-space-2);
}

.empty-state h2 {
  margin: 0 0 var(--mod-space-2);
  font-size: var(--mod-size-heading-3);
}

.empty-state p {
  margin: 0 0 var(--mod-space-4);
}
</style>
