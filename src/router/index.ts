import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useI18n } from '@/i18n'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Filtering and re-dating results only changes the query; keep your place.
    if (to.path === from.path && to.query.out === from.query.out) return false
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { titleKey: 'nav.flights' },
    },
    {
      // Route level code-splitting: each view below ships as its own lazy chunk.
      path: '/flights',
      name: 'flights',
      component: () => import('@/views/FlightResultsView.vue'),
      meta: { titleKey: 'nav.flights' },
    },
    {
      path: '/flights/booking',
      name: 'booking',
      component: () => import('@/views/BookingView.vue'),
      meta: { titleKey: 'booking.title' },
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('@/views/ExploreView.vue'),
      meta: { titleKey: 'nav.explore' },
    },
    {
      path: '/tracked',
      name: 'tracked',
      component: () => import('@/views/TrackedView.vue'),
      meta: { titleKey: 'nav.tracked' },
    },
    {
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
