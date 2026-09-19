<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { destinations, findDestination } from '@/data/destinations'
import { useCurrencyStore } from '@/stores/currency'
import { usePlannerStore } from '@/stores/planner'
import DestinationPhoto from '@/components/DestinationPhoto.vue'

const props = defineProps<{ slug: string }>()
const router = useRouter()
const currency = useCurrencyStore()
const planner = usePlannerStore()

const d = computed(() => findDestination(props.slug))

const breakdown = computed(() => {
  if (!d.value) return []
  const bd = d.value.budgetBreakdown
  const max = Math.max(bd.stay, bd.food, bd.transport, bd.activities) || 1
  const labels: Record<string, string> = {
    stay: 'Stay',
    food: 'Food',
    transport: 'Transport',
    activities: 'Activities',
  }
  return (['stay', 'food', 'transport', 'activities'] as const).map((k) => ({
    label: labels[k],
    amount: currency.money(bd[k]),
    pct: Math.round((bd[k] / max) * 100),
    isMax: bd[k] === max,
  }))
})

const related = computed(() => {
  if (!d.value) return []
  return destinations
    .filter((x) => x.slug !== d.value!.slug && x.region === d.value!.region)
    .slice(0, 3)
})

const alreadyPlanned = computed(() =>
  d.value ? planner.trips.some((t) => t.destination.includes(d.value!.name)) : false,
)

function goCatalog() {
  router.push({ name: 'catalog' })
}

function planHere() {
  if (!d.value) return
  router.push({ name: 'trips', query: { from: d.value.slug } })
}

function goDestination(slug: string) {
  router.push({ name: 'destination', params: { slug } })
}
</script>

