<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue'

/**
 * A button that opens a light-dismiss panel beneath it, built on the native
 * Popover API (polyfilled in main.ts where missing). The browser handles
 * Escape, outside clicks and the top layer; this component only places the
 * panel, since CSS anchor positioning isn't Baseline yet.
 */
defineProps<{
  /** The button's visible text. */
  label: string
  /** Names the panel for assistive tech; defaults to the button text. */
  panelLabel?: string
  /** Marks the trigger as holding a non-default value, e.g. an active filter. */
  active?: boolean
}>()

const id = `popover-${useId()}`
const button = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const open = ref(false)

const GAP = 6
const EDGE = 8

function place() {
  const trigger = button.value
  const el = panel.value
  if (!trigger || !el) return
  const rect = trigger.getBoundingClientRect()
  const width = el.offsetWidth
  // Align with the trigger's start edge: its left in LTR, its right in RTL.
  const rtl = getComputedStyle(trigger).direction === 'rtl'
  const preferred = rtl ? rect.right - width : rect.left
  // clientWidth leaves out the page scrollbar, which innerWidth includes.
  const maxLeft = document.documentElement.clientWidth - width - EDGE
  const target = Math.max(EDGE, Math.min(preferred, maxLeft))
  el.style.left = `${target}px`
  el.style.top = `${rect.bottom + GAP}px`
  // A fixed element's `left: 0` isn't always the viewport's x = 0: in RTL pages
  // Chromium puts the scrollbar on the left and shifts the origin past it.
  // Measure where the panel landed and correct by the difference.
  const drift = el.getBoundingClientRect().left - target
  if (drift) el.style.left = `${target - drift}px`
}

function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener'
  window[method]('resize', place)
  window[method]('scroll', place, { capture: true })
}

function onToggle(event: Event) {
  open.value = (event as ToggleEvent).newState === 'open'
  if (open.value) place()
  listen(open.value)
}

function close() {
  if (panel.value && 'hidePopover' in panel.value && open.value) panel.value.hidePopover()
}

onBeforeUnmount(() => listen(false))

defineExpose({ close })
</script>

<template>
  <!-- The polyfill doesn't manage aria-expanded, so it is kept in sync here. -->
  <button
    ref="button"
    type="button"
    class="popover-trigger"
    :class="{ active }"
    :popovertarget="id"
    :aria-controls="id"
    :aria-expanded="open"
  >
    <slot name="trigger">{{ label }}</slot>
    <svg class="chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" />
    </svg>
  </button>
  <div
    :id="id"
    ref="panel"
    popover
    class="popover-panel"
    role="dialog"
    :aria-label="panelLabel ?? label"
    @toggle="onToggle"
  >
    <slot :close="close" />
  </div>
</template>

<style scoped>
.popover-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--acme-space-2);
  min-height: 2.25rem;
  padding: 0 var(--acme-space-3);
  border: 1px solid var(--acme-color-border-strong);
  border-radius: var(--acme-radius-md);
  background: var(--acme-color-surface-raised);
  font: 500 var(--acme-text-sm) / 1 var(--acme-font-sans);
  color: var(--acme-color-text);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--acme-duration-base) var(--acme-ease-out),
    border-color var(--acme-duration-base) var(--acme-ease-out);
}

.popover-trigger:hover {
  background: var(--acme-color-surface);
}

/* An active filter is orientation, so it takes the selection treatment. */
.popover-trigger.active {
  border-color: var(--acme-color-selected);
  background: var(--acme-color-selected-soft);
  color: var(--acme-color-selected);
  font-weight: 600;
}

.chevron {
  flex: none;
  color: var(--acme-color-text-muted);
}

.popover-panel {
  /* Overrides the UA's centred popover so place() can anchor it. */
  position: fixed;
  inset: auto;
  margin: 0;
  width: max-content;
  max-width: min(360px, calc(100vw - 16px));
  max-height: min(480px, calc(100vh - 32px));
  overflow: auto;
  padding: var(--acme-space-4);
  border: 1px solid var(--acme-color-border);
  border-radius: var(--acme-radius-lg);
  background: var(--acme-color-surface-raised);
  color: var(--acme-color-text);
  box-shadow: var(--acme-shadow-lg);
}

/* Display is only set on the open state so the closed popover stays hidden. */
.popover-panel:is(:popover-open, .\:popover-open) {
  display: flex;
  flex-direction: column;
  gap: var(--acme-space-3);
}
</style>
