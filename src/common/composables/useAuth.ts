// src/common/composables/useAuth.ts

import { computed, ref, watch } from 'vue';
import { getUser } from '@/modules/auth/utils/token';

// Estado reactivo compartido
const user = ref(getUser());

// Observar cambios en localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    user.value = getUser();
  });
}

// Función para forzar actualización
export function refreshAuth() {
  user.value = getUser();
}

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isCashier = computed(() => user.value?.role === 'cashier');

  return {
    user,
    isAuthenticated,
    isAdmin,
    isCashier,
    refreshAuth,
  };
}
