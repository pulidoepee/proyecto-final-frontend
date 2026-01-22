import { authGuard } from '@/modules/auth/guards/authGuard';
import type { RouteRecordRaw } from 'vue-router';

export const tasksChildRoutes: RouteRecordRaw[] = [
  {
    path: 'tasks',
    name: 'tasks',
    component: () => import('@/modules/tasks/pages/TasksList.vue'),
    beforeEnter: [authGuard],
  },
  {
    path: 'tasks/:id',
    name: 'task-detail',
    component: () => import('@/modules/tasks/pages/TaskDetail.vue'),
    props: true,
    beforeEnter: [authGuard],
  },
];
