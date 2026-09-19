<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { destinations } from '@/data/destinations'
import { useCurrencyStore } from '@/stores/currency'
import { currentMonthName, isInSeason, noteFor, seasonScore } from '@/composables/useSeason'
import DestinationCard from '@/components/DestinationCard.vue'
import DestinationPhoto from '@/components/DestinationPhoto.vue'

const router = useRouter()
const currency = useCurrencyStore()

const heroSearch = ref('')
const monthName = currentMonthName()

const ranked = computed(() => [...destinations].sort((a, b) => seasonScore(b) - seasonScore(a)))
const pick = computed(() => ranked.value[0])
const runnersUp = computed(() => ranked.value.slice(1, 4))
const featured = computed(() =>
  [...destinations].sort((a, b) => a.dailyBudget - b.dailyBudget).slice(0, 3),
)
const inSeasonCount = computed(() => destinations.filter((d) => isInSeason(d)).length)

const topPickSubtitle = computed(() =>
  destinations.some((d) => isInSeason(d))
    ? 'Ranked by whether a place is at its best right now, with value breaking ties.'
    : `Nothing is at its peak in ${monthName}, so these are the best all-rounders.`,
)

function submitSearch() {
  router.push({ name: 'catalog', query: heroSearch.value ? { q: heroSearch.value } : {} })
}

function openDestination(slug: string) {
  router.push({ name: 'destination', params: { slug } })
}

function planFrom(slug: string) {
  router.push({ name: 'trips', query: { from: slug } })
}
</script>

