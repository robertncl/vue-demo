<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'
import SettingsMenu from './SettingsMenu.vue'

const route = useRoute()
const travel = useTravelStore()
const destinationsStore = useDestinationsStore()
const { t } = useI18n()
const menuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)
</script>

<template>
  <header class="site-header">
    <div class="container bar">
      <RouterLink to="/" class="brand">
        <span class="brand-mark" aria-hidden="true">🧭</span>
        <span class="brand-name">{{ t('brand.name') }}</span>
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        :aria-label="t('nav.menu')"
        @click="menuOpen = !menuOpen"
      >
        ☰
      </button>

      <nav class="nav" :class="{ open: menuOpen }">
        <ul>
          <li>
            <RouterLink to="/">{{ t('nav.explore') }}</RouterLink>
          </li>
          <li>
            <RouterLink to="/destinations">{{ t('nav.destinations') }}</RouterLink>
          </li>
          <li>
            <RouterLink to="/wishlist">
              {{ t('nav.wishlist') }}
              <span v-if="destinationsStore.wishlist.length" class="badge">
                {{ destinationsStore.wishlist.length }}
              </span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/trips">
              {{ t('nav.trips') }}
              <span v-if="travel.trips.length" class="badge">{{ travel.trips.length }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/about">{{ t('nav.about') }}</RouterLink>
          </li>
        </ul>

        <SettingsMenu class="header-settings" />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--c-background) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--c-border);
}

.bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 64px;
  flex-wrap: wrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--c-heading);
  letter-spacing: -0.02em;
  margin-right: auto;
}

.brand-mark {
  font-size: 1.35rem;
}

.menu-toggle {
  display: none;
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.65rem;
  cursor: pointer;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav ul {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  list-style: none;
}

.nav a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  color: var(--c-muted);
  font-size: 0.9rem;
  font-weight: 550;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav a:hover {
  background: var(--c-surface-soft);
  color: var(--c-heading);
}

.nav a.router-link-active {
  background: var(--c-brand-soft);
  color: var(--c-brand);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: var(--c-brand);
  color: var(--c-on-brand);
  font-size: 0.7rem;
  font-weight: 700;
}

.header-settings {
  padding-left: 0.6rem;
  border-left: 1px solid var(--c-border);
}

@media (max-width: 1040px) {
  .nav a {
    padding: 0.4rem 0.5rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 860px) {
  .menu-toggle {
    display: block;
  }

  .nav {
    display: none;
    width: 100%;
    padding-bottom: 0.85rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .nav.open {
    display: flex;
  }

  .nav ul {
    flex-direction: column;
    align-items: stretch;
    gap: 0.15rem;
  }

  .header-settings {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--c-border);
    padding-top: 0.75rem;
  }
}
</style>
