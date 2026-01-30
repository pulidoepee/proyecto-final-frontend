import type { RouteRecordRaw } from 'vue-router';

export const posRoutes: RouteRecordRaw = {
  path: '/pos',
  component: () => import('@/modules/pos/pages/PosLayout.vue'),
  children: [
    {
      path: '',
      name: 'pos-sale',
      component: () => import('@/modules/pos/pages/PosPage.vue'),
    },
    {
      path: 'inventory',
      name: 'pos-inventory',
      component: () => import('@/modules/pos/pages/InventoryPage.vue'),
    },
    {
      path: 'products/new',
      name: 'pos-product-new',
      component: () => import('@/modules/pos/pages/ProductFormPage.vue'),
    },
    {
      path: 'products/edit/:id',
      name: 'pos-product-edit',
      component: () => import('@/modules/pos/pages/ProductFormPage.vue'),
    },
    {
      path: 'sales',
      name: 'pos-sales-history',
      component: () => import('@/modules/pos/pages/SalesHistoryPage.vue'),
    },
  ],
};
