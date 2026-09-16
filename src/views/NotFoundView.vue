<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <main class="page">
    <div class="container empty">
      <span class="mark" aria-hidden="true">🗺️</span>
      <h1>{{ t('notFound.title') }}</h1>
      <p class="muted">{{ t('notFound.body') }}</p>
      <div class="actions">
        <RouterLink class="btn" to="/">{{ t('notFound.home') }}</RouterLink>
        <RouterLink class="btn btn-ghost" to="/destinations">{{ t('notFound.browse') }}</RouterLink>
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
