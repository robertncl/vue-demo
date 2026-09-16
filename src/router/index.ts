import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useI18n } from '@/i18n'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { titleKey: 'nav.explore' },
    },
    {
      // Route level code-splitting: each view below ships as its own lazy chunk.
      path: '/destinations',
      name: 'destinations',
      component: () => import('@/views/DestinationsView.vue'),
      meta: { titleKey: 'nav.destinations' },
    },
    {
      path: '/destinations/:slug',
      name: 'destination',
      component: () => import('@/views/DestinationDetailView.vue'),
      meta: { titleKey: 'nav.destinations' },
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('@/views/WishlistView.vue'),
      meta: { titleKey: 'nav.wishlist' },
    },
    {
      path: '/trips',
      name: 'trips',
      component: () => import('@/views/TripsView.vue'),
      meta: { titleKey: 'nav.trips' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { titleKey: 'nav.about' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { titleKey: 'notFound.title' },
    },
  ],
})

router.afterEach((to) => {
  // Runs outside setup(), but Pinia is installed before the first navigation.
  const { t } = useI18n()
  const key = to.meta.titleKey as string | undefined
  const brand = t('brand.name')
  document.title = key ? `${t(key)} · ${brand}` : brand
})

export default router
