<script setup lang="ts">
import { useToast } from '@/common/composables/useToast';
import { clearAuth, isAuthenticated } from '@/modules/auth/utils/token';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();

const toast = useToast();

// Recalcula al cambiar de ruta (login/logout provocan navegación)
const isLoggedIn = computed(() => isAuthenticated());

function logout() {
  clearAuth();
  toast.info('Sesión cerrada');
  router.push('/login');
}
</script>

<template>
  <header class="navbar navbar-expand-lg bg-light border-bottom">
    <div class="container">
      <RouterLink to="/" class="navbar-brand d-flex align-items-center">
        <img src="@/assets/logo.svg" alt="Vue logo" height="32" class="me-2" />
        <span class="fw-semibold">Vue Router App</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <nav id="mainNav" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link" exact-active-class="active">Home</RouterLink>
          </li>

          <!-- Tasks: visible solo si está logueado -->
          <li v-if="isLoggedIn" class="nav-item">
            <RouterLink to="/tasks" class="nav-link" exact-active-class="active">Tasks</RouterLink>
          </li>

          <!-- POS: visible solo si está logueado -->
          <li v-if="isLoggedIn" class="nav-item">
            <RouterLink to="/pos" class="nav-link" exact-active-class="active">💰 POS</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/about" class="nav-link" exact-active-class="active">About</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/contact" class="nav-link" exact-active-class="active"
              >Contact</RouterLink
            >
          </li>

          <!-- Si NO está logueado: Login/Register -->
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <RouterLink to="/login" class="nav-link" exact-active-class="active"
                >Login</RouterLink
              >
            </li>
            <li class="nav-item ms-lg-2">
              <RouterLink to="/register" class="btn btn-primary btn-sm">Register</RouterLink>
            </li>
          </template>

          <!-- Si está logueado: Logout -->
          <li v-else class="nav-item ms-lg-2">
            <button class="btn btn-outline-danger btn-sm" type="button" @click="logout">
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-link.active {
  font-weight: 600;
}
</style>