<template>
  <main
    v-if="d"
    style="
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--acme-space-6) var(--acme-space-6) var(--acme-space-20);
    "
  >
    <div class="acme-breadcrumbs" style="margin-bottom: var(--acme-space-5)">
      <RouterLink to="/">Explore</RouterLink>
      <span aria-hidden="true">/</span>
      <RouterLink to="/destinations">Destinations</RouterLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{{ d.name }}</span>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: var(--acme-space-10);
        align-items: start;
      "
    >
      <article>
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
            {{ d.region }} · {{ d.country }}
          </p>
          <h1
            style="
              margin: var(--acme-space-2) 0 0;
              font-size: var(--acme-text-5xl);
              letter-spacing: -0.015em;
            "
          >
            {{ d.name }}
          </h1>
          <p
            style="
              margin: var(--acme-space-2) 0 0;
              font-size: var(--acme-text-lg);
              color: var(--acme-color-text-muted);
            "
          >
            {{ d.tagline }}
          </p>
        </header>

        <div
          style="
            position: relative;
            aspect-ratio: 16 / 9;
            border: 1px solid var(--acme-color-border);
            border-radius: var(--acme-radius-lg);
            overflow: hidden;
            margin-bottom: var(--acme-space-8);
          "
        >
          <DestinationPhoto :gradient="d.gradient" :emoji="d.emoji" :label="`Photo of ${d.name}`" />
        </div>

        <section style="margin-bottom: var(--acme-space-10); max-width: 68ch">
          <p
            style="
              margin: 0 0 var(--acme-space-4);
              font-size: var(--acme-text-lg);
              text-wrap: pretty;
            "
          >
            {{ d.summary }}
          </p>
          <p
            v-for="(para, i) in d.overview"
            :key="i"
            style="margin: 0 0 var(--acme-space-4); text-wrap: pretty"
          >
            {{ para }}
          </p>
        </section>

        <section style="margin-bottom: var(--acme-space-10)">
          <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">
            Don't miss
          </h2>
          <ul
            style="
              list-style: none;
              margin: 0;
              padding: 0;
              display: flex;
              flex-wrap: wrap;
              gap: var(--acme-space-2);
            "
          >
            <li
              v-for="h in d.highlights"
              :key="h"
              class="acme-badge"
              style="
                font-size: var(--acme-text-sm);
                padding: var(--acme-space-2) var(--acme-space-3);
              "
            >
              {{ h }}
            </li>
          </ul>
        </section>

        <section style="margin-bottom: var(--acme-space-10)">
          <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">
            Where to base yourself
          </h2>
          <div
            style="
              display: grid;
              gap: var(--acme-space-4);
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            "
          >
            <div v-for="area in d.neighbourhoods" :key="area.name" class="acme-card">
              <div class="acme-card__body" style="padding: var(--acme-space-5)">
                <h3 style="margin: 0 0 var(--acme-space-1); font-size: var(--acme-text-lg)">
                  {{ area.name }}
                </h3>
                <p
                  style="
                    margin: 0 0 var(--acme-space-2);
                    font-size: var(--acme-text-sm);
                    color: var(--acme-color-accent);
                    font-weight: 600;
                  "
                >
                  Best for {{ area.bestFor }}
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: var(--acme-text-sm);
                    color: var(--acme-color-text-muted);
                    text-wrap: pretty;
                  "
                >
                  {{ area.description }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style="margin-bottom: var(--acme-space-10)">
          <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">
            A perfect three days
          </h2>
          <div style="display: flex; flex-direction: column; gap: var(--acme-space-4)">
            <div v-for="plan in d.sampleItinerary" :key="plan.day" class="acme-card">
              <div class="acme-card__body" style="padding: var(--acme-space-5)">
                <div
                  style="
                    display: flex;
                    align-items: baseline;
                    gap: var(--acme-space-3);
                    margin-bottom: var(--acme-space-3);
                  "
                >
                  <span
                    style="
                      font-family: var(--acme-font-display);
                      font-style: italic;
                      font-size: var(--acme-text-2xl);
                      color: var(--acme-color-accent);
                      line-height: 1;
                    "
                    >{{ plan.day }}</span
                  >
                  <h3 style="margin: 0; font-size: var(--acme-text-lg)">{{ plan.title }}</h3>
                </div>
                <table class="acme-table">
                  <tbody>
                    <tr>
                      <td style="width: 7rem; color: var(--acme-color-text-muted)">Morning</td>
                      <td>{{ plan.morning }}</td>
                    </tr>
                    <tr>
                      <td style="color: var(--acme-color-text-muted)">Afternoon</td>
                      <td>{{ plan.afternoon }}</td>
                    </tr>
                    <tr>
                      <td style="color: var(--acme-color-text-muted)">Evening</td>
                      <td>{{ plan.evening }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section
          style="
            margin-bottom: var(--acme-space-10);
            display: grid;
            gap: var(--acme-space-8);
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          "
        >
          <div>
            <h2 style="margin: 0 0 var(--acme-space-3); font-size: var(--acme-text-2xl)">
              What to eat
            </h2>
            <ul
              style="
                margin: 0;
                padding-left: var(--acme-space-5);
                display: flex;
                flex-direction: column;
                gap: var(--acme-space-2);
                font-size: var(--acme-text-sm);
              "
            >
              <li v-for="item in d.foodPicks" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <h2 style="margin: 0 0 var(--acme-space-3); font-size: var(--acme-text-2xl)">
              Worth a day trip
            </h2>
            <ul
              style="
                margin: 0;
                padding-left: var(--acme-space-5);
                display: flex;
                flex-direction: column;
                gap: var(--acme-space-2);
                font-size: var(--acme-text-sm);
              "
            >
              <li v-for="item in d.dayTrips" :key="item">{{ item }}</li>
            </ul>
          </div>
        </section>

        <section style="margin-bottom: var(--acme-space-10)">
          <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">
            When to go
          </h2>
          <div class="acme-card" style="padding: var(--acme-space-2) var(--acme-space-4)">
            <table class="acme-table">
              <tbody>
                <tr v-for="season in d.seasons" :key="season.label">
                  <td
                    style="
                      width: 9rem;
                      font-variant-numeric: tabular-nums;
                      color: var(--acme-color-text-muted);
                    "
                  >
                    {{ season.months.join(' · ') }}
                  </td>
                  <td style="width: 11rem; font-weight: 600">{{ season.label }}</td>
                  <td>{{ season.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style="margin-bottom: var(--acme-space-10)">
          <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">
            Know before you go
          </h2>
          <div class="acme-card" style="padding: var(--acme-space-2) var(--acme-space-4)">
            <table class="acme-table">
              <tbody>
                <tr>
                  <td style="width: 11rem; color: var(--acme-color-text-muted)">Language</td>
                  <td>{{ d.practical.language }}</td>
                </tr>
                <tr>
                  <td style="color: var(--acme-color-text-muted)">Currency</td>
                  <td>{{ d.practical.currency }}</td>
                </tr>
                <tr>
                  <td style="color: var(--acme-color-text-muted)">Time zone</td>
                  <td>{{ d.practical.timeZone }}</td>
                </tr>
                <tr>
                  <td style="color: var(--acme-color-text-muted)">Plugs</td>
                  <td>{{ d.practical.plug }}</td>
                </tr>
                <tr>
                  <td style="color: var(--acme-color-text-muted)">Visas</td>
                  <td>{{ d.practical.visa }}</td>
                </tr>
                <tr>
                  <td style="color: var(--acme-color-text-muted)">Getting around</td>
                  <td>{{ d.practical.gettingAround }}</td>
                </tr>
                <tr>
                  <td style="color: var(--acme-color-text-muted)">Staying safe</td>
                  <td>{{ d.practical.safety }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="related.length">
          <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">
            More in {{ d.region }}
          </h2>
          <div
            style="
              display: grid;
              gap: var(--acme-space-3);
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            "
          >
            <a
              v-for="item in related"
              :key="item.slug"
              href="#"
              class="acme-card acme-card--interactive"
              style="
                text-decoration: none;
                color: var(--acme-color-text);
                padding: var(--acme-space-4);
                display: flex;
                justify-content: space-between;
                gap: var(--acme-space-3);
              "
              @click.prevent="goDestination(item.slug)"
            >
              <strong style="font-weight: 600">{{ item.name }}</strong>
              <span
                style="color: var(--acme-color-text-muted); font-variant-numeric: tabular-nums"
                >{{ currency.money(item.dailyBudget) }}</span
              >
            </a>
          </div>
        </section>
      </article>

      <aside
        class="acme-card"
        style="
          padding: var(--acme-space-5);
          display: flex;
          flex-direction: column;
          gap: var(--acme-space-4);
          position: sticky;
          top: var(--acme-space-5);
        "
      >
        <div>
          <p
            style="
              margin: 0;
              font-size: var(--acme-text-xs);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              color: var(--acme-color-text-muted);
            "
          >
            Daily budget
          </p>
          <p
            style="
              margin: 0;
              font-size: var(--acme-text-3xl);
              font-weight: 600;
              font-variant-numeric: tabular-nums;
            "
          >
            {{ currency.money(d.dailyBudget) }}
          </p>
          <p style="margin: 0; font-size: var(--acme-text-sm); color: var(--acme-color-text-muted)">
            {{ currency.money(d.dailyBudget * 7) }} for a week · one traveller
          </p>
        </div>

        <div
          style="
            border-top: 1px solid var(--acme-color-border);
            padding-top: var(--acme-space-4);
            display: flex;
            flex-direction: column;
            gap: var(--acme-space-3);
          "
        >
          <p
            style="
              margin: 0;
              font-size: var(--acme-text-xs);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              color: var(--acme-color-text-muted);
            "
          >
            Where the money goes
          </p>
          <div v-for="part in breakdown" :key="part.label">
            <div
              style="
                display: flex;
                justify-content: space-between;
                font-size: var(--acme-text-sm);
                margin-bottom: var(--acme-space-1);
              "
            >
              <span>{{ part.label }}</span>
              <span style="font-weight: 600; font-variant-numeric: tabular-nums">{{
                part.amount
              }}</span>
            </div>
            <div
              style="
                height: 6px;
                background: var(--acme-color-surface);
                border: 1px solid var(--acme-color-border);
                border-radius: var(--acme-radius-sm);
                overflow: hidden;
              "
            >
              <span
                :style="{
                  display: 'block',
                  height: '100%',
                  width: part.pct + '%',
                  background: part.isMax ? 'var(--acme-color-primary)' : 'var(--acme-color-data)',
                }"
              ></span>
            </div>
          </div>
        </div>

        <div
          style="
            border-top: 1px solid var(--acme-color-border);
            padding-top: var(--acme-space-4);
            display: flex;
            flex-direction: column;
            gap: var(--acme-space-2);
          "
        >
          <button type="button" class="acme-btn acme-btn--primary" @click="planHere">
            Start a trip here
          </button>
          <button
            type="button"
            class="acme-btn acme-btn--secondary"
            @click="planner.toggleWish(d.slug)"
          >
            {{ planner.isSaved(d.slug) ? 'Saved to shortlist' : 'Save to shortlist' }}
          </button>
          <p
            v-if="alreadyPlanned"
            class="acme-alert acme-alert--info"
            style="margin: var(--acme-space-2) 0 0"
          >
            You already have a trip planned here.
          </p>
        </div>
      </aside>
    </div>
  </main>

  <main
    v-else
    style="
      flex: 1;
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      padding: var(--acme-space-24) var(--acme-space-6);
      text-align: center;
    "
  >
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
      404
    </p>
    <h1 style="margin: var(--acme-space-3) 0 0; font-size: var(--acme-text-4xl)">Off the map</h1>
    <p
      style="margin: var(--acme-space-3) 0 var(--acme-space-6); color: var(--acme-color-text-muted)"
    >
      That destination doesn't exist. The catalog is still where you left it.
    </p>
    <button type="button" class="acme-btn acme-btn--primary" @click="goCatalog">
      Browse destinations
    </button>
  </main>
</template>
