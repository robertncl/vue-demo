<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()

const features = ['what1', 'what2', 'what3', 'what4', 'what5', 'what6', 'what7']
const built = ['built1', 'built2', 'built3', 'built4', 'built5']
</script>

<template>
  <main class="page">
    <div class="container narrow">
      <header class="page-head">
        <p class="eyebrow">{{ t('about.eyebrow') }}</p>
        <h1>{{ t('about.title') }}</h1>
        <p>{{ t('about.lede') }}</p>
      </header>

      <section>
        <h2>{{ t('about.whatTitle') }}</h2>
        <ul class="list">
          <li v-for="key in features" :key="key">{{ t(`about.${key}`) }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('about.builtTitle') }}</h2>
        <ul class="list">
          <li v-for="key in built" :key="key">{{ t(`about.${key}`) }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('about.dataTitle') }}</h2>
        <p class="muted">{{ t('about.dataBody') }}</p>
      </section>

      <section>
        <h2>{{ t('about.ratesTitle') }}</h2>
        <p class="muted">{{ t('about.ratesBody') }}</p>
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
</style>
