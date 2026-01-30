<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="pos-layout">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <span class="navbar-brand">Sistema POS</span>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link
                to="/pos"
                class="nav-link"
                :class="{ active: route.name === 'pos-sale' }"
              >
                💰 Punto de Venta
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/pos/inventory"
                class="nav-link"
                :class="{ active: route.name === 'pos-inventory' }"
              >
                📦 Inventario
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/pos/sales"
                class="nav-link"
                :class="{ active: route.name === 'pos-sales-history' }"
              >
                📊 Historial
              </router-link>
            </li>
          </ul>
          <!-- Boton para volver a HOME -->
          <ul class="nav-item ms-auto">
            <li class="nav-item">
              <router-link to="/" class="btn btn-outline-light btn-sm"> Volver a Home </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.pos-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style>
