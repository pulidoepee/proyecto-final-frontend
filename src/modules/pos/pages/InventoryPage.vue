<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/common/composables/useToast';
import { productsService } from '@/modules/pos/types/services/productsService';
import type { Product } from '@/modules/pos/types/index';
import { useAuth } from '@/common/composables/useAuth';

const { isAdmin } = useAuth();

const router = useRouter();
const toast = useToast();
const products = ref<Product[]>([]);
const isLoading = ref(false);
const productToDelete = ref<Product | null>(null);

async function loadProducts() {
  isLoading.value = true;
  try {
    products.value = await productsService.getAll();
  } catch (error) {
    toast.error('Error al cargar productos');
  } finally {
    isLoading.value = false;
  }
}

function editProduct(id: number) {
  router.push(`/pos/products/edit/${id}`);
}

function confirmDelete(product: Product) {
  productToDelete.value = product;
}

async function deleteProduct() {
  if (!productToDelete.value) return;

  try {
    await productsService.delete(productToDelete.value.id);
    toast.success('Producto eliminado');
    productToDelete.value = null;
    await loadProducts();
  } catch (error) {
    toast.error('Error al eliminar producto');
  }
}

onMounted(() => {
  loadProducts();
});
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Inventario</h2>
      <router-link v-if="isAdmin" to="/pos/products/new" class="btn btn-primary">
        + Nuevo Producto
      </router-link>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Código</th>
              <th v-if="isAdmin" class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.category || '-' }}</td>
              <td>${{ product.price.toFixed(2) }}</td>
              <td>
                <span
                  class="badge"
                  :class="
                    product.stock > 10
                      ? 'bg-success'
                      : product.stock > 0
                        ? 'bg-warning'
                        : 'bg-danger'
                  "
                >
                  {{ product.stock }}
                </span>
              </td>
              <td>{{ product.barcode || '-' }}</td>
              <td v-if="isAdmin" class="text-end">
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="editProduct(product.id)"
                >
                  Editar
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteModal"
                  @click="confirmDelete(product)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal solo visible para admin -->
    <div v-if="isAdmin" id="deleteModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ¿Estás seguro de eliminar <strong>{{ productToDelete?.name }}</strong
            >?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="deleteProduct"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
