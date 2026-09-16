<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useTravelStore } from '@/stores/travel'

const route = useRoute()
const router = useRouter()
const store = useDestinationsStore()
const travel = useTravelStore()

const destination = computed(() => store.bySlug(String(route.params.slug)))

const banner = computed(() => {
  const d = destination.value
  return d ? `linear-gradient(135deg, ${d.gradient[0]}, ${d.gradient[1]})` : ''
})

/** A sensible one-week budget to pre-fill the planner with. */
const weekBudget = computed(() => (destination.value ? destination.value.dailyBudget * 7 : 0))

const related = computed(() =>
  destination.value
    ? store.catalog
        .filter((d) => d.slug !== destination.value!.slug && d.region === destination.value!.region)
        .slice(0, 3)
    : [],
)

function planTrip() {
  const d = destination.value
  if (!d) return
  router.push({
    path: '/trips',
    query: { destination: `${d.name}, ${d.country}`, budget: String(weekBudget.value) },
  })
}
</script>

<template>
  <main class="page">
    <div class="container">
      <template v-if="destination">
        <RouterLink class="back" to="/destinations">← All destinations</RouterLink>

        <section class="hero card" :style="{ background: banner }">
          <span class="emoji" aria-hidden="true">{{ destination.emoji }}</span>
          <div class="hero-text">
            <p class="region">{{ destination.region }}</p>
            <h1>{{ destination.name }}</h1>
            <p class="country">{{ destination.country }} · {{ destination.tagline }}</p>
          </div>
        </section>

        <div class="layout">
          <article class="main">
            <h2>About</h2>
            <p class="summary">{{ destination.summary }}</p>

            <h2>Don't miss</h2>
            <ul class="highlights">
              <li v-for="highlight in destination.highlights" :key="highlight" class="card">
                {{ highlight }}
              </li>
            </ul>

            <h2>Tags</h2>
            <ul class="tags">
              <li v-for="tag in destination.tags" :key="tag" class="chip chip-brand">{{ tag }}</li>
            </ul>
          </article>

          <aside class="side">
            <div class="card panel">
              <dl>
                <div>
                  <dt>Daily budget</dt>
                  <dd>${{ destination.dailyBudget }}</dd>
                </div>
                <div>
                  <dt>One week</dt>
                  <dd>${{ weekBudget }}</dd>
                </div>
                <div>
                  <dt>Best months</dt>
                  <dd>{{ destination.bestMonths.join(', ') }}</dd>
                </div>
              </dl>

              <button class="btn" type="button" @click="planTrip">Plan a trip here</button>
              <button
                class="btn btn-ghost"
                type="button"
                @click="store.toggleWishlist(destination.slug)"
              >
                {{ store.isWishlisted(destination.slug) ? '★ Saved' : '☆ Save to wishlist' }}
              </button>
              <p
                v-if="travel.trips.some((t) => t.destination.includes(destination!.name))"
                class="planned muted"
              >
                You already have a trip planned here.
              </p>
            </div>
          </aside>
        </div>

        <section v-if="related.length" class="related">
          <h2>More in {{ destination.region }}</h2>
          <ul>
            <li v-for="item in related" :key="item.slug" class="card related-item">
              <RouterLink :to="`/destinations/${item.slug}`">
                <span aria-hidden="true">{{ item.emoji }}</span>
                <strong>{{ item.name }}</strong>
                <span class="muted">${{ item.dailyBudget }}/day</span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </template>

      <div v-else class="missing card">
        <h1>Destination not found</h1>
        <p class="muted">We don't have a page for “{{ route.params.slug }}”.</p>
        <RouterLink class="btn" to="/destinations">Back to destinations</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.hero {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2.25rem 1.75rem;
  border: none;
  color: #12141a;
}

.emoji {
  font-size: 3.5rem;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
}

.hero h1 {
  color: #12141a;
}

.region {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
  opacity: 0.75;
}

.country {
  font-weight: 550;
  opacity: 0.85;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-top: 2rem;
  align-items: start;
}

.main h2 {
  margin: 1.5rem 0 0.6rem;
}

.main h2:first-child {
  margin-top: 0;
}

.summary {
  max-width: 68ch;
}

.highlights,
.tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.highlights li {
  padding: 0.65rem 0.9rem;
  font-size: 0.925rem;
}

.panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  top: 84px;
}

.panel dl {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.25rem;
}

.panel dl > div {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
}

.panel dt {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  font-weight: 650;
}

.panel dd {
  font-weight: 650;
  color: var(--c-heading);
}

.planned {
  font-size: 0.82rem;
  text-align: center;
}

.related {
  margin-top: 2.5rem;
}

.related ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.related-item a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--c-text);
}

.missing {
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 880px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .panel {
    position: static;
  }
}
</style>
