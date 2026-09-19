<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { destinations } from '@/data/destinations'
import { useCurrencyStore } from '@/stores/currency'
import { usePlannerStore } from '@/stores/planner'
import { isInSeason } from '@/composables/useSeason'

const router = useRouter()
const currency = useCurrencyStore()
const planner = usePlannerStore()

const wishlistRows = computed(() =>
  planner.wishlist.map((slug) => destinations.find((d) => d.slug === slug)).filter((d) => !!d),
)

function openDestination(slug: string) {
  router.push({ name: 'destination', params: { slug } })
}

function planFrom(slug: string) {
  router.push({ name: 'trips', query: { from: slug } })
}

function goCatalog() {
  router.push({ name: 'catalog' })
}
</script>

<template>
  <main
    style="
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--acme-space-10) var(--acme-space-6) var(--acme-space-20);
    "
  >
    <header style="margin-bottom: var(--acme-space-6)">
      <p
        style="
          margin: 0;
          font-size: var(--acme-text-xs);
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--acme-color-accent);
        "
      >
        Shortlist
      </p>
      <h1 style="margin: var(--acme-space-2) 0 0; font-size: var(--acme-text-4xl)">
        Saved destinations
      </h1>
      <p
        style="
          margin: var(--acme-space-2) 0 0;
          color: var(--acme-color-text-muted);
          max-width: 60ch;
        "
      >
        Side by side, on price and season. Kept in this browser until you turn one into a trip.
      </p>
    </header>

    <div
      v-if="wishlistRows.length"
      class="acme-card"
      style="padding: var(--acme-space-2) var(--acme-space-4) var(--acme-space-4)"
    >
      <table class="acme-table">
        <thead>
          <tr>
            <th scope="col">Destination</th>
            <th scope="col">Vibes</th>
            <th scope="col">Best months</th>
            <th scope="col" class="acme-table__num">A day</th>
            <th scope="col" class="acme-table__num">A week</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in wishlistRows" :key="c!.slug">
            <td>
              <a href="#" style="font-weight: 600" @click.prevent="openDestination(c!.slug)">{{
                c!.name
              }}</a>
              <span
                style="
                  display: block;
                  font-size: var(--acme-text-xs);
                  color: var(--acme-color-text-muted);
                "
                >{{ c!.country }} · {{ c!.region }}</span
              >
            </td>
            <td>{{ c!.tags.join(', ') }}</td>
            <td>
              {{ c!.bestMonths.join(', ') }}
              <span
                v-if="isInSeason(c!)"
                class="acme-badge"
                style="
                  background: var(--acme-color-selected-soft);
                  color: var(--acme-color-accent);
                  margin-left: var(--acme-space-2);
                "
                >now</span
              >
            </td>
            <td class="acme-table__num" style="font-weight: 600">
              {{ currency.money(c!.dailyBudget) }}
            </td>
            <td class="acme-table__num">{{ currency.money(c!.dailyBudget * 7) }}</td>
            <td style="text-align: end; white-space: nowrap">
              <button
                type="button"
                class="acme-btn acme-btn--secondary acme-btn--sm"
                @click="planFrom(c!.slug)"
              >
                Start a trip
              </button>
              <button
                type="button"
                class="acme-btn acme-btn--ghost acme-btn--sm"
                style="margin-left: var(--acme-space-2)"
                @click="planner.toggleWish(c!.slug)"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="acme-card"
      style="padding: var(--acme-space-16) var(--acme-space-6); text-align: center"
    >
      <h2 style="margin: 0 0 var(--acme-space-2); font-size: var(--acme-text-xl)">
        Nothing saved yet
      </h2>
      <p style="margin: 0 0 var(--acme-space-5); color: var(--acme-color-text-muted)">
        The catalog has {{ destinations.length }} ideas and
        {{ destinations.filter((d) => isInSeason(d)).length }} of them are in season.
      </p>
      <button type="button" class="acme-btn acme-btn--primary" @click="goCatalog">
        Browse destinations
      </button>
    </div>
  </main>
</template>
