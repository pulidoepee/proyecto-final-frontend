<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from '@/common/composables/useToast';
import { productsService } from '@/modules/pos/types/services/productsService';
import { salesService } from '@/modules/pos/types/services/SalesService';
import type { Product, CartItem } from '@/modules/pos/types';
import CardPaymentModal from '@/common/components/CardPaymentModal.vue';

const toast = useToast();
const products = ref<Product[]>([]);
const cart = ref<CartItem[]>([]);
const searchQuery = ref('');
const paymentMethod = ref<'cash' | 'card' | 'transfer'>('cash');
const isLoading = ref(false);
const showClientModal = ref(false);
const showCardModal = ref(false);

// Datos del cliente
const clientData = ref({
  name: '',
  documentId: '',
  contact: '',
});

// Datos de la tarjeta
const cardData = ref<{
  lastFour: string;
  cardType: string;
  holderName: string;
} | null>(null);

const clientErrors = ref({
  name: '',
  documentId: '',
  contact: '',
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(
    (p) => p.name.toLowerCase().includes(query) || p.barcode?.includes(query),
  );
});

const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.subtotal, 0));

const cartItemsCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0));

async function loadProducts() {
  try {
    products.value = await productsService.getAll();
  } catch (error) {
    toast.error('Error al cargar productos');
  }
}

function addToCart(product: Product) {
  if (product.stock <= 0) {
    toast.warning('Producto sin stock');
    return;
  }

  const existing = cart.value.find((item) => item.product.id === product.id);

  if (existing) {
    if (existing.quantity >= product.stock) {
      toast.warning('No hay suficiente stock');
      return;
    }
    existing.quantity++;
    existing.subtotal = existing.quantity * product.price;
  } else {
    cart.value.push({
      product,
      quantity: 1,
      subtotal: product.price,
    });
  }
}

function removeFromCart(productId: number) {
  cart.value = cart.value.filter((item) => item.product.id !== productId);
}

function updateQuantity(productId: number, quantity: number) {
  const item = cart.value.find((i) => i.product.id === productId);
  if (!item) return;

  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (quantity > item.product.stock) {
    toast.warning('Cantidad mayor al stock disponible');
    return;
  }

  item.quantity = quantity;
  item.subtotal = quantity * item.product.price;
}

function openClientModal() {
  if (cart.value.length === 0) {
    toast.warning('El carrito está vacío');
    return;
  }

  // Si el método de pago es tarjeta, mostrar modal de tarjeta primero
  if (paymentMethod.value === 'card') {
    showCardModal.value = true;
  } else {
    // Si es efectivo o transferencia, ir directo a datos del cliente
    resetClientData();
    showClientModal.value = true;
  }
}

function onCardConfirm(data: { lastFour: string; cardType: string; holderName: string }) {
  cardData.value = data;
  showCardModal.value = false;

  // Después de confirmar tarjeta, pedir datos del cliente
  resetClientData();
  showClientModal.value = true;
}

function onCardCancel() {
  showCardModal.value = false;
  cardData.value = null;
}

function closeClientModal() {
  showClientModal.value = false;
}

function resetClientData() {
  clientData.value = {
    name: '',
    documentId: '',
    contact: '',
  };
  clientErrors.value = {
    name: '',
    documentId: '',
    contact: '',
  };
}

function validateClientData(): boolean {
  clientErrors.value = {
    name: '',
    documentId: '',
    contact: '',
  };

  let isValid = true;

  if (!clientData.value.name.trim()) {
    clientErrors.value.name = 'El nombre es obligatorio';
    isValid = false;
  }

  if (!clientData.value.documentId.trim()) {
    clientErrors.value.documentId = 'El documento es obligatorio';
    isValid = false;
  }

  if (!clientData.value.contact.trim()) {
    clientErrors.value.contact = 'El contacto es obligatorio';
    isValid = false;
  }

  return isValid;
}

async function completeSale() {
  if (!validateClientData()) {
    toast.warning('Por favor complete todos los datos del cliente');
    return;
  }

  isLoading.value = true;
  try {
    const saleData: any = {
      items: cart.value.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethod: paymentMethod.value,
      clientName: clientData.value.name,
      clientDocumentId: clientData.value.documentId,
      clientContact: clientData.value.contact,
    };

    // Si es pago con tarjeta, incluir datos de la tarjeta
    if (paymentMethod.value === 'card' && cardData.value) {
      saleData.cardLastFour = cardData.value.lastFour;
      saleData.cardType = cardData.value.cardType;
      saleData.cardHolderName = cardData.value.holderName;
    }

    await salesService.create(saleData);
    toast.success('Venta completada exitosamente');

    // Limpiar todo
    cart.value = [];
    cardData.value = null;
    closeClientModal();
    await loadProducts(); // Actualizar stock
  } catch (error) {
    toast.error('Error al procesar la venta');
  } finally {
    isLoading.value = false;
  }
}