<template>
  <main
    style="
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--acme-space-12) var(--acme-space-6) var(--acme-space-20);
    "
  >
    <section style="display: flex; flex-direction: column; gap: var(--acme-space-6)">
      <div style="max-width: 60ch">
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
          {{ monthName }} · {{ destinations.length }} destinations, {{ inSeasonCount }} in season
        </p>
        <h1
          style="
            margin: var(--acme-space-2) 0 0;
            font-size: var(--acme-text-5xl);
            letter-spacing: -0.015em;
          "
        >
          Where to go this month
        </h1>
        <p
          style="
            margin: var(--acme-space-3) 0 0;
            font-size: var(--acme-text-lg);
            color: var(--acme-color-text-muted);
            text-wrap: pretty;
          "
        >
          {{ topPickSubtitle }} Every price is a real daily budget, converted from USD.
        </p>
      </div>

      <form
        style="display: flex; gap: var(--acme-space-2); max-width: 520px"
        @submit.prevent="submitSearch"
      >
        <input
          v-model="heroSearch"
          class="acme-input"
          type="search"
          placeholder="Search Japan, food, hiking…"
          aria-label="Search destinations"
          style="flex: 1"
        />
        <button type="submit" class="acme-btn acme-btn--primary">Search the catalog</button>
      </form>

      <div
        v-if="pick"
        style="
          display: grid;
          grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
          gap: var(--acme-space-6);
          align-items: start;
        "
      >
        <article class="acme-card" style="overflow: hidden">
          <div
            class="acme-card__media"
            style="position: relative; padding: 0; aspect-ratio: 21 / 9"
          >
            <DestinationPhoto
              :gradient="pick.gradient"
              :emoji="pick.emoji"
              :label="`Photo of ${pick.name}`"
            />
          </div>
          <div
            class="acme-card__body"
            style="display: flex; flex-direction: column; gap: var(--acme-space-3)"
          >
            <div
              style="
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: var(--acme-space-4);
                flex-wrap: wrap;
              "
            >
              <div>
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
                  Top pick for {{ monthName }}
                </p>
                <h2 style="margin: var(--acme-space-1) 0 0; font-size: var(--acme-text-3xl)">
                  {{ pick.name }}
                </h2>
                <p
                  style="
                    margin: 0;
                    color: var(--acme-color-text-muted);
                    font-size: var(--acme-text-sm);
                  "
                >
                  {{ pick.country }} · {{ pick.region }}
                </p>
              </div>
              <span
                v-if="isInSeason(pick)"
                class="acme-badge"
                style="background: var(--acme-color-selected-soft); color: var(--acme-color-accent)"
                >In season now</span
              >
            </div>
            <p style="margin: 0; max-width: 60ch; text-wrap: pretty">{{ noteFor(pick) }}</p>
            <div
              style="
                display: flex;
                gap: var(--acme-space-8);
                flex-wrap: wrap;
                padding-top: var(--acme-space-2);
              "
            >
              <div>
                <p
                  style="
                    margin: 0;
                    font-size: var(--acme-text-xs);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--acme-color-text-muted);
                    font-weight: 600;
                  "
                >
                  A day
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: var(--acme-text-2xl);
                    font-weight: 600;
                    font-variant-numeric: tabular-nums;
                  "
                >
                  {{ currency.money(pick.dailyBudget) }}
                </p>
              </div>
              <div>
                <p
                  style="
                    margin: 0;
                    font-size: var(--acme-text-xs);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--acme-color-text-muted);
                    font-weight: 600;
                  "
                >
                  A week
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: var(--acme-text-2xl);
                    font-weight: 600;
                    font-variant-numeric: tabular-nums;
                  "
                >
                  {{ currency.money(pick.dailyBudget * 7) }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="acme-card__footer"
            style="display: flex; gap: var(--acme-space-3); flex-wrap: wrap"
          >
            <button
              type="button"
              class="acme-btn acme-btn--primary"
              @click="openDestination(pick.slug)"
            >
              Read the {{ pick.name }} guide
            </button>
            <button type="button" class="acme-btn acme-btn--secondary" @click="planFrom(pick.slug)">
              Start a trip here
            </button>
          </div>
        </article>

        <div style="display: flex; flex-direction: column; gap: var(--acme-space-4)">
          <div class="acme-card">
            <div class="acme-card__body" style="padding: var(--acme-space-5)">
              <h3 style="margin: 0 0 var(--acme-space-3); font-size: var(--acme-text-lg)">
                Also good in {{ monthName }}
              </h3>
              <ul
                style="
                  list-style: none;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  flex-direction: column;
                "
              >
                <li
                  v-for="r in runnersUp"
                  :key="r.slug"
                  style="
                    border-top: 1px solid var(--acme-color-border);
                    padding: var(--acme-space-3) 0;
                  "
                >
                  <a
                    href="#"
                    style="
                      display: flex;
                      justify-content: space-between;
                      gap: var(--acme-space-3);
                      text-decoration: none;
                      color: var(--acme-color-text);
                    "
                    @click.prevent="openDestination(r.slug)"
                  >
                    <span>
                      <strong style="display: block; font-weight: 600">{{ r.name }}</strong>
                      <span
                        style="font-size: var(--acme-text-sm); color: var(--acme-color-text-muted)"
                        >{{ noteFor(r) }}</span
                      >
                    </span>
                    <span
                      style="
                        font-variant-numeric: tabular-nums;
                        font-weight: 600;
                        white-space: nowrap;
                      "
                      >{{ currency.money(r.dailyBudget) }}</span
                    >
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section style="margin-top: var(--acme-space-16)">
      <div
        style="
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--acme-space-4);
          margin-bottom: var(--acme-space-5);
        "
      >
        <h2 style="margin: 0; font-size: var(--acme-text-2xl)">Good value right now</h2>
        <RouterLink to="/destinations" style="font-size: var(--acme-text-sm); font-weight: 600"
          >All {{ destinations.length }} destinations</RouterLink
        >
      </div>
      <div
        style="
          display: grid;
          gap: var(--acme-space-5);
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        "
      >
        <DestinationCard v-for="d in featured" :key="d.slug" :destination="d" />
      </div>
    </section>

    <section
      style="
        margin-top: var(--acme-space-16);
        border-top: 1px solid var(--acme-color-border);
        padding-top: var(--acme-space-8);
      "
    >
      <h2 style="margin: 0 0 var(--acme-space-5); font-size: var(--acme-text-2xl)">
        How Wanderlog works
      </h2>
      <ol
        style="
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: var(--acme-space-6);
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        "
      >
        <li>
          <p
            style="
              margin: 0;
              font-family: var(--acme-font-display);
              font-style: italic;
              font-size: var(--acme-text-4xl);
              color: var(--acme-color-accent);
              line-height: 1;
            "
          >
            1
          </p>
          <h3
            style="
              margin: var(--acme-space-2) 0 var(--acme-space-1);
              font-size: var(--acme-text-lg);
            "
          >
            Narrow it down
          </h3>
          <p style="margin: 0; color: var(--acme-color-text-muted); font-size: var(--acme-text-sm)">
            Filter by region, vibe and what you can spend a day.
          </p>
        </li>
        <li>
          <p
            style="
              margin: 0;
              font-family: var(--acme-font-display);
              font-style: italic;
              font-size: var(--acme-text-4xl);
              color: var(--acme-color-accent);
              line-height: 1;
            "
          >
            2
          </p>
          <h3
            style="
              margin: var(--acme-space-2) 0 var(--acme-space-1);
              font-size: var(--acme-text-lg);
            "
          >
            Keep a shortlist
          </h3>
          <p style="margin: 0; color: var(--acme-color-text-muted); font-size: var(--acme-text-sm)">
            Save the ones you mean it about and compare them side by side.
          </p>
        </li>
        <li>
          <p
            style="
              margin: 0;
              font-family: var(--acme-font-display);
              font-style: italic;
              font-size: var(--acme-text-4xl);
              color: var(--acme-color-accent);
              line-height: 1;
            "
          >
            3
          </p>
          <h3
            style="
              margin: var(--acme-space-2) 0 var(--acme-space-1);
              font-size: var(--acme-text-lg);
            "
          >
            Cost the days
          </h3>
          <p style="margin: 0; color: var(--acme-color-text-muted); font-size: var(--acme-text-sm)">
            Turn one into a dated trip and watch the budget as you add plans.
          </p>
        </li>
      </ol>
    </section>
  </main>
</template>
