<script setup lang="ts">
import { computed } from 'vue';
import { useToast } from '../composables/useToast';

const toast = useToast();

const toastClass = computed(() => {
  const bg =
    toast.state.type === 'success'
      ? 'text-bg-success'
      : toast.state.type === 'danger'
        ? 'text-bg-danger'
        : toast.state.type === 'warning'
          ? 'text-bg-warning'
          : 'text-bg-info';

  return `toast align-items-center ${bg} border-0`;
});
</script>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1080">
    <div
      class="show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-if="toast.state.show"
      :class="toastClass"
    >
      <div class="d-flex">
        <div class="toast-body">
          {{ toast.state.message }}
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          aria-label="Close"
          @click="toast.hideToast"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
