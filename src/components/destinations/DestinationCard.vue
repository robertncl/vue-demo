<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n'
import DestinationMedia from './DestinationMedia.vue'
import type { Destination } from '@/types/travel'

const props = defineProps<{
  destination: Destination
  wishlisted?: boolean
  /** Marks the card as being in its best season right now. */
  inSeason?: boolean
}>()

const emit = defineEmits<{
  toggleWishlist: [slug: string]
}>()

const { t, money, month, region, tag } = useI18n()

const bestMonths = computed(() =>
  props.destination.bestMonths.map((m) => month(m, true)).join(', '),
)
</script>

<template>
  <article class="acme-card acme-card--interactive destination-card">
    <div class="media-wrap">
      <DestinationMedia :label="t('media.photoOf', { name: destination.name })" />
      <div class="flags">
        <span class="acme-badge flag region">{{ region(destination.region) }}</span>
        <span v-if="inSeason" class="acme-badge flag season">{{ t('common.inSeason') }}</span>
      </div>
    </div>

    <div class="acme-card__body body">
      <div class="head">
        <div>
          <h3 class="acme-card__title">{{ destination.name }}</h3>
          <p class="country">{{ destination.country }}</p>
        </div>
        <button
          class="acme-btn acme-btn--ghost acme-btn--sm wish"
          type="button"
          :class="{ on: wishlisted }"
          :aria-pressed="Boolean(wishlisted)"
          :aria-label="
            wishlisted
              ? t('card.removeAria', { name: destination.name })
              : t('card.saveAria', { name: destination.name })
          "
          @click="emit('toggleWishlist', destination.slug)"
        >
          {{ wishlisted ? t('card.saved') : t('card.save') }}
        </button>
      </div>

      <p class="tagline">{{ destination.tagline }}</p>

      <ul class="tags">
        <li v-for="item in destination.tags" :key="item" class="acme-badge">{{ tag(item) }}</li>
      </ul>
    </div>

    <div class="acme-card__footer footer">
      <div>
        <p class="price num">
          {{ money(destination.dailyBudget) }}<span class="per">{{ t('common.aDay') }}</span>
        </p>
        <p class="months">{{ t('common.best') }} {{ bestMonths }}</p>
      </div>
      <RouterLink
        class="acme-btn acme-btn--secondary acme-btn--sm"
        :to="`/destinations/${destination.slug}`"
      >
        {{ t('card.readGuide') }}
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.destination-card {
  height: 100%;
}

.media-wrap {
  position: relative;
}

.flags {
  position: absolute;
  top: var(--acme-space-3);
  left: var(--acme-space-3);
  display: flex;
  gap: var(--acme-space-2);
  pointer-events: none;
}

.flag {
  background: var(--acme-color-surface-raised);
  border: 1px solid var(--acme-color-border);
}

.season {
  background: var(--acme-color-selected-soft);
  color: var(--acme-color-accent);
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-2);
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--acme-space-3);
}

.acme-card__title {
  margin: 0;
}

.country,
.tagline,
.months,
.price {
  margin: 0;
}

.country {
  font-size: var(--acme-text-sm);
  color: var(--acme-color-text-muted);
}

.tagline {
  font-size: var(--acme-text-sm);
  text-wrap: pretty;
}

.wish.on {
  color: var(--acme-color-accent);
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--acme-space-2);
  margin-top: var(--acme-space-1);
  list-style: none;
  padding: 0;
}

.footer {
  justify-content: space-between;
}

.price {
  font-size: var(--acme-text-lg);
  font-weight: 600;
}

.per {
  font-size: var(--acme-text-sm);
  font-weight: 400;
  color: var(--acme-color-text-muted);
}

.months {
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
}
</style>
