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
      <div>
        <p class="eyebrow">{{ t('planner.eyebrow') }}</p>
        <h2>{{ trip.destination }}</h2>
        <p class="muted">
          {{ trip.startDate }} → {{ trip.endDate }}
          <template v-if="durationDays > 0">
            · {{ t('planner.dayTrip', { count: durationDays }) }}
          </template>
        </p>
      </div>
    </header>

    <div class="budget card" :class="{ over: overBudget }">
      <div class="budget-row">
        <span
          >{{ t('planner.budget') }} <strong>{{ money(trip.budget) }}</strong></span
        >
        <span
          >{{ t('planner.spent') }} <strong>{{ money(spentAmount) }}</strong></span
        >
        <span class="remaining">
          {{ overBudget ? t('planner.overBy') : t('planner.remaining') }}
          <strong>{{ money(Math.abs(remainingBudget)) }}</strong>
        </span>
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
    </div>

    <form class="activity-form card" @submit.prevent="submit">
      <input
        v-model="newActivity.title"
        type="text"
        :placeholder="t('planner.activityPlaceholder')"
        :aria-label="t('planner.activityTitle')"
        required
      />
      <input
        v-model.number="newActivity.day"
        type="number"
        min="1"
        :max="durationDays || undefined"
        :title="t('planner.day')"
        :aria-label="t('planner.day')"
      />
      <input
        v-model="newActivity.time"
        type="time"
        :title="t('planner.time')"
        :aria-label="t('planner.time')"
      />
      <input
        v-model.number="cost"
        type="number"
        min="0"
        step="5"
        :title="`${t('planner.cost')} (${settings.currency})`"
        :aria-label="`${t('planner.cost')} (${settings.currency})`"
      />
      <button class="btn" type="submit">{{ t('planner.add') }}</button>
    </form>

    <p v-if="activitiesByDay.length === 0" class="empty muted">{{ t('planner.empty') }}</p>

    <div v-for="[day, activities] in activitiesByDay" :key="day" class="day-group">
      <div class="day-head">
        <h3>{{ t('planner.dayLabel', { n: day }) }}</h3>
        <span class="muted">{{ money(dayTotal(activities)) }}</span>
      </div>
      <ul>
        <li v-for="activity in activities" :key="activity.id" class="card">
          <span class="time">{{ activity.time }}</span>
          <span class="title">{{ activity.title }}</span>
          <span class="cost">{{ money(activity.cost) }}</span>
          <button
            class="icon-btn remove"
            type="button"
            :aria-label="t('planner.removeActivity', { name: activity.title })"
            @click="emit('removeActivity', activity.id)"
          >
            ✕
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.itinerary {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.head h2 {
  margin-top: 0.15rem;
}

.budget {
  padding: 0.9rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.budget-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: var(--c-muted);
}

.budget-row strong {
  color: var(--c-heading);
}

.budget.over .remaining,
.budget.over .remaining strong {
  color: var(--c-danger);
}

.bar {
  height: 7px;
  border-radius: 999px;
  background: var(--c-surface-soft);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: var(--c-brand);
  transition: width 0.3s ease;
}

.budget.over .bar span {
  background: var(--c-danger);
}

.activity-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.85rem;
}

.activity-form input[type='text'] {
  flex: 1;
  min-width: 180px;
}

.activity-form input[type='number'] {
  width: 90px;
}

.activity-form input[type='time'] {
  width: 120px;
}

.day-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.day-group ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.day-group li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
}

.time {
  color: var(--c-muted);
  font-variant-numeric: tabular-nums;
  font-size: 0.875rem;
}

.title {
  flex: 1;
  min-width: 0;
}

.cost {
  font-weight: 650;
  color: var(--c-heading);
  font-variant-numeric: tabular-nums;
}
</style>
