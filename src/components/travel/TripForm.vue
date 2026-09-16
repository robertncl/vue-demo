<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { TripDraft } from '@/types/travel'

const props = defineProps<{
  /** Pre-fills the form, e.g. when arriving from a destination page. */
  prefill?: Partial<TripDraft> | null
}>()

const emit = defineEmits<{
  create: [payload: TripDraft]
}>()

const form = reactive<TripDraft>({
  destination: '',
  startDate: '',
  endDate: '',
  budget: 500,
})

watch(
  () => props.prefill,
  (prefill) => {
    if (!prefill) return
    if (prefill.destination) form.destination = prefill.destination
    if (prefill.startDate) form.startDate = prefill.startDate
    if (prefill.endDate) form.endDate = prefill.endDate
    if (prefill.budget) form.budget = prefill.budget
  },
  { immediate: true },
)

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
  <form class="trip-form card" @submit.prevent="submit">
    <h2>Plan a new trip</h2>

    <div class="field">
      <label for="destination">Destination</label>
      <input
        id="destination"
        v-model="form.destination"
        type="text"
        placeholder="Kyoto, Japan"
        required
      />
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

    <button class="btn" type="submit">Add trip</button>
  </form>
</template>

<style scoped>
.trip-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem;
}

.trip-form h2 {
  font-size: 1.05rem;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.field-row .field {
  flex: 1;
}

.trip-form .btn {
  align-self: flex-start;
  margin-top: 0.25rem;
}
</style>
