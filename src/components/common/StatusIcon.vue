<script setup lang="ts">
/**
 * ACME's four status glyphs, drawn on a 24px grid with a 2px round stroke in
 * currentColor — the same paths the design system's Badge and Alert render.
 * An alert always carries one, so its status reads without colour (WCAG 1.4.1).
 */
export type Status = 'success' | 'warning' | 'danger' | 'info'

const props = withDefaults(defineProps<{ variant: Status; size?: number }>(), { size: 16 })

const PATHS: Record<Status, string[]> = {
  success: ['M20 6 9 17l-5-5'],
  warning: ['M12 3 2 20h20L12 3z', 'M12 10v4', 'M12 17h.01'],
  danger: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M15 9l-6 6', 'M9 9l6 6'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16v-4', 'M12 8h.01'],
}
</script>

<template>
  <svg
    class="acme-status-icon"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="d in PATHS[props.variant]" :key="d" :d="d" />
  </svg>
</template>
