<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useTravelStore } from '@/stores/travel'
import { useI18n } from '@/i18n'
import DestinationCard from '@/components/destinations/DestinationCard.vue'
import TopPick from '@/components/destinations/TopPick.vue'

const router = useRouter()
const destinationsStore = useDestinationsStore()
const travel = useTravelStore()
const { t, money } = useI18n()
const search = ref('')

function submitSearch() {
  destinationsStore.query = search.value
  router.push('/destinations')
}
</script>

<template>
  <main class="page home">
    <section class="hero">
      <div class="container hero-inner">
        <p class="eyebrow">{{ t('home.eyebrow') }}</p>
        <h1>{{ t('home.title') }}</h1>
        <p class="lede">{{ t('home.lede') }}</p>

        <form class="search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="hero-search">{{ t('home.searchLabel') }}</label>
          <input
            id="hero-search"
            v-model="search"
            type="search"
            :placeholder="t('home.searchPlaceholder')"
          />
          <button class="btn" type="submit">{{ t('home.search') }}</button>
        </form>

        <dl class="stats">
          <div>
            <dt>{{ t('home.statDestinations') }}</dt>
            <dd>{{ destinationsStore.catalog.length }}</dd>
          </div>
          <div>
            <dt>{{ t('home.statSaved') }}</dt>
            <dd>{{ destinationsStore.wishlist.length }}</dd>
          </div>
          <div>
            <dt>{{ t('home.statTrips') }}</dt>
            <dd>{{ travel.trips.length }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="container">
      <TopPick class="block" />

      <section v-if="travel.nextTrip" class="block">
        <div class="card next-card">
          <div>
            <p class="eyebrow">{{ t('home.nextDeparture') }}</p>
            <h2>{{ travel.nextTrip.destination }}</h2>
            <p class="muted">
              {{ travel.nextTrip.startDate }} → {{ travel.nextTrip.endDate }} ·
              {{ travel.durationOf(travel.nextTrip) }} {{ t('common.days') }} ·
              {{ money(travel.nextTrip.budget) }}
            </p>
          </div>
          <RouterLink class="btn" to="/trips">{{ t('home.openPlanner') }}</RouterLink>
        </div>
      </section>

      <section class="block">
        <div class="section-head">
          <h2>{{ t('home.featured') }}</h2>
          <RouterLink to="/destinations">{{ t('home.browseAll') }} →</RouterLink>
        </div>
        <div class="grid">
          <DestinationCard
            v-for="destination in destinationsStore.featured"
            :key="destination.slug"
            :destination="destination"
            :wishlisted="destinationsStore.isWishlisted(destination.slug)"
            :in-season="destinationsStore.inSeason(destination)"
            @toggle-wishlist="destinationsStore.toggleWishlist"
          />
        </div>
      </section>

      <section class="block">
        <h2>{{ t('home.howTitle') }}</h2>
        <ol class="steps">
          <li class="card">
            <span class="step-num">1</span>
            <h3>{{ t('home.step1Title') }}</h3>
            <p class="muted">{{ t('home.step1Body') }}</p>
          </li>
          <li class="card">
            <span class="step-num">2</span>
            <h3>{{ t('home.step2Title') }}</h3>
            <p class="muted">{{ t('home.step2Body') }}</p>
          </li>
          <li class="card">
            <span class="step-num">3</span>
            <h3>{{ t('home.step3Title') }}</h3>
            <p class="muted">{{ t('home.step3Body') }}</p>
          </li>
        </ol>
      </section>
    </div>
  </main>
</template>

<style scoped>
.hero {
  background:
    radial-gradient(900px 400px at 15% -10%, var(--c-brand-soft), transparent 70%),
    radial-gradient(700px 360px at 90% 0%, rgba(234, 88, 12, 0.14), transparent 65%);
  padding: 3rem 0 3.5rem;
  margin-top: -2.5rem;
}

.hero-inner {
  max-width: 760px;
}

.lede {
  margin-top: 0.85rem;
  font-size: 1.05rem;
  color: var(--c-muted);
  max-width: 58ch;
}

.search {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  max-width: 520px;
}

.stats {
  display: flex;
  gap: 2.25rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.stats dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--c-muted);
  font-weight: 650;
}

.stats dd {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--c-heading);
}

.block {
  margin-top: 3rem;
}

.next-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  flex-wrap: wrap;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.steps {
  list-style: none;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin-top: 1.25rem;
}

.steps li {
  padding: 1.25rem;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  font-weight: 700;
  margin-bottom: 0.6rem;
}
</style>
