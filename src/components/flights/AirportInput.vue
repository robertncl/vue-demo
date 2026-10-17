<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { airports, airportLabel, findAirport, resolveAirport } from '@/data/airports'
import { useI18n } from '@/i18n'

/**
 * A text field with a native <datalist> of every airport. The model is the
 * IATA code; the field accepts a code, a city or the "City (CODE)" label.
 */
const model = defineModel<string>({ default: '' })

const props = defineProps<{
  id: string
  name: string
  label: string
  placeholder?: string
  /** Set by the form after a failed submit. */
  invalid?: boolean
}>()

const { t } = useI18n()

function labelFor(code: string) {
  const airport = findAirport(code)
  return airport ? airportLabel(airport) : ''
}

const text = ref(labelFor(model.value))
/** Errors show once you leave the field, not while you are typing. */
const touched = ref(false)
/** The code this field last emitted, so its own echo doesn't overwrite what you're typing. */
let emitted: string | null = null

// Follow changes made from outside (a swap, a refill). Mid-word, typing passes
// through codes that don't resolve ("London (" between "London" and "LHR"), and
// those must not reset the text.
watch(model, (code) => {
  if (code === emitted) return
  emitted = null
  if (resolveAirport(text.value)?.code !== code) text.value = labelFor(code)
})

function onInput() {
  touched.value = false
  emitted = resolveAirport(text.value)?.code ?? ''
  model.value = emitted
}

function onBlur() {
  touched.value = true
  const airport = resolveAirport(text.value)
  if (airport) text.value = airportLabel(airport)
}

const unknown = computed(() => touched.value && text.value.trim() !== '' && !model.value)
const showError = computed(() => unknown.value || props.invalid)
const listId = computed(() => `${props.id}-airports`)
const errorId = computed(() => `${props.id}-error`)
</script>

<template>
  <div class="acme-field airport-field">
    <label class="acme-label" :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="text"
      class="acme-input"
      type="text"
      :name="name"
      :list="listId"
      :placeholder="placeholder"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :aria-invalid="showError"
      :aria-describedby="showError ? errorId : undefined"
      @input="onInput"
      @blur="onBlur"
    />
    <datalist :id="listId">
      <option v-for="airport in airports" :key="airport.code" :value="airportLabel(airport)">
        {{ airport.name }}, {{ airport.country }}
      </option>
    </datalist>
    <p v-if="showError" :id="errorId" class="acme-error">
      {{ unknown ? t('search.unknownAirport') : t('search.pickAirport') }}
    </p>
  </div>
</template>

<style scoped>
.airport-field {
  min-width: 0;
}

.airport-field .acme-input {
  width: 100%;
  min-width: 0;
}

.acme-error {
  margin: 0;
}
</style>