function clearCart() {
  cart.value = [];
  cardData.value = null;
}

loadProducts();
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row">
      <!-- Productos -->
      <div class="col-lg-8">
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Productos</h5>
          </div>
          <div class="card-body">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control mb-3"
              placeholder="Buscar por nombre o código de barras..."
            />

            <div class="row g-3">
              <div v-for="product in filteredProducts" :key="product.id" class="col-md-4 col-xl-3">
                <div
                  class="card h-100 product-card"
                  :class="{ 'opacity-50': product.stock === 0 }"
                  @click="addToCart(product)"
                  style="cursor: pointer"
                >
                  <div class="card-body">
                    <h6 class="card-title">{{ product.name }}</h6>
                    <p class="card-text small text-muted">
                      {{ product.description }}
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="badge bg-success">${{ product.price.toFixed(2) }}</span>
                      <small class="text-muted">Stock: {{ product.stock }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carrito -->
      <div class="col-lg-4">
        <div class="card shadow-sm sticky-top" style="top: 20px">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Carrito ({{ cartItemsCount }})</h5>
          </div>
          <div class="card-body" style="max-height: 400px; overflow-y: auto">
            <div v-if="cart.length === 0" class="text-center text-muted py-4">Carrito vacío</div>

            <div v-for="item in cart" :key="item.product.id" class="mb-3 border-bottom pb-2">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h6 class="mb-1">{{ item.product.name }}</h6>
                  <small class="text-muted">${{ item.product.price }} c/u</small>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeFromCart(item.product.id)">
                  ×
                </button>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div class="input-group input-group-sm" style="width: 120px">
                  <button
                    class="btn btn-outline-secondary"
                    @click="updateQuantity(item.product.id, item.quantity - 1)"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    class="form-control text-center"
                    :value="item.quantity"
                    @input="
                      updateQuantity(
                        item.product.id,
                        Number(($event.target as HTMLInputElement).value),
                      )
                    "
                    min="1"
                    :max="item.product.stock"
                  />
                  <button
                    class="btn btn-outline-secondary"
                    @click="updateQuantity(item.product.id, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <strong>${{ item.subtotal.toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="mb-3">
              <label class="form-label small">Método de pago</label>
              <select v-model="paymentMethod" class="form-select">
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta 💳</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div class="d-flex justify-content-between mb-3">
              <h4>Total:</h4>
              <h4 class="text-success">${{ cartTotal.toFixed(2) }}</h4>
            </div>

            <div class="d-grid gap-2">
              <button
                class="btn btn-success btn-lg"
                :disabled="cart.length === 0 || isLoading"
                @click="openClientModal"
              >
                {{ isLoading ? 'Procesando...' : 'Completar Venta' }}
              </button>
              <button
                class="btn btn-outline-secondary"
                :disabled="cart.length === 0"
                @click="clearCart"
              >
                Limpiar Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de pago con tarjeta -->
    <CardPaymentModal
      :show="showCardModal"
      :amount="cartTotal"
      @close="onCardCancel"
      @confirm="onCardConfirm"
    />

    <!-- Modal de datos del cliente -->
    <div
      v-if="showClientModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Datos del Cliente</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeClientModal"
              :disabled="isLoading"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Info de tarjeta si aplica -->
            <div v-if="paymentMethod === 'card' && cardData" class="alert alert-success mb-3">
              <strong>💳 Tarjeta confirmada:</strong> {{ cardData.cardType }} ****
              {{ cardData.lastFour }}
            </div>

            <div class="mb-3">
              <label class="form-label">Nombre completo *</label>
              <input
                v-model="clientData.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': clientErrors.name }"
                placeholder="Ej: Juan Pérez"
              />
              <div v-if="clientErrors.name" class="invalid-feedback">
                {{ clientErrors.name }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Documento de identidad *</label>
              <input
                v-model="clientData.documentId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': clientErrors.documentId }"
                placeholder="Ej: 12345678"
              />
              <div v-if="clientErrors.documentId" class="invalid-feedback">
                {{ clientErrors.documentId }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Contacto (Teléfono/Email) *</label>
              <input
                v-model="clientData.contact"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': clientErrors.contact }"
                placeholder="Ej: 555-1234 o email@ejemplo.com"
              />
              <div v-if="clientErrors.contact" class="invalid-feedback">
                {{ clientErrors.contact }}
              </div>
            </div>

            <div class="alert alert-info small mb-0">
              <i class="bi bi-info-circle"></i> Estos datos se incluirán en la factura
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeClientModal"
              :disabled="isLoading"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="completeSale"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Procesando...' : 'Confirmar Venta' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.modal.show {
  display: block;
}
</style>
