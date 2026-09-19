<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}

function goCatalog() {
  router.push({ name: 'catalog' })
}
</script>

<template>
  <main
    style="
      flex: 1;
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      padding: var(--acme-space-24) var(--acme-space-6);
      text-align: center;
    "
  >
    <p
      style="
        margin: 0;
        font-size: var(--acme-text-xs);
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--acme-color-accent);
      "
    >
      404
    </p>
    <h1 style="margin: var(--acme-space-3) 0 0; font-size: var(--acme-text-4xl)">Off the map</h1>
    <p
      style="margin: var(--acme-space-3) 0 var(--acme-space-6); color: var(--acme-color-text-muted)"
    >
      That page doesn't exist. The catalog is still where you left it.
    </p>
    <div style="display: flex; gap: var(--acme-space-3); justify-content: center; flex-wrap: wrap">
      <button type="button" class="acme-btn acme-btn--primary" @click="goHome">
        Back to explore
      </button>
      <button type="button" class="acme-btn acme-btn--secondary" @click="goCatalog">
        Browse destinations
      </button>
    </div>
  </main>
</template>
