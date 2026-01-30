import { authRoutes } from '@/modules/auth/routes';
import HomePage from '@/modules/landing/pages/HomePage.vue';
import { tasksChildRoutes } from '@/modules/tasks/routes';
import { posRoutes } from '@/modules/pos/routes';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/modules/landing/layouts/LandingLayout.vue'),
      children: [
        {
          path: '/',
          component: HomePage,
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('@/modules/landing/pages/AboutPage.vue'),
        },
        {
          path: '/contact',
          name: 'contact',
          component: () => import('@/modules/landing/pages/ContactPage.vue'),
        },
        ...tasksChildRoutes,
      ],
    },
    authRoutes,
    posRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/common/components/NotFound.vue'),
    },
  ],
});

export default router;
