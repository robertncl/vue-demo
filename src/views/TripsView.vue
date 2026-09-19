<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { findDestination } from '@/data/destinations'
import { useCurrencyStore } from '@/stores/currency'
import { usePlannerStore } from '@/stores/planner'

const route = useRoute()
const currency = useCurrencyStore()
const planner = usePlannerStore()

const tripForm = reactive({
  destination: '',
  startDate: '',
  endDate: '',
  budget: 500,
})

const activityForm = reactive({
  title: '',
  day: 1,
  time: '09:00',
  cost: 0,
})

// Prefill from a "Start a trip here" link (?from=slug), once.
watchEffect(() => {
  const from = route.query.from
  if (typeof from !== 'string') return
  const d = findDestination(from)
  if (!d) return
  tripForm.destination = `${d.name}, ${d.country}`
  tripForm.budget = Math.round(d.dailyBudget * 7 * currency.rate)
})

const selectedTrip = computed(() => planner.trips.find((t) => t.id === planner.selectedTripId))

const tripCards = computed(() =>
  planner.trips.map((t) => ({
    trip: t,
    dates: `${t.startDate} → ${t.endDate}`,
    meta: `${t.activities.length} ${t.activities.length === 1 ? 'activity' : 'activities'} · ${currency.money(planner.spendOf(t))} of ${currency.money(t.budget)}`,
  })),
)

const byDay = computed(() => {
  const trip = selectedTrip.value
  if (!trip) return []
  const map = new Map<number, typeof trip.activities>()
  for (const a of trip.activities) map.set(a.day, [...(map.get(a.day) ?? []), a])
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, activities]) => ({
      day,
      total: currency.money(activities.reduce((s, a) => s + a.cost, 0)),
      activities,
    }))
})

const spent = computed(() => (selectedTrip.value ? planner.spendOf(selectedTrip.value) : 0))
const remaining = computed(() => (selectedTrip.value ? selectedTrip.value.budget - spent.value : 0))
const overBudget = computed(() => remaining.value < 0)
const pct = computed(() =>
  selectedTrip.value && selectedTrip.value.budget > 0
    ? Math.min(100, Math.round((spent.value / selectedTrip.value.budget) * 100))
    : 0,
)
const duration = computed(() => (selectedTrip.value ? planner.durationOf(selectedTrip.value) : 0))

function submitTrip() {
  if (!tripForm.destination || !tripForm.startDate || !tripForm.endDate) return
  planner.addTrip({
    destination: tripForm.destination,
    startDate: tripForm.startDate,
    endDate: tripForm.endDate,
    budgetUsd: currency.toUsd(Number(tripForm.budget)),
  })
  tripForm.destination = ''
  tripForm.startDate = ''
  tripForm.endDate = ''
  tripForm.budget = Math.round(500 * currency.rate)
}

function submitActivity() {
  if (!activityForm.title || !selectedTrip.value) return
  planner.addActivity(selectedTrip.value.id, {
    day: Number(activityForm.day) || 1,
    time: activityForm.time,
    title: activityForm.title,
    costUsd: currency.toUsd(Number(activityForm.cost)),
  })
  activityForm.title = ''
  activityForm.cost = 0
}

