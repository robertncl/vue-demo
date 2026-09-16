<script setup lang="ts">
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'
import DestinationCard from '@/components/destinations/DestinationCard.vue'

const store = useDestinationsStore()
const { t, money, region, tag } = useI18n()
</script>

<template>
  <main class="page">
    <div class="container">
      <header class="page-head">
        <p class="eyebrow">{{ t('destinations.eyebrow') }}</p>
        <h1>{{ t('destinations.title') }}</h1>
        <p>{{ t('destinations.subtitle') }}</p>
      </header>

      <section class="filters card" :aria-label="t('destinations.filtersLabel')">
        <div class="field">
          <label for="f-query">{{ t('destinations.search') }}</label>
          <input
            id="f-query"
            v-model="store.query"
            type="search"
            :placeholder="t('destinations.searchPlaceholder')"
          />
        </div>

        <div class="field">
          <label for="f-region">{{ t('destinations.region') }}</label>
          <select id="f-region" v-model="store.region">
            <option value="all">{{ t('destinations.allRegions') }}</option>
            <option v-for="item in store.regions" :key="item" :value="item">
              {{ region(item) }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="f-tag">{{ t('destinations.vibe') }}</label>
          <select id="f-tag" v-model="store.tag">
            <option value="all">{{ t('destinations.anyVibe') }}</option>
            <option v-for="item in store.allTags" :key="item" :value="item">{{ tag(item) }}</option>
          </select>
        </div>

        <div class="field">
          <label for="f-budget">
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

        <button
          v-if="store.hasActiveFilters"
          class="btn btn-ghost btn-sm"
          type="button"
          @click="store.resetFilters()"
        >
          {{ t('common.reset') }}
        </button>
      </section>

      <p class="result-count muted">
        {{
          t('destinations.resultCount', {
            count: store.filtered.length,
            total: store.catalog.length,
          })
        }}
      </p>

      <div v-if="store.filtered.length" class="grid">
        <DestinationCard
          v-for="destination in store.filtered"
          :key="destination.slug"
          :destination="destination"
          :wishlisted="store.isWishlisted(destination.slug)"
          :in-season="store.inSeason(destination)"
          @toggle-wishlist="store.toggleWishlist"
        />
      </div>

      <div v-else class="empty card">
        <h2>{{ t('destinations.emptyTitle') }}</h2>
        <p class="muted">{{ t('destinations.emptyBody') }}</p>
        <button class="btn" type="button" @click="store.resetFilters()">
          {{ t('destinations.resetFilters') }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.2fr auto;
  gap: 1rem;
  align-items: end;
  padding: 1.15rem 1.25rem;
  margin-bottom: 1.25rem;
}

.result-count {
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.empty {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

@media (max-width: 860px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
