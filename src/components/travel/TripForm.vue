<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/i18n'
import type { TripDraft } from '@/types/travel'

const props = defineProps<{
  /** Pre-fills the form, e.g. when arriving from a destination page. Money is in USD. */
  prefill?: Partial<TripDraft> | null
}>()

const emit = defineEmits<{
  create: [payload: TripDraft]
}>()

const settings = useSettingsStore()
const { t } = useI18n()

const DEFAULT_BUDGET_USD = 500

const form = reactive({
  destination: '',
  startDate: '',
  endDate: '',
})

/** Held in the display currency; converted to USD on submit. */
const budget = ref(Math.round(settings.fromBase(DEFAULT_BUDGET_USD)))
/** The USD value the budget field currently represents, so it can be re-converted. */
const budgetBase = ref(DEFAULT_BUDGET_USD)

watch(budget, (value) => {
  budgetBase.value = settings.toBase(value)
})

// Switching currency re-denominates the amount rather than changing its real value.
watch(
  () => settings.currency,
  () => {
    budget.value = Math.round(settings.fromBase(budgetBase.value))
  },
)

watch(
  () => props.prefill,
  (prefill) => {
    if (!prefill) return
    if (prefill.destination) form.destination = prefill.destination
    if (prefill.startDate) form.startDate = prefill.startDate
    if (prefill.endDate) form.endDate = prefill.endDate
    if (prefill.budget) {
      budgetBase.value = prefill.budget
      budget.value = Math.round(settings.fromBase(prefill.budget))
    }
  },
  { immediate: true },
)

function submit() {
  if (!form.destination || !form.startDate || !form.endDate) return
  emit('create', {
    destination: form.destination,
    startDate: form.startDate,
    endDate: form.endDate,
    budget: settings.toBase(budget.value),
  })
  form.destination = ''
  form.startDate = ''
  form.endDate = ''
  budgetBase.value = DEFAULT_BUDGET_USD
  budget.value = Math.round(settings.fromBase(DEFAULT_BUDGET_USD))
}
</script>

<template>
  <form class="trip-form card" @submit.prevent="submit">
    <h2>{{ t('trips.formTitle') }}</h2>

    <div class="field">
      <label for="destination">{{ t('trips.destination') }}</label>
      <input
        id="destination"
        v-model="form.destination"
        type="text"
        :placeholder="t('trips.destinationPlaceholder')"
        required
      />
    </div>

    <div class="field-row">
      <div class="field">
        <label for="startDate">{{ t('trips.startDate') }}</label>
        <input id="startDate" v-model="form.startDate" type="date" required />
      </div>
      <div class="field">
        <label for="endDate">{{ t('trips.endDate') }}</label>
        <input id="endDate" v-model="form.endDate" type="date" required />
      </div>
    </div>

    <div class="field">
      <label for="budget">{{ t('trips.budget', { currency: settings.currency }) }}</label>
      <input id="budget" v-model.number="budget" type="number" min="0" step="50" />
    </div>

    <button class="btn" type="submit">{{ t('trips.addTrip') }}</button>
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
