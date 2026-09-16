<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useDestinationsStore } from '@/stores/destinations'
import { useI18n } from '@/i18n'

const store = useDestinationsStore()
const { t, money, month, region } = useI18n()

const pick = computed(() => store.topPick)
const monthName = computed(() => month(store.currentMonth))

const banner = computed(() =>
  pick.value ? `linear-gradient(135deg, ${pick.value.gradient[0]}, ${pick.value.gradient[1]})` : '',
)

const weekBudget = computed(() => (pick.value ? pick.value.dailyBudget * 7 : 0))
</script>

<template>
  <section v-if="pick" class="top-pick" aria-labelledby="top-pick-title">
    <div class="head">
      <div>
        <p class="eyebrow">{{ t('topPick.eyebrow', { month: monthName }) }}</p>
        <h2 id="top-pick-title">{{ t('topPick.title', { month: monthName }) }}</h2>
        <p class="muted subtitle">
          {{
            store.hasSeasonalPick ? t('topPick.subtitle') : t('topPick.none', { month: monthName })
          }}
        </p>
      </div>
    </div>

    <article class="hero card">
      <div class="art" :style="{ background: banner }">
        <span class="emoji" aria-hidden="true">{{ pick.emoji }}</span>
        <span v-if="store.inSeason(pick)" class="season-flag">{{ t('topPick.inSeason') }}</span>
      </div>

      <div class="detail">
        <p class="where muted">{{ pick.country }} · {{ region(pick.region) }}</p>
        <h3>{{ pick.name }}</h3>

        <p class="why-label">{{ t('topPick.why') }}</p>
        <p class="why">{{ store.noteForMonth(pick) }}</p>

        <dl class="figures">
          <div>
            <dt>{{ t('detail.dailyBudget') }}</dt>
            <dd>{{ money(pick.dailyBudget) }}</dd>
          </div>
          <div>
            <dt>{{ t('detail.oneWeek') }}</dt>
            <dd>{{ money(weekBudget) }}</dd>
          </div>
        </dl>

        <div class="actions">
          <RouterLink class="btn" :to="`/destinations/${pick.slug}`">
            {{ t('topPick.readGuide') }}
          </RouterLink>
          <RouterLink
            class="btn btn-ghost"
            :to="{
              path: '/trips',
              query: {
                destination: `${pick.name}, ${pick.country}`,
                budget: String(weekBudget),
              },
            }"
          >
            {{ t('topPick.planIt') }}
          </RouterLink>
        </div>
      </div>
    </article>

    <div v-if="store.topPickRunnersUp.length" class="runners">
      <h3 class="runners-title">{{ t('topPick.runnersUp', { month: monthName }) }}</h3>
      <ul>
        <li v-for="item in store.topPickRunnersUp" :key="item.slug" class="card runner">
          <RouterLink :to="`/destinations/${item.slug}`">
            <span class="runner-emoji" aria-hidden="true">{{ item.emoji }}</span>
            <span class="runner-text">
              <strong>{{ item.name }}</strong>
              <span class="muted">{{ store.noteForMonth(item) }}</span>
            </span>
            <span class="runner-price">{{ money(item.dailyBudget) }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.head {
  margin-bottom: 1.25rem;
}

.subtitle {
  max-width: 60ch;
  margin-top: 0.4rem;
}

.hero {
  display: grid;
  grid-template-columns: 260px 1fr;
  overflow: hidden;
}

.art {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.emoji {
  font-size: 4rem;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.season-flag {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--c-season-bg);
  color: var(--c-season-text);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail {
  padding: 1.5rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.where {
  font-size: 0.85rem;
}

.why-label {
  margin-top: 0.6rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: var(--c-brand);
}

.why {
  max-width: 58ch;
}

.figures {
  display: flex;
  gap: 2rem;
  margin: 0.9rem 0 0.25rem;
  flex-wrap: wrap;
}

.figures dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  font-weight: 650;
}

.figures dd {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--c-heading);
}

.actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.runners {
  margin-top: 1.5rem;
}

.runners-title {
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
  color: var(--c-muted);
}

.runners ul {
  list-style: none;
  display: grid;
  gap: 0.6rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.runner a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  color: var(--c-text);
  height: 100%;
}

.runner-emoji {
  font-size: 1.5rem;
}

.runner-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0.1rem;
}

.runner-text strong {
  color: var(--c-heading);
}

.runner-text .muted {
  font-size: 0.78rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.runner-price {
  font-weight: 650;
  color: var(--c-heading);
  white-space: nowrap;
}

@media (max-width: 760px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .art {
    min-height: 150px;
  }
}
</style>
