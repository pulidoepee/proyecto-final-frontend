<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from '@/common/composables/useToast';
import { productsService } from '@/modules/pos/types/services/productsService';
import type { Product } from '@/modules/pos/types';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const isLoading = ref(false);
const isEditMode = ref(false);
const productId = ref<number | null>(null);

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  barcode: '',
});

const errors = ref<Record<string, string>>({});

async function loadProduct() {
  if (!route.params.id) return;

  isEditMode.value = true;
  productId.value = Number(route.params.id);

  try {
    const product = await productsService.getById(productId.value);
    form.value = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category || '',
      barcode: product.barcode || '',
    };
  } catch (error) {
    toast.error('Error al cargar producto');
    router.push('/pos/inventory');
  }
}

function validateForm(): boolean {
  errors.value = {};

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio';
  }

  if (form.value.price <= 0) {
    errors.value.price = 'El precio debe ser mayor a 0';
  }

  if (form.value.stock < 0) {
    errors.value.stock = 'El stock no puede ser negativo';
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    toast.warning('Por favor corrige los errores');
    return;
  }

  isLoading.value = true;

  try {
    if (isEditMode.value && productId.value) {
      await productsService.update(productId.value, form.value);
      toast.success('Producto actualizado');
    } else {
      await productsService.create(form.value);
      toast.success('Producto creado');
    }
    router.push('/pos/inventory');
  } catch (error) {
    toast.error('Error al guardar producto');
  } finally {
    isLoading.value = false;
  }
}

function cancel() {
  router.push('/pos/inventory');
}

onMounted(() => {
  loadProduct();
});
</script>

<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">
              {{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}
            </h4>
          </div>

          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nombre *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="Ej: Tornillo 1/4"
                  />
                  <div v-if="errors.name" class="invalid-feedback">
                    {{ errors.name }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Categoría</label>
                  <input
                    v-model="form.category"
                    type="text"
                    class="form-control"
                    placeholder="Ej: Ferretería"
                  />
                </div>

                <div class="col-md-12 mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea
                    v-model="form.description"
                    class="form-control"
                    rows="3"
                    placeholder="Descripción del producto..."
                  ></textarea>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label">Precio *</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      v-model.number="form.price"
                      type="number"
                      step="0.01"
                      class="form-control"
                      :class="{ 'is-invalid': errors.price }"
                    />
                    <div v-if="errors.price" class="invalid-feedback">
                      {{ errors.price }}
                    </div>
                  </div>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label">Stock *</label>
                  <input
                    v-model.number="form.stock"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.stock }"
                  />
                  <div v-if="errors.stock" class="invalid-feedback">
                    {{ errors.stock }}
                  </div>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label">Código de barras</label>
                  <input
                    v-model="form.barcode"
                    type="text"
                    class="form-control"
                    placeholder="Ej: 123456789"
                  />
                </div>
              </div>

              <div class="d-flex gap-2 justify-content-end mt-4">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="cancel"
                  :disabled="isLoading"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                  {{ isLoading ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
