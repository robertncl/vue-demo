<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <main class="page page--slim not-found">
    <p class="kicker">404</p>
    <h1>{{ t('notFound.title') }}</h1>
    <p class="muted">{{ t('notFound.body') }}</p>
    <div class="actions">
      <RouterLink class="mod-btn mod-btn--primary" to="/">{{ t('notFound.home') }}</RouterLink>
      <RouterLink class="mod-btn mod-btn--secondary" to="/destinations">
        {{ t('notFound.browse') }}
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
h1 {
  margin: var(--mod-space-3) 0 0;
}

.muted {
  margin: var(--mod-space-3) 0 var(--mod-space-4);
}

.actions {
  display: flex;
  gap: var(--mod-space-3);
  justify-content: center;
  flex-wrap: wrap;
}
</style>
