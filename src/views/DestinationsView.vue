<script setup lang="ts">
import { useDestinationsStore } from '@/stores/destinations'
import DestinationCard from '@/components/destinations/DestinationCard.vue'

const store = useDestinationsStore()
</script>

<template>
  <main class="page">
    <div class="container">
      <header class="page-head">
        <p class="eyebrow">Catalog</p>
        <h1>Destinations</h1>
        <p>Narrow it down by region, the kind of trip you want, and what you can spend per day.</p>
      </header>

      <section class="filters card" aria-label="Destination filters">
        <div class="field">
          <label for="f-query">Search</label>
          <input
            id="f-query"
            v-model="store.query"
            type="search"
            placeholder="City, country or tag"
          />
        </div>

        <div class="field">
          <label for="f-region">Region</label>
          <select id="f-region" v-model="store.region">
            <option value="all">All regions</option>
            <option v-for="region in store.regions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="f-tag">Vibe</label>
          <select id="f-tag" v-model="store.tag">
            <option value="all">Any vibe</option>
            <option v-for="tag in store.allTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>

        <div class="field">
          <label for="f-budget">Max ${{ store.maxDailyBudget }} / day</label>
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
          Reset
        </button>
      </section>

      <p class="result-count muted">
        {{ store.filtered.length }} of {{ store.catalog.length }} destinations
      </p>

      <div v-if="store.filtered.length" class="grid">
        <DestinationCard
          v-for="destination in store.filtered"
          :key="destination.slug"
          :destination="destination"
          :wishlisted="store.isWishlisted(destination.slug)"
          @toggle-wishlist="store.toggleWishlist"
        />
      </div>

      <div v-else class="empty card">
        <h2>Nothing matches those filters</h2>
        <p class="muted">Try widening the budget or clearing the search.</p>
        <button class="btn" type="button" @click="store.resetFilters()">Reset filters</button>
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
