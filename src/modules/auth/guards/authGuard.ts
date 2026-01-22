// src/modules/auth/guards/authGuard.ts
import type { NavigationGuard } from 'vue-router';

function isAuthenticated(): boolean {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

export const authGuard: NavigationGuard = (to) => {
  if (isAuthenticated()) {
    return true;
  }

  return {
    name: 'login',
    query: { redirect: to.fullPath },
  };
};
