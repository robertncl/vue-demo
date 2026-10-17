<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { useI18n } from '@/i18n'

/**
 * A native modal <dialog>: the browser traps focus, closes on Escape and hands
 * focus back to the opener. Content renders only while open, so expensive
 * slots (the date grid, the price graph) cost nothing until asked for.
 */
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)
const isOpen = ref(false)
const titleId = `dialog-${useId()}`

async function open() {
  isOpen.value = true
  await nextTick()
  const el = dialog.value
  if (!el || el.open) return
  if (typeof el.showModal === 'function') el.showModal()
  else el.setAttribute('open', '')
}

function close() {
  const el = dialog.value
  if (el && typeof el.close === 'function' && el.open) el.close()
  else onClosed()
}

function onClosed() {
  dialog.value?.removeAttribute('open')
  isOpen.value = false
  emit('close')
}

/** The dialog box has no padding of its own, so a click on it is a click on the backdrop. */
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}

defineExpose({ open, close })
</script>

<template>
  <dialog ref="dialog" class="modal" :aria-labelledby="titleId" @close="onClosed" @click="onClick">
    <div v-if="isOpen" class="frame">
      <header class="head">
        <h2 :id="titleId">{{ title }}</h2>
        <button
          class="acme-btn acme-btn--ghost acme-btn--sm close"
          type="button"
          :aria-label="t('common.close')"
          @click="close"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>
      </header>
      <slot :close="close" />
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  inline-size: min(820px, calc(100vw - 32px));
  max-block-size: calc(100vh - 32px);
  padding: 0;
  border: 1px solid var(--acme-color-border);
  border-radius: var(--acme-radius-xl);
  background: var(--acme-color-surface-raised);
  color: var(--acme-color-text);
  box-shadow: var(--acme-shadow-lg);
}

.modal::backdrop {
  background: rgb(17 26 43 / 0.4);
}

.frame {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-4);
  padding: var(--acme-space-6);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--acme-space-4);
}

.head h2 {
  margin: 0;
  font-size: var(--acme-text-2xl);
}
</style>