function removeTrip(id: string, e: Event) {
  e.stopPropagation()
  planner.removeTrip(id)
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
        Planner
      </p>
      <h1 style="margin: var(--acme-space-2) 0 0; font-size: var(--acme-text-4xl)">Trips</h1>
      <p
        style="
          margin: var(--acme-space-2) 0 0;
          color: var(--acme-color-text-muted);
          max-width: 60ch;
        "
      >
        Dates, a budget, then the days. Costs roll up as you add plans; everything is saved in this
        browser.
      </p>
    </header>

    <div
      style="
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr);
        gap: var(--acme-space-8);
        align-items: start;
      "
    >
      <aside style="display: flex; flex-direction: column; gap: var(--acme-space-5)">
        <form
          class="acme-card"
          style="
            padding: var(--acme-space-5);
            display: flex;
            flex-direction: column;
            gap: var(--acme-space-4);
          "
          @submit.prevent="submitTrip"
        >
          <h2 style="margin: 0; font-size: var(--acme-text-lg)">New trip</h2>
          <div class="acme-field">
            <label class="acme-label" for="t-dest">Destination</label>
            <input
              id="t-dest"
              v-model="tripForm.destination"
              class="acme-input"
              type="text"
              placeholder="Kyoto, Japan"
            />
          </div>
          <div
            style="
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: var(--acme-space-3);
            "
          >
            <div class="acme-field" style="min-width: 0">
              <label class="acme-label" for="t-start">Leaves</label>
              <input
                id="t-start"
                v-model="tripForm.startDate"
                class="acme-input"
                type="date"
                style="min-width: 0; width: 100%"
              />
            </div>
            <div class="acme-field" style="min-width: 0">
              <label class="acme-label" for="t-end">Returns</label>
              <input
                id="t-end"
                v-model="tripForm.endDate"
                class="acme-input"
                type="date"
                style="min-width: 0; width: 100%"
              />
            </div>
          </div>
          <div class="acme-field">
            <label class="acme-label" for="t-budget">Budget ({{ currency.code }})</label>
            <input
              id="t-budget"
              v-model.number="tripForm.budget"
              class="acme-input"
              type="number"
              min="0"
              step="50"
            />
            <p class="acme-help">Converted from USD at fixed reference rates.</p>
          </div>
          <button type="submit" class="acme-btn acme-btn--primary" style="align-self: flex-start">
            Add trip
          </button>
        </form>

        <section>
          <h2 style="margin: 0 0 var(--acme-space-3); font-size: var(--acme-text-lg)">
            Your trips
          </h2>
          <p
            v-if="!planner.trips.length"
            style="margin: 0; font-size: var(--acme-text-sm); color: var(--acme-color-text-muted)"
          >
            No trips yet. Add one above, or start from a destination guide.
          </p>
          <ul
            style="
              list-style: none;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              gap: var(--acme-space-2);
            "
          >
            <li
              v-for="card in tripCards"
              :key="card.trip.id"
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--acme-space-3)',
                padding: 'var(--acme-space-3) var(--acme-space-4)',
                border:
                  '1px solid ' +
                  (card.trip.id === planner.selectedTripId
                    ? 'var(--acme-color-selected)'
                    : 'var(--acme-color-border)'),
                borderRadius: 'var(--acme-radius-lg)',
                background:
                  card.trip.id === planner.selectedTripId
                    ? 'var(--acme-color-selected-soft)'
                    : 'var(--acme-color-surface-raised)',
              }"
            >
              <button
                type="button"
                style="
                  flex: 1;
                  text-align: start;
                  background: none;
                  border: none;
                  padding: 0;
                  cursor: pointer;
                  color: inherit;
                  font: inherit;
                  min-width: 0;
                "
                @click="planner.selectTrip(card.trip.id)"
              >
                <strong style="display: block; font-weight: 600">{{
                  card.trip.destination
                }}</strong>
                <span
                  style="
                    display: block;
                    font-size: var(--acme-text-xs);
                    color: var(--acme-color-text-muted);
                    font-variant-numeric: tabular-nums;
                  "
                  >{{ card.dates }}</span
                >
                <span
                  style="
                    display: block;
                    font-size: var(--acme-text-xs);
                    color: var(--acme-color-text-muted);
                  "
                  >{{ card.meta }}</span
                >
              </button>
              <button
                type="button"
                class="acme-btn acme-btn--ghost acme-btn--sm"
                aria-label="Remove trip"
                @click="removeTrip(card.trip.id, $event)"
              >
                Delete
              </button>
            </li>
          </ul>
        </section>
      </aside>

      <section
        v-if="selectedTrip"
        style="display: flex; flex-direction: column; gap: var(--acme-space-5)"
      >
        <div
          style="
            display: flex;
            align-items: flex-end;
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
              Itinerary
            </p>
            <h2 style="margin: var(--acme-space-1) 0 0; font-size: var(--acme-text-3xl)">
              {{ selectedTrip.destination }}
            </h2>
            <p
              style="
                margin: 0;
                color: var(--acme-color-text-muted);
                font-variant-numeric: tabular-nums;
              "
            >
              {{ selectedTrip.startDate }} → {{ selectedTrip.endDate
              }}<template v-if="duration > 0"> · {{ duration }} days</template>
            </p>
          </div>
        </div>

        <div
          class="acme-card"
          style="
            padding: var(--acme-space-5);
            display: flex;
            flex-direction: column;
            gap: var(--acme-space-3);
          "
        >
          <div style="display: flex; gap: var(--acme-space-8); flex-wrap: wrap">
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
                Budget
              </p>
              <p
                style="
                  margin: 0;
                  font-size: var(--acme-text-xl);
                  font-weight: 600;
                  font-variant-numeric: tabular-nums;
                "
              >
                {{ currency.money(selectedTrip.budget) }}
              </p>
            </div>
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
                Spent
              </p>
              <p
                style="
                  margin: 0;
                  font-size: var(--acme-text-xl);
                  font-weight: 600;
                  font-variant-numeric: tabular-nums;
                "
              >
                {{ currency.money(spent) }}
              </p>
            </div>
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
                {{ overBudget ? 'Over by' : 'Remaining' }}
              </p>
              <p
                :style="{
                  margin: 0,
                  fontSize: 'var(--acme-text-xl)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  color: overBudget ? 'var(--acme-color-danger)' : 'var(--acme-color-text)',
                }"
              >
                {{ currency.money(Math.abs(remaining)) }}
              </p>
            </div>
          </div>
          <div
            role="progressbar"
            style="
              height: 8px;
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
                width: pct + '%',
                background: overBudget ? 'var(--acme-color-danger)' : 'var(--acme-color-primary)',
              }"
            ></span>
          </div>
          <div v-if="overBudget" class="acme-alert acme-alert--danger">
            <div>
              <p class="acme-alert__title">Over budget</p>
              <p>
                The plans cost {{ currency.money(Math.abs(remaining)) }} more than the budget. Cut
                an activity or raise the budget.
              </p>
            </div>
          </div>
        </div>

        <form
          class="acme-card"
          style="
            padding: var(--acme-space-4);
            display: flex;
            flex-direction: row;
            gap: var(--acme-space-3);
            flex-wrap: wrap;
            align-items: flex-end;
          "
          @submit.prevent="submitActivity"
        >
          <div class="acme-field" style="flex: 1 1 200px; min-width: 0">
            <label class="acme-label" for="a-title">Activity</label>
            <input
              id="a-title"
              v-model="activityForm.title"
              class="acme-input"
              type="text"
              placeholder="Fushimi Inari before breakfast"
              style="min-width: 0; width: 100%"
            />
          </div>
          <div class="acme-field" style="flex: 0 1 80px; min-width: 0">
            <label class="acme-label" for="a-day">Day</label>
            <input
              id="a-day"
              v-model.number="activityForm.day"
              class="acme-input"
              type="number"
              min="1"
              style="min-width: 0; width: 100%"
            />
          </div>
          <div class="acme-field" style="flex: 0 1 120px; min-width: 0">
            <label class="acme-label" for="a-time">Time</label>
            <input
              id="a-time"
              v-model="activityForm.time"
              class="acme-input"
              type="time"
              style="min-width: 0; width: 100%"
            />
          </div>
          <div class="acme-field" style="flex: 0 1 110px; min-width: 0">
            <label class="acme-label" for="a-cost">Cost</label>
            <input
              id="a-cost"
              v-model.number="activityForm.cost"
              class="acme-input"
              type="number"
              min="0"
              step="5"
              style="min-width: 0; width: 100%"
            />
          </div>
          <button type="submit" class="acme-btn acme-btn--primary">Add activity</button>
        </form>

        <p
          v-if="!selectedTrip.activities.length"
          style="margin: 0; color: var(--acme-color-text-muted)"
        >
          Nothing planned yet. Add the first thing above.
        </p>

        <div
          v-for="group in byDay"
          :key="group.day"
          class="acme-card"
          style="padding: var(--acme-space-2) var(--acme-space-4) var(--acme-space-4)"
        >
          <div
            style="
              display: flex;
              align-items: baseline;
              justify-content: space-between;
              padding: var(--acme-space-3) 0;
            "
          >
            <h3 style="margin: 0; font-size: var(--acme-text-lg)">Day {{ group.day }}</h3>
            <span style="font-variant-numeric: tabular-nums; color: var(--acme-color-text-muted)">{{
              group.total
            }}</span>
          </div>
          <table class="acme-table">
            <tbody>
              <tr v-for="a in group.activities" :key="a.id">
                <td
                  style="
                    width: 5rem;
                    font-variant-numeric: tabular-nums;
                    color: var(--acme-color-text-muted);
                  "
                >
                  {{ a.time }}
                </td>
                <td>{{ a.title }}</td>
                <td class="acme-table__num" style="width: 6rem; font-weight: 600">
                  {{ currency.money(a.cost) }}
                </td>
                <td style="width: 5rem; text-align: end">
                  <button
                    type="button"
                    class="acme-btn acme-btn--ghost acme-btn--sm"
                    @click="planner.removeActivity(selectedTrip!.id, a.id)"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div
        v-else
        class="acme-card"
        style="padding: var(--acme-space-16) var(--acme-space-6); text-align: center"
      >
        <h2 style="margin: 0 0 var(--acme-space-2); font-size: var(--acme-text-xl)">
          No trip selected
        </h2>
        <p style="margin: 0 0 var(--acme-space-5); color: var(--acme-color-text-muted)">
          Pick a trip on the left, or start one from a destination guide.
        </p>
        <RouterLink to="/destinations" class="acme-btn acme-btn--secondary"
          >Find a destination</RouterLink
        >
      </div>
    </div>
  </main>
</template>
