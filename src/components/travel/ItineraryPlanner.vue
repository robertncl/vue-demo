<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { Trip } from '@/types/travel'

const props = defineProps<{
  trip: Trip
  spentAmount: number
  remainingBudget: number
  durationDays: number
}>()

const emit = defineEmits<{
  addActivity: [payload: { day: number; time: string; title: string; cost: number }]
  removeActivity: [id: string]
}>()

const newActivity = reactive({
  day: 1,
  time: '09:00',
  title: '',
  cost: 0,
})

const budgetStatus = computed(() => (props.remainingBudget < 0 ? 'over' : 'ok'))

const activitiesByDay = computed(() => {
  const grouped = new Map<number, Trip['activities']>()
  for (const activity of props.trip.activities) {
    const list = grouped.get(activity.day) ?? []
    list.push(activity)
    grouped.set(activity.day, list)
  }
  return [...grouped.entries()].sort(([a], [b]) => a - b)
})

function submit() {
  if (!newActivity.title) return
  emit('addActivity', { ...newActivity })
  newActivity.title = ''
  newActivity.cost = 0
}
</script>

<template>
  <section class="itinerary">
    <header>
      <h2>{{ trip.destination }}</h2>
      <p v-if="durationDays > 0">{{ durationDays }} day trip</p>
    </header>

    <div class="budget" :class="budgetStatus">
      Budget ${{ trip.budget }} · Spent ${{ spentAmount }} ·
      <span>{{ remainingBudget < 0 ? 'Over by' : 'Remaining' }} ${{ Math.abs(remainingBudget) }}</span>
    </div>

    <form class="activity-form" @submit.prevent="submit">
      <input v-model="newActivity.title" type="text" placeholder="Activity (e.g. Fushimi Inari hike)" required />
      <input v-model.number="newActivity.day" type="number" min="1" title="Day" />
      <input v-model="newActivity.time" type="time" />
      <input v-model.number="newActivity.cost" type="number" min="0" step="5" title="Cost" />
      <button type="submit">Add</button>
    </form>

    <div v-if="activitiesByDay.length === 0" class="empty">No activities planned yet.</div>
    <div v-for="[day, activities] in activitiesByDay" :key="day" class="day-group">
      <h3>Day {{ day }}</h3>
      <ul>
        <li v-for="activity in activities" :key="activity.id">
          <span class="time">{{ activity.time }}</span>
          <span class="title">{{ activity.title }}</span>
          <span class="cost">${{ activity.cost }}</span>
          <button class="remove" type="button" @click="emit('removeActivity', activity.id)">✕</button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.itinerary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.budget {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: var(--color-background-soft);
}

.budget.over {
  color: #d9534f;
  font-weight: 600;
}

.activity-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.activity-form input {
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-soft);
  color: var(--color-text);
}

.activity-form input[type='text'] {
  flex: 1;
  min-width: 180px;
}

.activity-form button {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 4px;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  cursor: pointer;
}

.day-group h3 {
  margin-bottom: 0.4rem;
}

.day-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.day-group li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.time {
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.title {
  flex: 1;
}

.remove {
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
}

.remove:hover {
  opacity: 1;
}

.empty {
  opacity: 0.7;
}
</style>
