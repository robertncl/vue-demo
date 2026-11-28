<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n'
import DestinationMedia from './DestinationMedia.vue'
import StatusIcon from '@/components/common/StatusIcon.vue'
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
  <article class="mod-card mod-card--interactive destination-card">
    <div class="media-wrap">
      <DestinationMedia :label="t('media.photoOf', { name: destination.name })" />
      <div class="flags">
        <span class="mod-badge flag region">{{ region(destination.region) }}</span>
        <span v-if="inSeason" class="mod-badge mod-badge--success season">
          <StatusIcon variant="success" :size="12" />
          {{ t('common.inSeasonNow') }}
        </span>
      </div>
    </div>

    <div class="mod-card__body body">
      <div class="head">
        <div>
          <h3 class="mod-card__title">{{ destination.name }}</h3>
          <p class="country">{{ destination.country }}</p>
        </div>
        <button
          class="mod-btn mod-btn--ghost mod-btn--sm wish"
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
        <li v-for="item in destination.tags" :key="item" class="mod-badge">{{ tag(item) }}</li>
      </ul>
    </div>

    <div class="mod-card__footer footer">
      <div>
        <p class="price num">
          {{ money(destination.dailyBudget) }}<span class="per">{{ t('common.aDay') }}</span>
        </p>
        <p class="months">{{ t('common.best') }} {{ bestMonths }}</p>
      </div>
      <RouterLink
        class="mod-btn mod-btn--secondary mod-btn--sm"
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
  inset-block-start: var(--mod-space-3);
  inset-inline-start: var(--mod-space-3);
  display: flex;
  gap: var(--mod-space-2);
  pointer-events: none;
}

.flag {
  background: var(--mod-paper);
  border: 1px solid var(--mod-rule);
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-2);
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--mod-space-3);
}

.mod-card__title {
  margin: 0;
}

.country,
.tagline,
.months,
.price {
  margin: 0;
}

.country {
  font-size: var(--mod-size-small);
  color: var(--mod-ink-2);
}

.tagline {
  font-size: var(--mod-size-small);
  text-wrap: pretty;
}

.wish.on {
  color: var(--mod-ink);
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mod-space-2);
  margin-top: var(--mod-space-1);
  list-style: none;
  padding: 0;
}

.footer {
  justify-content: space-between;
}

.price {
  font-size: var(--mod-size-heading-3);
  font-weight: 600;
}

.per {
  font-size: var(--mod-size-small);
  font-weight: 400;
  color: var(--mod-ink-2);
}

.months {
  font-size: var(--mod-size-label);
  color: var(--mod-ink-2);
}
</style>
