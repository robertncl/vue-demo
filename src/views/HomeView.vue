<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'
import DestinationCard from '@/components/destinations/DestinationCard.vue'
import TopPick from '@/components/destinations/TopPick.vue'

const router = useRouter()
const store = useDestinationsStore()
const { t, month } = useI18n()
const search = ref('')

const monthName = computed(() => month(store.currentMonth))

const inSeasonCount = computed(
  () => store.catalog.filter((destination) => store.inSeason(destination)).length,
)

/** Says how the month's ranking was made — or that nothing peaks right now. */
const subtitle = computed(() =>
  store.hasSeasonalPick ? t('home.rankedNote') : t('home.noSeasonNote', { month: monthName.value }),
)

function submitSearch() {
  store.query = search.value
  router.push('/destinations')
}
</script>

<template>
  <main class="page page--roomy home">
    <section class="intro">
      <div class="lede-block">
        <p class="kicker">
          {{ monthName }} ·
          {{ t('home.catalogSummary', { count: store.catalog.length, inSeason: inSeasonCount }) }}
        </p>
        <h1>{{ t('home.title') }}</h1>
        <p class="lede">{{ subtitle }} {{ t('home.priceNote') }}</p>
      </div>

      <form class="search" role="search" @submit.prevent="submitSearch">
        <label class="sr-only" for="hero-search">{{ t('home.searchLabel') }}</label>
        <input
          id="hero-search"
          v-model="search"
          class="acme-input"
          type="search"
          :placeholder="t('home.searchPlaceholder')"
        />
        <button class="acme-btn acme-btn--primary" type="submit">{{ t('home.search') }}</button>
      </form>

      <TopPick />
    </section>

    <section class="block">
      <div class="section-head">
        <h2>{{ t('home.featured') }}</h2>
        <RouterLink to="/destinations">
          {{ t('home.browseAll', { count: store.catalog.length }) }}
        </RouterLink>
      </div>
      <div class="card-grid">
        <DestinationCard
          v-for="destination in store.featured"
          :key="destination.slug"
          :destination="destination"
          :wishlisted="store.isWishlisted(destination.slug)"
          :in-season="store.inSeason(destination)"
          @toggle-wishlist="store.toggleWishlist"
        />
      </div>
    </section>

    <section class="block block--ruled">
      <h2>{{ t('home.howTitle') }}</h2>
      <ol class="steps">
        <li v-for="step in [1, 2, 3]" :key="step">
          <p class="numeral" aria-hidden="true">{{ step }}</p>
          <h3>{{ t(`home.step${step}Title`) }}</h3>
          <p class="muted">{{ t(`home.step${step}Body`) }}</p>
        </li>
      </ol>
    </section>
  </main>
</template>

<style scoped>
.intro {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-6);
}

.lede-block {
  max-width: 60ch;
}

.lede-block h1 {
  margin: var(--acme-space-2) 0 0;
  font-size: var(--acme-text-5xl);
}

.lede {
  margin: var(--acme-space-3) 0 0;
  font-size: var(--acme-text-lg);
  color: var(--acme-color-text-muted);
  text-wrap: pretty;
}

.search {
  display: flex;
  gap: var(--acme-space-2);
  max-width: 520px;
}

.search input {
  flex: 1;
}

.block {
  margin-top: var(--acme-space-16);
}

.block--ruled {
  border-top: 1px solid var(--acme-color-border);
  padding-top: var(--acme-space-8);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--acme-space-4);
  margin-bottom: var(--acme-space-5);
}

.section-head h2,
.block h2 {
  margin: 0;
  font-size: var(--acme-text-2xl);
}

.block--ruled h2 {
  margin-bottom: var(--acme-space-5);
}

.section-head a {
  font-size: var(--acme-text-sm);
  font-weight: 600;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--acme-space-6);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.steps .numeral {
  margin: 0;
  font-size: var(--acme-text-4xl);
}

.steps h3 {
  margin: var(--acme-space-2) 0 var(--acme-space-1);
  font-size: var(--acme-text-lg);
}

.steps p:last-of-type {
  margin: 0;
  font-size: var(--acme-text-sm);
}
</style>
