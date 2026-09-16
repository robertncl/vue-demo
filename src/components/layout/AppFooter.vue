<template>
  <footer class="site-footer">
    <div class="container inner">
      <p>
        <strong>Wanderlog</strong> — a Vue 3 + Pinia demo travel planner. Trips are stored in your
        browser only.
      </p>
      <p class="muted">Built with Vue 3, TypeScript, Pinia and Vue Router.</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
  padding: 1.75rem 0;
  font-size: 0.875rem;
}

.inner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
