<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="page">
    <div class="container empty">
      <span class="mark" aria-hidden="true">🗺️</span>
      <h1>Off the map</h1>
      <p class="muted">That page doesn't exist. Let's get you back on the route.</p>
      <div class="actions">
        <RouterLink class="btn" to="/">Go home</RouterLink>
        <RouterLink class="btn btn-ghost" to="/destinations">Browse destinations</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.mark {
  font-size: 3rem;
}

.actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>
