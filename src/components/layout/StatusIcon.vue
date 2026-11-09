<script setup lang="ts">
/**
 * ACME's four status glyphs: inline SVG on a 24px grid, 2px round stroke,
 * currentColor. Alerts colour them through --acme-alert-icon, so status reads
 * from the icon's shape as well as its hue. Decorative: the alert's title
 * carries the meaning for assistive tech.
 */
defineProps<{
  status: 'success' | 'warning' | 'danger' | 'info'
}>()
</script>

<template>
  <svg
    class="acme-status-icon"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="status === 'success'">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </template>
    <template v-else-if="status === 'warning'">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </template>
    <template v-else-if="status === 'danger'">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </template>
  </svg>
</template>
