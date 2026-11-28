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
  <form class="mod-card trip-form" @submit.prevent="submit">
    <h2>{{ t('trips.formTitle') }}</h2>

    <div class="mod-field">
      <label class="mod-label" for="destination">{{ t('trips.destination') }}</label>
      <input
        id="destination"
        v-model="form.destination"
        class="mod-input"
        type="text"
        :placeholder="t('trips.destinationPlaceholder')"
        required
      />
    </div>

    <div class="field-row">
      <div class="mod-field">
        <label class="mod-label" for="startDate">{{ t('trips.startDate') }}</label>
        <input id="startDate" v-model="form.startDate" class="mod-input" type="date" required />
      </div>
      <div class="mod-field">
        <label class="mod-label" for="endDate">{{ t('trips.endDate') }}</label>
        <input id="endDate" v-model="form.endDate" class="mod-input" type="date" required />
      </div>
    </div>

    <div class="mod-field">
      <label class="mod-label" for="budget">
        {{ t('trips.budget', { currency: settings.currency }) }}
      </label>
      <input
        id="budget"
        v-model.number="budget"
        class="mod-input"
        type="number"
        min="0"
        step="1"
      />
      <p class="mod-help">{{ t('settings.rateNote') }}</p>
    </div>

    <button class="mod-btn submit" type="submit">
      {{ t('trips.addTrip') }}
    </button>
  </form>
</template>

<style scoped>
.trip-form {
  display: flex;
  flex-direction: column;
  gap: var(--mod-space-3);
  padding: var(--mod-space-3) 0 0;
}

.trip-form h2 {
  margin: 0;
}

/* Two dates side by side when there is room for a whole date in each;
   stacked when the column is narrower. */
.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: var(--mod-space-3);
}

.field-row .mod-input {
  min-width: 0;
  width: 100%;
}

/* One blue button per view belongs to the itinerary; this one is secondary. */
.submit {
  align-self: flex-start;
}

.field-row .mod-input {
  padding-inline: var(--mod-space-2);
}
</style>
