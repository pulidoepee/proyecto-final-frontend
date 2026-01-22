<script setup lang="ts">
import FooterComponent from '@/common/components/FooterComponent.vue';
import HeaderComponent from '@/common/components/HeaderComponent.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <HeaderComponent />
    <main class="flex-grow-1">
      <div class="container py-4">
        <RouterView />
      </div>
    </main>
    <FooterComponent />
  </div>
</template>
