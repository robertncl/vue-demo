<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()

const features = ['catalog', 'thisMonth', 'shortlist', 'planner', 'money']
const built = ['built1', 'built2', 'built3', 'built4', 'built5']
</script>

<template>
  <main class="page page--narrow about">
    <p class="kicker">{{ t('about.eyebrow') }}</p>
    <h1>{{ t('about.title') }}</h1>
    <p class="lede">{{ t('about.lede') }}</p>

    <section>
      <h2>{{ t('about.whatTitle') }}</h2>
      <div class="acme-card table-card">
        <table class="acme-table">
          <tbody>
            <tr v-for="key in features" :key="key">
              <th scope="row">{{ t(`about.${key}Label`) }}</th>
              <td>{{ t(`about.${key}Body`) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>{{ t('about.builtTitle') }}</h2>
      <div class="acme-card table-card">
        <table class="acme-table">
          <tbody>
            <tr v-for="key in built" :key="key">
              <td>{{ t(`about.${key}`) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>{{ t('about.dataTitle') }}</h2>
      <p class="muted">{{ t('about.dataBody') }}</p>
    </section>

    <section>
      <h2>{{ t('about.ratesTitle') }}</h2>
      <p class="muted">{{ t('about.ratesBody') }}</p>
    </section>
  </main>
</template>

<style scoped>
h1 {
  margin: var(--acme-space-2) 0 0;
}

.lede {
  margin: var(--acme-space-4) 0 0;
  font-size: var(--acme-text-lg);
  color: var(--acme-color-text-muted);
  text-wrap: pretty;
}

section {
  margin-top: var(--acme-space-10);
}

section h2 {
  margin: 0 0 var(--acme-space-4);
  font-size: var(--acme-text-2xl);
}

section p {
  margin: 0;
  text-wrap: pretty;
}

th {
  width: 12rem;
  text-transform: none;
  letter-spacing: 0;
  font-size: var(--acme-text-sm);
  font-weight: 400;
  color: var(--acme-color-text-muted);
  border-block-end: 1px solid var(--acme-color-border);
}
</style>
