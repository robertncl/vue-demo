<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/i18n'
import StatusIcon from '@/components/common/StatusIcon.vue'
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
        {{ t('common.range', { from: trip.startDate, to: trip.endDate }) }}
        <template v-if="durationDays > 0">
          · {{ t('planner.dayTrip', { count: durationDays }) }}
        </template>
      </p>
    </header>

    <div class="mod-card budget" :class="{ over: overBudget }">
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

      <div v-if="overBudget" class="mod-alert mod-alert--danger" role="alert">
        <span class="mod-alert__icon"><StatusIcon variant="danger" /></span>
        <div>
          <p class="mod-alert__title">{{ t('planner.overTitle') }}</p>
          <p>{{ t('planner.overBody', { amount: money(Math.abs(remainingBudget)) }) }}</p>
        </div>
      </div>
    </div>

    <form class="mod-card activity-form" @submit.prevent="submit">
      <div class="mod-field grow">
        <label class="mod-label" for="a-title">{{ t('planner.activityTitle') }}</label>
        <input
          id="a-title"
          v-model="newActivity.title"
          class="mod-input"
          type="text"
          :placeholder="t('planner.activityPlaceholder')"
          required
        />
      </div>
      <div class="mod-field narrow">
        <label class="mod-label" for="a-day">{{ t('planner.day') }}</label>
        <input
          id="a-day"
          v-model.number="newActivity.day"
          class="mod-input"
          type="number"
          min="1"
        />
      </div>
      <div class="mod-field narrow">
        <label class="mod-label" for="a-time">{{ t('planner.time') }}</label>
        <input id="a-time" v-model="newActivity.time" class="mod-input" type="time" />
      </div>
      <div class="mod-field narrow">
        <label class="mod-label" for="a-cost">{{ t('planner.cost') }}</label>
        <input
          id="a-cost"
          v-model.number="cost"
          class="mod-input"
          type="number"
          min="0"
          step="1"
        />
      </div>
      <button class="mod-btn mod-btn--primary" type="submit">{{ t('planner.add') }}</button>
    </form>

    <p v-if="trip.activities.length === 0" class="empty muted">{{ t('planner.empty') }}</p>

    <div
      v-for="[day, activities] in activitiesByDay"
      :key="day"
      class="mod-card table-card day-group"
    >
      <div class="day-head">
        <h3>{{ t('planner.dayLabel', { n: day }) }}</h3>
        <span class="num muted">{{ money(dayTotal(activities)) }}</span>
      </div>
      <table class="mod-table">
        <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td class="time num">{{ activity.time }}</td>
            <td>{{ activity.title }}</td>
            <td class="mod-table__num cost">{{ money(activity.cost) }}</td>
            <td class="row-action">
              <button
                class="mod-btn mod-btn--ghost mod-btn--sm remove"
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
  gap: var(--mod-space-5);
  border-top: var(--mod-stroke-rule) solid var(--mod-ink);
  padding-top: var(--mod-space-3);
}

.head h2 {
  margin: var(--mod-space-2) 0 var(--mod-space-1);
  font-size: var(--mod-size-heading-1);
  line-height: 1;
  letter-spacing: var(--mod-tracking-heading-1);
}

.dates {
  margin: 0;
  color: var(--mod-ink-2);
}

/* Budget figures sit in paper-2 wells, side by side, no box around them. */
.budget {
  border-top: 0;
  padding: 0;
  gap: var(--mod-space-3);
}

.figures {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.figures > * {
  flex: 1 1 160px;
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-2);
  padding: var(--mod-space-3);
  background: var(--mod-paper-2);
}

.figure-label {
  margin: 0;
  font-size: var(--mod-size-label);
  font-weight: 600;
  letter-spacing: var(--mod-tracking-label);
  text-transform: uppercase;
  color: var(--mod-ink-2);
}

.figure {
  margin: 0;
  font-size: var(--mod-size-heading-1);
  line-height: 1;
  font-weight: 700;
  letter-spacing: var(--mod-tracking-heading-1);
}

.figure.danger {
  color: var(--mod-status-danger);
}

.bar {
  height: 8px;
  background: var(--mod-paper-2);
  border: 1px solid var(--mod-rule);
  border-radius: var(--mod-radius-none);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: var(--mod-data-highlight);
}

.budget.over .bar span {
  background: var(--mod-status-danger);
}

.activity-form {
  border-top: 0;
  padding: 0;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--mod-space-3);
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

.activity-form .mod-input {
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
  padding: var(--mod-space-3) 0;
}

.day-head h3 {
  margin: 0;
  font-size: var(--mod-size-heading-3);
}

.time {
  width: 5rem;
  color: var(--mod-ink-2);
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
