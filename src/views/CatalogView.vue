<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { destinations, regions, allTags } from '@/data/destinations'
import { useCurrencyStore } from '@/stores/currency'
import { usePlannerStore } from '@/stores/planner'
import { isInSeason } from '@/composables/useSeason'
import DestinationCard from '@/components/DestinationCard.vue'

const route = useRoute()
const router = useRouter()
const currency = useCurrencyStore()
const planner = usePlannerStore()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const region = ref('all')
const tag = ref('all')
const maxBudget = ref(250)
const inSeasonOnly = ref(false)
const layout = ref<'cards' | 'table'>('cards')

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return destinations
    .filter(
      (d) =>
        (!needle ||
          d.name.toLowerCase().includes(needle) ||
          d.country.toLowerCase().includes(needle) ||
          d.tags.some((t) => t.includes(needle))) &&
        (region.value === 'all' || d.region === region.value) &&
        (tag.value === 'all' || d.tags.includes(tag.value)) &&
        (!inSeasonOnly.value || isInSeason(d)) &&
        d.dailyBudget <= maxBudget.value,
    )
    .sort((a, b) => a.dailyBudget - b.dailyBudget)
})

const hasActiveFilters = computed(
  () =>
    query.value !== '' ||
    region.value !== 'all' ||
    tag.value !== 'all' ||
    maxBudget.value < 250 ||
    inSeasonOnly.value,
)

function resetFilters() {
  query.value = ''
  region.value = 'all'
  tag.value = 'all'
  maxBudget.value = 250
  inSeasonOnly.value = false
}

function openDestination(slug: string) {
  router.push({ name: 'destination', params: { slug } })
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
    <header
      style="
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--acme-space-6);
        flex-wrap: wrap;
        margin-bottom: var(--acme-space-6);
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
          Catalog
        </p>
        <h1 style="margin: var(--acme-space-2) 0 0; font-size: var(--acme-text-4xl)">
          Destinations
        </h1>
        <p
          style="
            margin: var(--acme-space-2) 0 0;
            color: var(--acme-color-text-muted);
            max-width: 56ch;
          "
        >
          {{ filtered.length }} of {{ destinations.length }} destinations. Sorted by daily budget,
          cheapest first.
        </p>
      </div>
      <div class="acme-tabs" role="tablist" style="align-self: center">
        <button
          type="button"
          role="tab"
          class="acme-tab"
          :aria-selected="layout === 'cards'"
          @click="layout = 'cards'"
        >
          Cards
        </button>
        <button
          type="button"
          role="tab"
          class="acme-tab"
          :aria-selected="layout === 'table'"
          @click="layout = 'table'"
        >
          Compare table
        </button>
      </div>
    </header>

    <div
      style="
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        gap: var(--acme-space-8);
        align-items: start;
      "
    >
      <aside
        class="acme-card"
        style="
          padding: var(--acme-space-5);
          display: flex;
          flex-direction: column;
          gap: var(--acme-space-5);
          position: sticky;
          top: var(--acme-space-5);
        "
      >
        <div style="display: flex; align-items: baseline; justify-content: space-between">
          <h2 style="margin: 0; font-size: var(--acme-text-lg)">Filters</h2>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="acme-btn acme-btn--ghost acme-btn--sm"
            @click="resetFilters"
          >
            Clear all
          </button>
        </div>
        <div class="acme-field">
          <label class="acme-label" for="f-query">Search</label>
          <input
            id="f-query"
            v-model="query"
            class="acme-input"
            type="search"
            placeholder="City, country or vibe"
          />
        </div>
        <div class="acme-field">
          <label class="acme-label" for="f-region">Region</label>
          <select id="f-region" v-model="region" class="acme-input">
            <option value="all">All regions</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <div class="acme-field">
          <label class="acme-label" for="f-tag">Vibe</label>
          <select id="f-tag" v-model="tag" class="acme-input">
            <option value="all">Any vibe</option>
            <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="acme-field">
          <label class="acme-label" for="f-budget"
            >Up to {{ currency.money(maxBudget) }} a day</label
          >
          <input
            id="f-budget"
            v-model.number="maxBudget"
            type="range"
            min="50"
            max="250"
            step="5"
            style="accent-color: var(--acme-color-primary); width: 100%"
          />
        </div>
        <label class="acme-switch">
          <input v-model="inSeasonOnly" type="checkbox" />
          In season this month
        </label>
      </aside>

      <div>
        <div
          v-if="layout === 'cards' && filtered.length > 0"
          style="
            display: grid;
            gap: var(--acme-space-5);
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          "
        >
          <DestinationCard v-for="c in filtered" :key="c.slug" :destination="c" />
        </div>

        <div
          v-else-if="layout === 'table' && filtered.length > 0"
          class="acme-card"
          style="padding: var(--acme-space-2) var(--acme-space-4) var(--acme-space-4)"
        >
          <table class="acme-table">
            <thead>
              <tr>
                <th scope="col">Destination</th>
                <th scope="col">Region</th>
                <th scope="col">Vibes</th>
                <th scope="col">Best months</th>
                <th scope="col" class="acme-table__num" style="color: var(--acme-color-accent)">
                  A day ↑
                </th>
                <th scope="col" class="acme-table__num">Saved</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in filtered" :key="c.slug">
                <td>
                  <a href="#" style="font-weight: 600" @click.prevent="openDestination(c.slug)">{{
                    c.name
                  }}</a>
                  <span
                    style="
                      display: block;
                      color: var(--acme-color-text-muted);
                      font-size: var(--acme-text-xs);
                    "
                    >{{ c.country }} · {{ c.tagline }}</span
                  >
                </td>
                <td>{{ c.region }}</td>
                <td>{{ c.tags.join(', ') }}</td>
                <td>
                  {{ c.bestMonths.join(', ') }}
                  <span
                    v-if="isInSeason(c)"
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
                  {{ currency.money(c.dailyBudget) }}
                </td>
                <td class="acme-table__num">
                  <button
                    type="button"
                    class="acme-btn acme-btn--ghost acme-btn--sm"
                    :style="
                      planner.isSaved(c.slug)
                        ? { color: 'var(--acme-color-accent)', fontWeight: 600 }
                        : {}
                    "
                    @click="planner.toggleWish(c.slug)"
                  >
                    {{ planner.isSaved(c.slug) ? 'Saved' : 'Save' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="acme-card" style="padding: var(--acme-space-12); text-align: center">
          <h2 style="margin: 0 0 var(--acme-space-2); font-size: var(--acme-text-xl)">
            Nothing matches that brief
          </h2>
          <p style="margin: 0 0 var(--acme-space-5); color: var(--acme-color-text-muted)">
            Widen the budget or clear the search — the catalog has {{ destinations.length }} ideas.
          </p>
          <button type="button" class="acme-btn acme-btn--primary" @click="resetFilters">
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
