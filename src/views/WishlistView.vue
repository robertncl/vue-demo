<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import DestinationCard from '@/components/destinations/DestinationCard.vue'

const store = useDestinationsStore()
</script>

<template>
  <main class="page">
    <div class="container">
      <header class="page-head">
        <p class="eyebrow">Saved</p>
        <h1>Your wishlist</h1>
        <p>
          The places you've starred, kept in this browser. Turn one into a dated trip whenever
          you're ready.
        </p>
      </header>

      <div v-if="store.wishlistDestinations.length" class="grid">
        <DestinationCard
          v-for="destination in store.wishlistDestinations"
          :key="destination.slug"
          :destination="destination"
          wishlisted
          @toggle-wishlist="store.toggleWishlist"
        />
      </div>

      <div v-else class="empty card">
        <span class="mark" aria-hidden="true">☆</span>
        <h2>No saved destinations yet</h2>
        <p class="muted">Star a destination and it will show up here.</p>
        <RouterLink class="btn" to="/destinations">Browse destinations</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.empty {
  padding: 3.5rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.mark {
  font-size: 2.5rem;
  color: var(--c-muted);
}
</style>
