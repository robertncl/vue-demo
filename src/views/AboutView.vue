<template>
  <main class="page">
    <div class="container narrow">
      <header class="page-head">
        <p class="eyebrow">About</p>
        <h1>About Wanderlog</h1>
        <p>
          A small, self-contained travel planner built to show off Vue 3's composition API, Pinia
          stores and Vue Router in a realistic app rather than a counter.
        </p>
      </header>

      <section>
        <h2>What it does</h2>
        <ul class="list">
          <li>
            <strong>Explore</strong> a curated catalog of twelve destinations with costs and
            seasons.
          </li>
          <li><strong>Filter</strong> by search text, region, vibe and maximum daily budget.</li>
          <li><strong>Save</strong> destinations to a wishlist that survives a page reload.</li>
          <li><strong>Plan</strong> dated trips with a day-by-day, costed itinerary.</li>
          <li><strong>Track</strong> spend against the budget, with a warning when you go over.</li>
        </ul>
      </section>

      <section>
        <h2>How it's built</h2>
        <ul class="list">
          <li>
            <strong>Vue 3</strong> with <code>&lt;script setup&gt;</code> and typed props and emits.
          </li>
          <li>
            <strong>Pinia</strong> setup stores — one for the catalog and wishlist, one for trips.
          </li>
          <li>
            <strong>Vue Router</strong> with lazy-loaded routes and a dynamic destination route.
          </li>
          <li>
            <strong>Vitest</strong> unit tests and <strong>Cypress</strong> end-to-end coverage.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your data</h2>
        <p class="muted">
          There is no backend. Trips and wishlist entries live in this browser's
          <code>localStorage</code>, so clearing site data clears your plans.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.narrow {
  max-width: 760px;
}

section {
  margin-top: 2rem;
}

section h2 {
  margin-bottom: 0.75rem;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list li {
  padding-left: 1.4rem;
  position: relative;
}

.list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--c-brand);
}

code {
  background: var(--c-surface-soft);
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  font-size: 0.875em;
}
</style>
