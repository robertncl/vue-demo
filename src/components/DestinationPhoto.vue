<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  gradient: [string, string]
  emoji: string
  label: string
}>()

const style = computed(() => ({
  background: `linear-gradient(135deg, ${props.gradient[0]}, ${props.gradient[1]})`,
}))
</script>

<template>
  <div class="photo" :style="style" role="img" :aria-label="label">
    <span class="photo__emoji" aria-hidden="true">{{ emoji }}</span>
  </div>
</template>

<style scoped>
.photo {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.photo__emoji {
  font-size: 3rem;
  filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.25));
}
</style>
