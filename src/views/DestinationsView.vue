<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'
import DestinationCard from '@/components/destinations/DestinationCard.vue'
import StatusIcon from '@/components/common/StatusIcon.vue'
import type { MonthKey } from '@/types/travel'

const store = useDestinationsStore()
const { t, money, month, region, tag } = useI18n()

/** Cards or the side-by-side compare table. View state only — nothing persists. */
const layout = ref<'cards' | 'table'>('cards')

function monthsOf(months: MonthKey[]) {
  return months.map((m) => month(m, true)).join(', ')
}
</script>

<template>
  <main class="page catalog">
    <header class="head">
      <div>
        <p class="kicker">{{ t('destinations.eyebrow') }}</p>
        <h1>{{ t('destinations.title') }}</h1>
        <p class="sub">
          {{
            t('destinations.resultCount', {
              count: store.filtered.length,
              total: store.catalog.length,
            })
          }}. {{ t('destinations.sortNote') }}
        </p>
      </div>

      <div class="mod-tabs" role="tablist" :aria-label="t('destinations.layoutLabel')">
        <button
          class="mod-tab"
          type="button"
          role="tab"
          :aria-selected="layout === 'cards'"
          @click="layout = 'cards'"
        >
          {{ t('destinations.cards') }}
        </button>
        <button
          class="mod-tab"
          type="button"
          role="tab"
          :aria-selected="layout === 'table'"
          @click="layout = 'table'"
        >
          {{ t('destinations.compare') }}
        </button>
      </div>
    </header>

    <div class="layout">
      <aside class="mod-card filters" :aria-label="t('destinations.filtersLabel')">
        <div class="filters-head">
          <h2>{{ t('destinations.filters') }}</h2>
          <button
            v-if="store.hasActiveFilters"
            class="mod-btn mod-btn--ghost mod-btn--sm"
            type="button"
            @click="store.resetFilters()"
          >
            {{ t('common.reset') }}
          </button>
        </div>

        <div class="mod-field">
          <label class="mod-label" for="f-query">{{ t('destinations.search') }}</label>
          <input
            id="f-query"
            v-model="store.query"
            class="mod-input"
            type="search"
            :placeholder="t('destinations.searchPlaceholder')"
          />
        </div>

        <div class="mod-field">
          <label class="mod-label" for="f-region">{{ t('destinations.region') }}</label>
          <select id="f-region" v-model="store.region" class="mod-input">
            <option value="all">{{ t('destinations.allRegions') }}</option>
            <option v-for="item in store.regions" :key="item" :value="item">
              {{ region(item) }}
            </option>
          </select>
        </div>

        <div class="mod-field">
          <label class="mod-label" for="f-tag">{{ t('destinations.vibe') }}</label>
          <select id="f-tag" v-model="store.tag" class="mod-input">
            <option value="all">{{ t('destinations.anyVibe') }}</option>
            <option v-for="item in store.allTags" :key="item" :value="item">{{ tag(item) }}</option>
          </select>
        </div>

        <div class="mod-field">
          <label class="mod-label" for="f-budget">
            {{ t('destinations.maxBudget', { amount: money(store.maxDailyBudget) }) }}
          </label>
          <input
            id="f-budget"
            v-model.number="store.maxDailyBudget"
            type="range"
            min="50"
            max="250"
            step="5"
          />
        </div>

        <label class="mod-switch">
          <input v-model="store.inSeasonOnly" type="checkbox" />
          {{ t('destinations.inSeasonOnly') }}
        </label>
      </aside>

      <div class="results">
        <div v-if="store.filtered.length && layout === 'cards'" class="card-grid">
          <DestinationCard
            v-for="destination in store.filtered"
            :key="destination.slug"
            :destination="destination"
            :wishlisted="store.isWishlisted(destination.slug)"
            :in-season="store.inSeason(destination)"
            @toggle-wishlist="store.toggleWishlist"
          />
        </div>

        <div v-else-if="store.filtered.length" class="mod-card table-card">
          <div class="table-wrap">
            <table class="mod-table compare">
              <thead>
                <tr>
                  <th scope="col">{{ t('destinations.colDestination') }}</th>
                  <th scope="col">{{ t('destinations.region') }}</th>
                  <th scope="col">{{ t('destinations.colVibes') }}</th>
                  <th scope="col">{{ t('destinations.colMonths') }}</th>
                  <th scope="col" class="mod-table__num" aria-sort="ascending">
                    <span class="sorted">
                      {{ t('destinations.colDay') }}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </span>
                  </th>
                  <th scope="col" class="mod-table__num">{{ t('destinations.colSaved') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in store.filtered" :key="d.slug">
                  <td>
                    <RouterLink class="row-name" :to="`/destinations/${d.slug}`">
                      {{ d.name }}
                    </RouterLink>
                    <span class="row-sub">{{ d.country }} · {{ d.tagline }}</span>
                  </td>
                  <td>{{ region(d.region) }}</td>
                  <td>{{ d.tags.map(tag).join(', ') }}</td>
                  <td>
                    {{ monthsOf(d.bestMonths) }}
                    <span v-if="store.inSeason(d)" class="mod-badge mod-badge--success now">
                      <StatusIcon variant="success" :size="12" />
                      {{ t('common.now') }}
                    </span>
                  </td>
                  <td class="mod-table__num price">{{ money(d.dailyBudget) }}</td>
                  <td class="mod-table__num">
                    <button
                      class="mod-btn mod-btn--ghost mod-btn--sm wish"
                      type="button"
                      :class="{ on: store.isWishlisted(d.slug) }"
                      :aria-pressed="store.isWishlisted(d.slug)"
                      @click="store.toggleWishlist(d.slug)"
                    >
                      {{ store.isWishlisted(d.slug) ? t('card.saved') : t('card.save') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="mod-card empty-state">
          <h2>{{ t('destinations.emptyTitle') }}</h2>
          <p class="muted">
            {{ t('destinations.emptyBody', { count: store.catalog.length }) }}
          </p>
          <button class="mod-btn mod-btn--primary" type="button" @click="store.resetFilters()">
            {{ t('destinations.resetFilters') }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--mod-space-4);
  flex-wrap: wrap;
  margin-bottom: var(--mod-space-4);
}

.head h1 {
  margin: var(--mod-space-2) 0 0;
}

.sub {
  margin: var(--mod-space-2) 0 0;
  color: var(--mod-ink-2);
  max-width: 56ch;
}

.mod-tabs {
  align-self: center;
}

.layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: var(--mod-space-5);
  align-items: start;
}

.filters {
  padding: var(--mod-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-4);
  position: sticky;
  /* Clears the sticky top bar. */
  top: var(--mod-space-8);
}

.filters-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.filters-head h2 {
  margin: 0;
  font-size: var(--mod-size-heading-3);
}

.empty-state h2 {
  margin: 0 0 var(--mod-space-2);
  font-size: var(--mod-size-heading-3);
}

.empty-state p {
  margin: 0 0 var(--mod-space-4);
}

.compare .row-name {
  font-weight: 600;
}

.compare .row-sub {
  display: block;
  color: var(--mod-ink-2);
  font-size: var(--mod-size-label);
}

.compare .price {
  font-weight: 600;
}

.sorted {
  display: inline-flex;
  align-items: center;
  gap: var(--mod-space-1);
}

.now {
  margin-inline-start: var(--mod-space-2);
}

.wish.on {
  color: var(--mod-ink);
  font-weight: 600;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .filters {
    position: static;
  }
}
</style>
