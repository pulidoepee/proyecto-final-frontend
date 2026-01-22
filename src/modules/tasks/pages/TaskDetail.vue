<script setup lang="ts">
import { useToast } from '@/common/composables/useToast';
import { completeTask, getTaskById, updateTask } from '@/modules/tasks/services/tasks.service';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

type TaskPriority = 'low' | 'medium' | 'high';

type Task = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const props = defineProps<{ id: string }>();
const toast = useToast();

const loading = ref(false);
const error = ref<string | null>(null);

const task = ref<Task | null>(null);

// edición simple (sin vee-validate aún, por mantenerlo ligero en el detalle)
const editName = ref('');
const editDescription = ref('');
const editDueDate = ref(''); // yyyy-mm-dd
const editPriority = ref<TaskPriority>('medium');

function toDateInputValue(iso: string) {
  // ISO -> yyyy-mm-dd
  return iso.slice(0, 10);
}

async function loadTask() {
  loading.value = true;
  error.value = null;

  try {
    const data = await getTaskById(props.id);
    task.value = data;

    editName.value = data.name;
    editDescription.value = data.description;
    editDueDate.value = toDateInputValue(data.dueDate);
    editPriority.value = data.priority;
  } catch {
    error.value = 'No se ha podido cargar la tarea.';
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  if (!task.value) return;

  // Construimos PATCH parcial (solo campos modificados)
  const payload: Record<string, unknown> = {};

  if (editName.value !== task.value.name) payload.name = editName.value;
  if (editDescription.value !== task.value.description) payload.description = editDescription.value;

  // dueDate: comparamos yyyy-mm-dd con iso
  if (editDueDate.value !== toDateInputValue(task.value.dueDate))
    payload.dueDate = editDueDate.value;

  if (editPriority.value !== task.value.priority) payload.priority = editPriority.value;

  if (Object.keys(payload).length === 0) {
    toast.info('No hay cambios para guardar');
    return;
  }

  try {
    const updated = await updateTask(task.value.id, payload);
    task.value = updated;
    toast.success('Tarea actualizada');
  } catch {
    toast.error('No se ha podido actualizar la tarea');
  }
}

async function onComplete() {
  if (!task.value || task.value.completed) return;

  try {
    const updated = await completeTask(task.value.id);
    task.value = updated;
    toast.success('Tarea completada');
  } catch {
    toast.error('No se ha podido completar la tarea');
  }
}

onMounted(loadTask);
</script>

<template>
  <section class="container py-4">
    <header class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 mb-0">Detalle de la tarea</h1>
      <RouterLink to="/tasks" class="btn btn-outline-secondary btn-sm">
        ← Volver al listado
      </RouterLink>
    </header>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="task && !loading" class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div class="text-muted small">ID: {{ task.id }}</div>
            <span
              class="badge me-2"
              :class="task.completed ? 'bg-success' : 'bg-warning text-dark'"
            >
              {{ task.completed ? 'Hecha' : 'Pendiente' }}
            </span>
            <span
              class="badge"
              :class="
                task.priority === 'high'
                  ? 'bg-danger'
                  : task.priority === 'medium'
                    ? 'bg-primary'
                    : 'bg-secondary'
              "
            >
              {{ task.priority }}
            </span>
          </div>

          <button
            class="btn btn-outline-success btn-sm"
            :disabled="task.completed"
            @click="onComplete"
          >
            Completar
          </button>
        </div>

        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Nombre</label>
            <input class="form-control" v-model="editName" />
          </div>

          <div class="col-12">
            <label class="form-label">Descripción</label>
            <textarea class="form-control" rows="3" v-model="editDescription"></textarea>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label">Fecha límite</label>
            <input class="form-control" type="date" v-model="editDueDate" />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label">Prioridad</label>
            <select class="form-select" v-model="editPriority">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>

          <div class="col-12 col-md-4 d-flex align-items-end">
            <button class="btn btn-primary w-100" @click="onSave">Guardar cambios</button>
          </div>
        </div>

        <hr class="my-3" />

        <div class="text-muted small">
          Creada: {{ new Date(task.createdAt).toLocaleString() }} · Actualizada:
          {{ new Date(task.updatedAt).toLocaleString() }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
