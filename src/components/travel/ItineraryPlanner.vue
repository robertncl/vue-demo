<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/i18n'
import type { ActivityDraft, Trip } from '@/types/travel'

const props = defineProps<{
  trip: Trip
  spentAmount: number
  remainingBudget: number
  durationDays: number
  budgetUsedPercent: number
}>()

const emit = defineEmits<{
  addActivity: [payload: ActivityDraft]
  removeActivity: [id: string]
}>()

const settings = useSettingsStore()
const { t, money } = useI18n()

const newActivity = reactive({
  day: 1,
  time: '09:00',
  title: '',
})

/** Held in the display currency; converted to USD when emitted. */
const cost = ref(0)

const overBudget = computed(() => props.remainingBudget < 0)

const activitiesByDay = computed(() => {
  const grouped = new Map<number, Trip['activities']>()
  for (const activity of props.trip.activities) {
    const list = grouped.get(activity.day) ?? []
    list.push(activity)
    grouped.set(activity.day, list)
  }
  return [...grouped.entries()].sort(([a], [b]) => a - b)
})

function dayTotal(activities: Trip['activities']) {
  return activities.reduce((sum, activity) => sum + activity.cost, 0)
}

// Clear a half-entered cost when the currency changes, so the number never lies.
watch(
  () => settings.currency,
  () => {
    cost.value = 0
  },
)

function submit() {
  if (!newActivity.title) return
  emit('addActivity', {
    day: newActivity.day,
    time: newActivity.time,
    title: newActivity.title,
    cost: settings.toBase(cost.value),
  })
  newActivity.title = ''
  cost.value = 0
}
</script>

<template>
  <section class="itinerary">
    <header class="head">
      <p class="kicker">{{ t('planner.eyebrow') }}</p>
      <h2>{{ trip.destination }}</h2>
      <p class="dates num">
        {{ trip.startDate }} → {{ trip.endDate }}
        <template v-if="durationDays > 0">
          · {{ t('planner.dayTrip', { count: durationDays }) }}
        </template>
      </p>
    </header>

    <div class="acme-card budget" :class="{ over: overBudget }">
      <div class="figures">
        <div>
          <p class="figure-label">{{ t('planner.budget') }}</p>
          <p class="figure num">{{ money(trip.budget) }}</p>
        </div>
        <div>
          <p class="figure-label">{{ t('planner.spent') }}</p>
          <p class="figure num">{{ money(spentAmount) }}</p>
        </div>
        <div>
          <p class="figure-label">
            {{ overBudget ? t('planner.overBy') : t('planner.remaining') }}
          </p>
          <p class="figure num" :class="{ danger: overBudget }">
            {{ money(Math.abs(remainingBudget)) }}
          </p>
        </div>
      </div>

      <div
        class="bar"
        role="progressbar"
        :aria-valuenow="budgetUsedPercent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span :style="{ width: `${budgetUsedPercent}%` }"></span>
      </div>

      <div v-if="overBudget" class="acme-alert acme-alert--danger">
        <div>
          <p class="acme-alert__title">{{ t('planner.overTitle') }}</p>
          <p>{{ t('planner.overBody', { amount: money(Math.abs(remainingBudget)) }) }}</p>
        </div>
      </div>
    </div>

    <form class="acme-card activity-form" @submit.prevent="submit">
      <div class="acme-field grow">
        <label class="acme-label" for="a-title">{{ t('planner.activityTitle') }}</label>
        <input
          id="a-title"
          v-model="newActivity.title"
          class="acme-input"
          type="text"
          :placeholder="t('planner.activityPlaceholder')"
          required
        />
      </div>
      <div class="acme-field narrow">
        <label class="acme-label" for="a-day">{{ t('planner.day') }}</label>
        <input
          id="a-day"
          v-model.number="newActivity.day"
          class="acme-input"
          type="number"
          min="1"
        />
      </div>
      <div class="acme-field narrow">
        <label class="acme-label" for="a-time">{{ t('planner.time') }}</label>
        <input id="a-time" v-model="newActivity.time" class="acme-input" type="time" />
      </div>
      <div class="acme-field narrow">
        <label class="acme-label" for="a-cost">{{ t('planner.cost') }}</label>
        <input
          id="a-cost"
          v-model.number="cost"
          class="acme-input"
          type="number"
          min="0"
          step="1"
        />
      </div>
      <button class="acme-btn acme-btn--primary" type="submit">{{ t('planner.add') }}</button>
    </form>

    <p v-if="trip.activities.length === 0" class="empty muted">{{ t('planner.empty') }}</p>

    <div
      v-for="[day, activities] in activitiesByDay"
      :key="day"
      class="acme-card table-card day-group"
    >
      <div class="day-head">
        <h3>{{ t('planner.dayLabel', { n: day }) }}</h3>
        <span class="num muted">{{ money(dayTotal(activities)) }}</span>
      </div>
      <table class="acme-table">
        <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td class="time num">{{ activity.time }}</td>
            <td>{{ activity.title }}</td>
            <td class="acme-table__num cost">{{ money(activity.cost) }}</td>
            <td class="row-action">
              <button
                class="acme-btn acme-btn--ghost acme-btn--sm remove"
                type="button"
                :aria-label="t('planner.removeActivity', { name: activity.title })"
                @click="emit('removeActivity', activity.id)"
              >
                {{ t('common.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.itinerary {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-5);
}

.head h2 {
  margin: var(--acme-space-1) 0 0;
  font-size: var(--acme-text-3xl);
}

.dates {
  margin: 0;
  color: var(--acme-color-text-muted);
}

.budget {
  padding: var(--acme-space-5);
  gap: var(--acme-space-3);
}

.figures {
  display: flex;
  gap: var(--acme-space-8);
  flex-wrap: wrap;
}

.figure-label {
  margin: 0;
  font-size: var(--acme-text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--acme-color-text-muted);
}

.figure {
  margin: 0;
  font-size: var(--acme-text-xl);
  font-weight: 600;
}

.figure.danger {
  color: var(--acme-color-danger);
}

.bar {
  height: 8px;
  background: var(--acme-color-surface);
  border: 1px solid var(--acme-color-border);
  border-radius: var(--acme-radius-sm);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: var(--acme-color-primary);
}

.budget.over .bar span {
  background: var(--acme-color-danger);
}

.activity-form {
  padding: var(--acme-space-4);
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--acme-space-3);
  align-items: flex-end;
}

.activity-form .grow {
  flex: 1 1 200px;
  min-width: 0;
}

.activity-form .narrow {
  flex: 0 1 110px;
  min-width: 0;
}

.activity-form .acme-input {
  min-width: 0;
  width: 100%;
}

.empty {
  margin: 0;
}

.day-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: var(--acme-space-3) 0;
}

.day-head h3 {
  margin: 0;
  font-size: var(--acme-text-lg);
}

.time {
  width: 5rem;
  color: var(--acme-color-text-muted);
}

.cost {
  width: 6rem;
  font-weight: 600;
}

.row-action {
  width: 6rem;
  text-align: end;
}
</style>
