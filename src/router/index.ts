import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

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
      meta: { title: 'Explore' },
    },
    {
      // Route level code-splitting: each view below ships as its own lazy chunk.
      path: '/destinations',
      name: 'destinations',
      component: () => import('@/views/DestinationsView.vue'),
      meta: { title: 'Destinations' },
    },
    {
      path: '/destinations/:slug',
      name: 'destination',
      component: () => import('@/views/DestinationDetailView.vue'),
      meta: { title: 'Destination' },
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('@/views/WishlistView.vue'),
      meta: { title: 'Wishlist' },
    },
    {
      path: '/trips',
      name: 'trips',
      component: () => import('@/views/TripsView.vue'),
      meta: { title: 'My trips' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: 'About' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Not found' },
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · Wanderlog` : 'Wanderlog'
})

export default router
