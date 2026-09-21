<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <AppHeader />

  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <AppFooter />
</template>

<style scoped>
/* ACME motion: opacity and a 6px translate only, ease-out, nothing overshoots. */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity var(--acme-duration-slow) var(--acme-ease-out),
    transform var(--acme-duration-slow) var(--acme-ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
