<script setup lang="ts">
import { computed, reactive } from 'vue'
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

const newActivity = reactive<ActivityDraft>({
  day: 1,
  time: '09:00',
  title: '',
  cost: 0,
})

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

function submit() {
  if (!newActivity.title) return
  emit('addActivity', { ...newActivity })
  newActivity.title = ''
  newActivity.cost = 0
}
</script>

<template>
  <section class="itinerary">
    <header class="head">
      <div>
        <p class="eyebrow">Itinerary</p>
        <h2>{{ trip.destination }}</h2>
        <p class="muted">
          {{ trip.startDate }} → {{ trip.endDate }}
          <template v-if="durationDays > 0"> · {{ durationDays }} day trip</template>
        </p>
      </div>
    </header>

    <div class="budget card" :class="{ over: overBudget }">
      <div class="budget-row">
        <span
          >Budget <strong>${{ trip.budget }}</strong></span
        >
        <span
          >Spent <strong>${{ spentAmount }}</strong></span
        >
        <span class="remaining">
          {{ overBudget ? 'Over by' : 'Remaining' }}
          <strong>${{ Math.abs(remainingBudget) }}</strong>
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
        placeholder="Activity (e.g. Fushimi Inari hike)"
        aria-label="Activity title"
        required
      />
      <input
        v-model.number="newActivity.day"
        type="number"
        min="1"
        :max="durationDays || undefined"
        title="Day"
        aria-label="Day"
      />
      <input v-model="newActivity.time" type="time" title="Time" aria-label="Time" />
      <input
        v-model.number="newActivity.cost"
        type="number"
        min="0"
        step="5"
        title="Cost"
        aria-label="Cost"
      />
      <button class="btn" type="submit">Add</button>
    </form>

    <p v-if="activitiesByDay.length === 0" class="empty muted">
      No activities planned yet. Add the first one above.
    </p>

    <div v-for="[day, activities] in activitiesByDay" :key="day" class="day-group">
      <div class="day-head">
        <h3>Day {{ day }}</h3>
        <span class="muted">${{ dayTotal(activities) }}</span>
      </div>
      <ul>
        <li v-for="activity in activities" :key="activity.id" class="card">
          <span class="time">{{ activity.time }}</span>
          <span class="title">{{ activity.title }}</span>
          <span class="cost">${{ activity.cost }}</span>
          <button
            class="icon-btn remove"
            type="button"
            :aria-label="`Remove ${activity.title}`"
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
  width: 84px;
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
