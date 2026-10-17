<script setup lang="ts">
import { computed, ref } from 'vue'
import PopoverPanel from './PopoverPanel.vue'
import { passengersValid, travellerCount } from '@/lib/flightSearch'
import { useI18n } from '@/i18n'
import type { Passengers } from '@/types/flights'

const model = defineModel<Passengers>({ required: true })

const { t, plural } = useI18n()
const popover = ref<InstanceType<typeof PopoverPanel> | null>(null)

type Kind = keyof Passengers
const kinds: Kind[] = ['adults', 'children', 'infants']

const summary = computed(() => plural('search.travellers', travellerCount(model.value)))

/** A change is allowed only if the party it produces is still bookable. */
function canChange(kind: Kind, delta: number) {
  return passengersValid({ ...model.value, [kind]: model.value[kind] + delta })
}

function change(kind: Kind, delta: number) {
  if (canChange(kind, delta)) model.value = { ...model.value, [kind]: model.value[kind] + delta }
}
</script>

<template>
  <PopoverPanel ref="popover" :label="summary" :panel-label="t('search.travellersLabel')">
    <ul class="rows">
      <li v-for="kind in kinds" :key="kind" class="row">
        <div>
          <p class="name">{{ t(`search.${kind}`) }}</p>
          <p class="hint">{{ t(`search.${kind}Hint`) }}</p>
        </div>
        <div class="stepper">
          <button
            class="acme-btn acme-btn--secondary acme-btn--sm step"
            type="button"
            :disabled="!canChange(kind, -1)"
            :aria-label="t(`search.remove_${kind}`)"
            @click="change(kind, -1)"
          >
            −
          </button>
          <output class="count num" aria-live="polite">{{ model[kind] }}</output>
          <button
            class="acme-btn acme-btn--secondary acme-btn--sm step"
            type="button"
            :disabled="!canChange(kind, 1)"
            :aria-label="t(`search.add_${kind}`)"
            @click="change(kind, 1)"
          >
            +
          </button>
        </div>
      </li>
    </ul>
    <p class="acme-help limit">{{ t('search.passengerLimit') }}</p>
    <button class="acme-btn acme-btn--secondary acme-btn--sm done" type="button" @click="popover?.close()">
      {{ t('search.done') }}
    </button>
  </PopoverPanel>
</template>

<style scoped>
.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--acme-space-3);
  min-width: 260px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--acme-space-4);
}

.name {
  margin: 0;
  font-size: var(--acme-text-sm);
  font-weight: 600;
}

.hint {
  margin: 0;
  font-size: var(--acme-text-xs);
  color: var(--acme-color-text-muted);
}

.stepper {
  display: flex;
  align-items: center;
  gap: var(--acme-space-2);
}

.step {
  inline-size: 2rem;
  padding: 0;
  font-size: var(--acme-text-md);
}

.count {
  min-inline-size: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.limit {
  margin: 0;
}

.done {
  align-self: flex-end;
}
</style>
