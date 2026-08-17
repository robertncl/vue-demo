<script setup lang="ts">
import { reactive } from 'vue'

const emit = defineEmits<{
  create: [payload: { destination: string; startDate: string; endDate: string; budget: number }]
}>()

const form = reactive({
  destination: '',
  startDate: '',
  endDate: '',
  budget: 500,
})

function submit() {
  if (!form.destination || !form.startDate || !form.endDate) return
  emit('create', { ...form })
  form.destination = ''
  form.startDate = ''
  form.endDate = ''
  form.budget = 500
}
</script>

<template>
  <form class="trip-form" @submit.prevent="submit">
    <h2>Plan a new trip</h2>
    <div class="field">
      <label for="destination">Destination</label>
      <input id="destination" v-model="form.destination" type="text" placeholder="Kyoto, Japan" required />
    </div>
    <div class="field-row">
      <div class="field">
        <label for="startDate">Start date</label>
        <input id="startDate" v-model="form.startDate" type="date" required />
      </div>
      <div class="field">
        <label for="endDate">End date</label>
        <input id="endDate" v-model="form.endDate" type="date" required />
      </div>
    </div>
    <div class="field">
      <label for="budget">Budget (USD)</label>
      <input id="budget" v-model.number="form.budget" type="number" min="0" step="50" />
    </div>
    <button type="submit">Add trip</button>
  </form>
</template>

<style scoped>
.trip-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
}

input {
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-soft);
  color: var(--color-text);
}

button {
  align-self: flex-start;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 4px;
  background: var(--color-heading, hsla(160, 100%, 37%, 1));
  color: white;
  cursor: pointer;
}
</style>
