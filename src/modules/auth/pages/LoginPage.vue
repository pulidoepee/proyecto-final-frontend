<script setup lang="ts">
import { useToast } from '@/common/composables/useToast';
import { useField, useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import * as yup from 'yup';

import { mapApiError } from '@/api/apiErrors';
import type { LoginUserDto } from '@/modules/auth/models/login-user.dto';
import { loginUser } from '@/modules/auth/services/auth.service';
import { setToken, setUser } from '@/modules/auth/utils/token';

type LoginValues = LoginUserDto & { remember: boolean };

const router = useRouter();
const toast = useToast();

const serverError = ref<string | null>(null);
const isSubmitting = ref(false);

const schema: yup.ObjectSchema<LoginValues> = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required(),
  remember: yup.boolean().default(false),
});

const initialValues: LoginValues = {
  email: '',
  password: '',
  remember: true,
};

const { handleSubmit, meta, resetForm } = useForm<LoginValues>({
  validationSchema: schema,
  initialValues,
  validateOnMount: false,
});

const emailField = useField<string>('email');
const passwordField = useField<string>('password');
const rememberField = useField<boolean>('remember');

const showEmailError = computed(() => emailField.meta.touched && !!emailField.errorMessage.value);
const showPasswordError = computed(
  () => passwordField.meta.touched && !!passwordField.errorMessage.value,
);

const canSubmit = computed(() => meta.value.valid && !isSubmitting.value);

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  isSubmitting.value = true;

  try {
    const { token, user } = await loginUser({
      email: values.email,
      password: values.password,
    });

    setToken(token, values.remember);
    setUser(user, values.remember);

    toast.success('Sesión iniciada correctamente');
    resetForm();
    router.push('/tasks');
  } catch (e) {
    serverError.value = mapApiError(e, 'No se ha podido iniciar sesión. Inténtalo de nuevo.');
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <header class="mb-4 text-center">
    <h1 class="h3 fw-bold mb-1">Iniciar sesión</h1>
    <p class="text-secondary mb-0">Accede a tu cuenta para gestionar tus tareas</p>
  </header>

  <form class="card shadow-sm" @submit.prevent="onSubmit" novalidate>
    <div class="card-body p-4 p-md-5">
      <!-- Error servidor -->
      <div v-if="serverError" class="alert alert-danger" role="alert">
        {{ serverError }}
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          type="email"
          class="form-control"
          v-model="emailField.value.value"
          :class="{ 'is-invalid': showEmailError }"
          @blur="emailField.handleBlur"
          placeholder="tu@email.com"
          autocomplete="email"
        />
        <div v-if="showEmailError" class="invalid-feedback">
          {{ emailField.errorMessage.value }}
        </div>
      </div>

      <!-- Password -->
      <div class="mb-2">
        <label for="password" class="form-label">Contraseña</label>
        <input
          id="password"
          type="password"
          class="form-control"
          v-model="passwordField.value.value"
          :class="{ 'is-invalid': showPasswordError }"
          @blur="passwordField.handleBlur"
          placeholder="••••••••"
          autocomplete="current-password"
        />
        <div v-if="showPasswordError" class="invalid-feedback">
          {{ passwordField.errorMessage.value }}
        </div>
      </div>

      <!-- Remember + forgot -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="remember"
            v-model="rememberField.value.value"
          />
          <label class="form-check-label" for="remember">Recuérdame</label>
        </div>

        <!-- Enlace sin funcionalidad aún (puedes ocultarlo o dejarlo) -->
        <span class="small text-secondary">¿Olvidaste tu contraseña?</span>
      </div>

      <!-- Submit -->
      <div class="d-grid">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="!canSubmit">
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>
          Entrar
        </button>
      </div>

      <p class="text-center text-secondary mt-4 mb-0">
        ¿No tienes cuenta?
        <RouterLink to="/register" class="text-decoration-none">Crear cuenta</RouterLink>
      </p>
    </div>
  </form>
</template>

<style scoped></style>
