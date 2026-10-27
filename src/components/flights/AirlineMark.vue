<script setup lang="ts">
/**
 * Stands in for an airline logo: the carrier code on a flat Slate tile. ACME
 * allows no third-party colour, and the airlines are fictional anyway. The
 * airline's name is always printed beside it, so the mark is decorative.
 */
defineProps<{
  codes: string[]
}>()
</script>

<template>
  <span class="mark" :class="{ multi: codes.length > 1 }" aria-hidden="true">
    <span class="code">{{ codes[0] }}</span>
    <span v-if="codes.length > 1" class="more num" dir="ltr">+{{ codes.length - 1 }}</span>
  </span>
</template>

<style scoped>
.mark {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  inline-size: 2.25rem;
  block-size: 2.25rem;
  border: 1px solid var(--acme-color-border);
  border-radius: var(--acme-radius-md);
  background: var(--acme-color-surface);
  color: var(--acme-color-text-muted);
  font: 700 var(--acme-text-xs) / 1 var(--acme-font-sans);
  letter-spacing: 0.04em;
}

.more {
  position: absolute;
  inset-block-end: -0.4rem;
  inset-inline-end: -0.4rem;
  padding: 0 0.25rem;
  border-radius: var(--acme-radius-full);
  background: var(--acme-color-surface-raised);
  border: 1px solid var(--acme-color-border);
  font-size: 0.625rem;
  line-height: 1.4;
}
</style>
