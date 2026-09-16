<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Destination } from '@/types/travel'

const props = defineProps<{
  destination: Destination
  wishlisted?: boolean
}>()

const emit = defineEmits<{
  toggleWishlist: [slug: string]
}>()

const banner = computed(
  () =>
    `linear-gradient(135deg, ${props.destination.gradient[0]}, ${props.destination.gradient[1]})`,
)
</script>

<template>
  <article class="destination-card card">
    <RouterLink
      :to="`/destinations/${destination.slug}`"
      class="banner"
      :style="{ background: banner }"
    >
      <span class="emoji" aria-hidden="true">{{ destination.emoji }}</span>
      <span class="region">{{ destination.region }}</span>
    </RouterLink>

    <div class="body">
      <header>
        <h3>
          <RouterLink :to="`/destinations/${destination.slug}`">{{ destination.name }}</RouterLink>
        </h3>
        <button
          class="wish"
          type="button"
          :class="{ on: wishlisted }"
          :aria-pressed="Boolean(wishlisted)"
          :aria-label="`${wishlisted ? 'Remove' : 'Save'} ${destination.name} ${wishlisted ? 'from' : 'to'} wishlist`"
          @click="emit('toggleWishlist', destination.slug)"
        >
          {{ wishlisted ? '★' : '☆' }}
        </button>
      </header>

      <p class="country muted">{{ destination.country }}</p>
      <p class="tagline">{{ destination.tagline }}</p>

      <ul class="tags">
        <li v-for="tag in destination.tags" :key="tag" class="chip">{{ tag }}</li>
      </ul>

      <footer>
        <span class="price">${{ destination.dailyBudget }}<small>/day</small></span>
        <span class="months muted">Best: {{ destination.bestMonths.join(', ') }}</span>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.destination-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.destination-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 130px;
}

.emoji {
  font-size: 2.75rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
}

.region {
  position: absolute;
  top: 0.6rem;
  left: 0.7rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #1b1d21;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem 1.1rem 1.15rem;
  flex: 1;
}

.body header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.5rem;
}

.body h3 a {
  color: var(--c-heading);
}

.country {
  font-size: 0.85rem;
  margin-top: -0.35rem;
}

.tagline {
  font-size: 0.925rem;
}

.wish {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--c-muted);
}

.wish.on {
  color: var(--c-accent);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  list-style: none;
  margin-top: 0.2rem;
}

.body footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
  flex-wrap: wrap;
}

.price {
  font-weight: 700;
  color: var(--c-heading);
}

.price small {
  font-weight: 500;
  color: var(--c-muted);
}

.months {
  font-size: 0.78rem;
}
</style>
