<script setup lang="ts">
import type { CreateTaskDto } from '@/modules/tasks/models/create-task.dto';
import type { TaskPriority } from '@/modules/tasks/models/task.model';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import * as yup from 'yup';

const emit = defineEmits<{
  (e: 'submit', payload: CreateTaskDto): void;
}>();

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const schema: yup.ObjectSchema<CreateTaskDto> = yup.object({
  name: yup.string().required().min(3).max(80),
  description: yup.string().required().min(5).max(500),
  dueDate: yup.string().required(),
  priority: yup.mixed<TaskPriority>().oneOf(['low', 'medium', 'high']).required(),
});

const initialValues: CreateTaskDto = {
  name: '',
  description: '',
  dueDate: '',
  priority: 'medium',
};

const { handleSubmit, meta, resetForm } = useForm<CreateTaskDto>({
  validationSchema: schema,
  initialValues,
  validateOnMount: false,
});

const nameField = useField<string>('name');
const descriptionField = useField<string>('description');
const dueDateField = useField<string>('dueDate');
const priorityField = useField<TaskPriority>('priority');

const showNameError = computed(() => nameField.meta.touched && !!nameField.errorMessage.value);
const showDescriptionError = computed(
  () => descriptionField.meta.touched && !!descriptionField.errorMessage.value,
);
const showDueDateError = computed(
  () => dueDateField.meta.touched && !!dueDateField.errorMessage.value,
);
const showPriorityError = computed(
  () => priorityField.meta.touched && !!priorityField.errorMessage.value,
);

const canSubmit = computed(() => meta.value.valid && !props.disabled);

const onSubmit = handleSubmit((values) => {
  emit('submit', values);
  resetForm();
});
</script>

<template>
  <div class="card shadow-sm mb-3">
    <div class="card-body">
      <h2 class="h6 mb-3">Nueva tarea</h2>

      <form @submit.prevent="onSubmit" novalidate>
        <div class="row g-3">
          <div class="col-12">
            <label for="name" class="form-label">Nombre</label>
            <input
              id="name"
              type="text"
              class="form-control"
              v-model="nameField.value.value"
              :class="{ 'is-invalid': showNameError }"
              @blur="nameField.handleBlur"
              placeholder="Ej. Preparar clase de Vue"
              :disabled="props.disabled"
            />
            <div v-if="showNameError" class="invalid-feedback">
              {{ nameField.errorMessage.value }}
            </div>
          </div>

          <div class="col-12">
            <label for="description" class="form-label">Descripción</label>
            <textarea
              id="description"
              class="form-control"
              rows="2"
              v-model="descriptionField.value.value"
              :class="{ 'is-invalid': showDescriptionError }"
              @blur="descriptionField.handleBlur"
              placeholder="Describe brevemente la tarea…"
              :disabled="props.disabled"
            ></textarea>
            <div v-if="showDescriptionError" class="invalid-feedback">
              {{ descriptionField.errorMessage.value }}
            </div>
          </div>

          <div class="col-12 col-md-4">
            <label for="dueDate" class="form-label">Fecha límite</label>
            <input
              id="dueDate"
              type="date"
              class="form-control"
              v-model="dueDateField.value.value"
              :class="{ 'is-invalid': showDueDateError }"
              @blur="dueDateField.handleBlur"
              :disabled="props.disabled"
            />
            <div v-if="showDueDateError" class="invalid-feedback">
              {{ dueDateField.errorMessage.value }}
            </div>
          </div>

          <div class="col-12 col-md-4">
            <label for="priority" class="form-label">Prioridad</label>
            <select
              id="priority"
              class="form-select"
              v-model="priorityField.value.value"
              :class="{ 'is-invalid': showPriorityError }"
              @blur="priorityField.handleBlur"
              :disabled="props.disabled"
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <div v-if="showPriorityError" class="invalid-feedback">
              {{ priorityField.errorMessage.value }}
            </div>
          </div>

          <div class="col-12 col-md-4 d-flex align-items-end">
            <button type="submit" class="btn btn-primary w-100" :disabled="!canSubmit">
              Crear tarea
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
