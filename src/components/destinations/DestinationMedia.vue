<script setup lang="ts">
/**
 * Stands in for the design's <image-slot>: the place a destination photograph
 * goes. The app ships no photography, so the slot renders as the design system
 * specifies an unfilled one — a flat `surface` panel naming its subject. No
 * gradient, texture or emoji, per the ACME imagery rules.
 */
defineProps<{
  /** What the photograph would show, e.g. "Photo of Kyoto". */
  label: string
  /** Overrides the 16:9 media ratio, e.g. "21 / 9" for the hero card. */
  ratio?: string
}>()
</script>

<template>
  <div class="acme-card__media media" :style="ratio ? { aspectRatio: ratio } : undefined">
    <span class="hint">{{ label }}</span>
  </div>
</template>

<style scoped>
.media {
  padding: var(--acme-space-4);
  text-align: center;
}

.hint {
  font-size: var(--acme-text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--acme-color-text-subtle);
}
</style>
