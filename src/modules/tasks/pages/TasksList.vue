<script setup lang="ts">
import { mapApiError } from '@/api/apiErrors';
import { useToast } from '@/common/composables/useToast';
import TaskForm from '@/modules/tasks/components/TaskForm.vue';
import type { CreateTaskDto } from '@/modules/tasks/models/create-task.dto';
import type { Task, TaskPriority } from '@/modules/tasks/models/task.model';
import {
  completeAllPendingTasks,
  completeTask,
  createTask,
  deleteAllCompletedTasks,
  getTasks,
} from '@/modules/tasks/services/tasks.service';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const toast = useToast();

const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadTasks() {
  loading.value = true;
  error.value = null;

  try {
    tasks.value = await getTasks();
  } catch {
    error.value = 'No se han podido cargar las tareas.';
  } finally {
    loading.value = false;
  }
}

async function onCreateTask(payload: CreateTaskDto) {
  try {
    await createTask(payload);
    toast.success('Tarea creada correctamente');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se ha podido crear la tarea'));
  }
}

async function onCompleteTask(taskId: string) {
  try {
    await completeTask(taskId);
    toast.success('Tarea completada');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se ha podido completar la tarea'));
  }
}

async function onCompleteAll() {
  try {
    await completeAllPendingTasks();
    toast.success('Todas las tareas pendientes se han completado');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se han podido completar las tareas'));
  }
}

async function onDeleteCompleted() {
  try {
    await deleteAllCompletedTasks();
    toast.success('Tareas completadas eliminadas');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se han podido eliminar las tareas completadas'));
  }
}

function priorityBadge(p: TaskPriority) {
  if (p === 'high') return 'bg-danger';
  if (p === 'medium') return 'bg-primary';
  return 'bg-secondary';
}

onMounted(loadTasks);
</script>

<template>
  <section class="container py-4">
    <header class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 mb-0">Mis tareas</h1>
      <RouterLink to="/" class="btn btn-outline-secondary btn-sm">Volver a Home</RouterLink>
    </header>

    <TaskForm :disabled="loading" @submit="onCreateTask" />

    <div class="d-flex gap-2 mb-3">
      <button
        class="btn btn-sm btn-outline-success"
        :disabled="tasks.length === 0 || loading"
        @click="onCompleteAll"
      >
        Completar todas
      </button>

      <button
        class="btn btn-sm btn-outline-danger"
        :disabled="!tasks.some((t) => t.completed) || loading"
        @click="onDeleteCompleted"
      >
        Eliminar completadas
      </button>

      <button
        class="btn btn-sm btn-outline-secondary ms-auto"
        :disabled="loading"
        @click="loadTasks"
      >
        Recargar
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="!loading && tasks.length" class="list-group">
      <RouterLink
        v-for="task in tasks"
        :key="task.id"
        :to="{ name: 'task-detail', params: { id: task.id } }"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      >
        <div class="me-3">
          <span class="badge me-2" :class="task.completed ? 'bg-success' : 'bg-warning text-dark'">
            {{ task.completed ? 'Hecha' : 'Pendiente' }}
          </span>

          <span class="fw-semibold">{{ task.name }}</span>

          <span class="badge ms-2" :class="priorityBadge(task.priority)">
            {{ task.priority }}
          </span>

          <div class="text-muted small mt-1">
            {{ task.description }}
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <small class="text-muted">{{ new Date(task.dueDate).toLocaleDateString() }}</small>

          <button
            v-if="!task.completed"
            class="btn btn-sm btn-outline-success"
            @click.prevent="onCompleteTask(task.id)"
            title="Completar"
          >
            ✓
          </button>
        </div>
      </RouterLink>
    </div>

    <p v-if="!loading && tasks.length === 0" class="text-muted">No tienes tareas todavía.</p>
  </section>
</template>
