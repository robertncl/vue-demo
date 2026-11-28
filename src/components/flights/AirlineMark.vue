<script setup lang="ts">
/**
 * Stands in for an airline logo: the carrier code on a flat paper-2 well. Modernist
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
  border: 1px solid var(--mod-rule);
  border-radius: var(--mod-radius-none);
  background: var(--mod-paper-2);
  color: var(--mod-ink-2);
  font: 600 var(--mod-size-label) / 1 var(--mod-font-sans);
  letter-spacing: 0.04em;
}

.more {
  position: absolute;
  inset-block-end: -0.4rem;
  inset-inline-end: -0.4rem;
  padding: 0 0.25rem;
  border-radius: var(--mod-radius-none);
  background: var(--mod-paper);
  border: 1px solid var(--mod-rule);
  font-size: 0.625rem;
  line-height: 1.4;
}
</style>
