<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'
import DestinationCard from '@/components/destinations/DestinationCard.vue'

const store = useDestinationsStore()
const { t } = useI18n()
</script>

<template>
  <main class="page">
    <div class="container">
      <header class="page-head">
        <p class="eyebrow">{{ t('wishlist.eyebrow') }}</p>
        <h1>{{ t('wishlist.title') }}</h1>
        <p>{{ t('wishlist.subtitle') }}</p>
      </header>

      <div v-if="store.wishlistDestinations.length" class="grid">
        <DestinationCard
          v-for="destination in store.wishlistDestinations"
          :key="destination.slug"
          :destination="destination"
          wishlisted
          :in-season="store.inSeason(destination)"
          @toggle-wishlist="store.toggleWishlist"
        />
      </div>

      <div v-else class="empty card">
        <span class="mark" aria-hidden="true">☆</span>
        <h2>{{ t('wishlist.emptyTitle') }}</h2>
        <p class="muted">{{ t('wishlist.emptyBody') }}</p>
        <RouterLink class="btn" to="/destinations">{{ t('wishlist.cta') }}</RouterLink>
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
