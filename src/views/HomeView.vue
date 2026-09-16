<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useTravelStore } from '@/stores/travel'
import DestinationCard from '@/components/destinations/DestinationCard.vue'

const router = useRouter()
const destinationsStore = useDestinationsStore()
const travel = useTravelStore()
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
        <p class="eyebrow">Plan it, price it, go</p>
        <h1>Find somewhere worth the flight.</h1>
        <p class="lede">
          Browse a hand-picked shortlist of twelve destinations, save the ones you like, then build
          a day-by-day itinerary that keeps an eye on your budget.
        </p>

        <form class="search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="hero-search">Search destinations</label>
          <input
            id="hero-search"
            v-model="search"
            type="search"
            placeholder="Try “Japan”, “food” or “adventure”"
          />
          <button class="btn" type="submit">Search</button>
        </form>

        <dl class="stats">
          <div>
            <dt>Destinations</dt>
            <dd>{{ destinationsStore.catalog.length }}</dd>
          </div>
          <div>
            <dt>Saved</dt>
            <dd>{{ destinationsStore.wishlist.length }}</dd>
          </div>
          <div>
            <dt>Trips planned</dt>
            <dd>{{ travel.trips.length }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section v-if="travel.nextTrip" class="container next-trip">
      <div class="card next-card">
        <div>
          <p class="eyebrow">Next departure</p>
          <h2>{{ travel.nextTrip.destination }}</h2>
          <p class="muted">
            {{ travel.nextTrip.startDate }} → {{ travel.nextTrip.endDate }} ·
            {{ travel.durationOf(travel.nextTrip) }} days ·
            {{ travel.nextTrip.activities.length }} activities planned
          </p>
        </div>
        <RouterLink class="btn" to="/trips">Open planner</RouterLink>
      </div>
    </section>

    <section class="container featured">
      <div class="section-head">
        <h2>Good value right now</h2>
        <RouterLink to="/destinations">Browse all →</RouterLink>
      </div>
      <div class="grid">
        <DestinationCard
          v-for="destination in destinationsStore.featured"
          :key="destination.slug"
          :destination="destination"
          :wishlisted="destinationsStore.isWishlisted(destination.slug)"
          @toggle-wishlist="destinationsStore.toggleWishlist"
        />
      </div>
    </section>

    <section class="container how">
      <h2>How it works</h2>
      <ol class="steps">
        <li class="card">
          <span class="step-num">1</span>
          <h3>Explore</h3>
          <p class="muted">Filter by region, vibe and daily budget until a shortlist appears.</p>
        </li>
        <li class="card">
          <span class="step-num">2</span>
          <h3>Save</h3>
          <p class="muted">Star the places you're serious about. Your wishlist persists locally.</p>
        </li>
        <li class="card">
          <span class="step-num">3</span>
          <h3>Plan</h3>
          <p class="muted">
            Turn a destination into a dated trip with a costed, day-by-day itinerary.
          </p>
        </li>
      </ol>
    </section>
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

.next-trip {
  margin-top: 2.5rem;
}

.next-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  flex-wrap: wrap;
}

.featured,
.how {
  margin-top: 3rem;
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
