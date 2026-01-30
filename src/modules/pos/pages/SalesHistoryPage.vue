<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useToast } from '@/common/composables/useToast';
import { salesService } from '@/modules/pos/types/services/SalesService';
import type { Sale } from '@/modules/pos/types';

const toast = useToast();
const sales = ref<Sale[]>([]);
const isLoading = ref(false);
const selectedSale = ref<Sale | null>(null);
const showInvoiceModal = ref(false);

const totalSales = computed(() => sales.value.reduce((sum, sale) => sum + sale.total, 0));

const salesCount = computed(() => sales.value.length);

async function loadSales() {
  isLoading.value = true;
  try {
    sales.value = await salesService.getAll();
  } catch (error) {
    toast.error('Error al cargar ventas');
  } finally {
    isLoading.value = false;
  }
}

function viewSaleDetail(sale: Sale) {
  selectedSale.value = sale;
}

function viewInvoice(sale: Sale) {
  selectedSale.value = sale;
  showInvoiceModal.value = true;
}

function closeInvoiceModal() {
  showInvoiceModal.value = false;
}

function printInvoice() {
  window.print();
}

function downloadInvoice() {
  // Aquí puedes implementar la descarga en PDF
  toast.info('Descargando factura...');
  // Por ahora solo imprime
  window.print();
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
  };
  return labels[method] || method;
}

function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    completed: 'bg-success',
    pending: 'bg-warning',
    cancelled: 'bg-danger',
  };
  return badges[status] || 'bg-secondary';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Completada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
  };
  return labels[status] || status;
}

onMounted(() => {
  loadSales();
});
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Historial de Ventas</h2>
      <button class="btn btn-outline-primary" @click="loadSales">🔄 Actualizar</button>
    </div>

    <!-- Resumen -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="text-muted mb-1">Total Ventas</h6>
            <h3 class="mb-0">${{ totalSales.toFixed(2) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="text-muted mb-1">Cantidad de Ventas</h6>
            <h3 class="mb-0">{{ salesCount }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de ventas -->
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
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id">
              <td>{{ sale.id }}</td>
              <td>{{ formatDate(sale.date) }}</td>
              <td>
                <div v-if="sale.clientName">
                  <strong>{{ sale.clientName }}</strong
                  ><br />
                  <small class="text-muted">{{ sale.clientDocumentId }}</small>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ sale.items.length }} producto(s)</td>
              <td>
                <strong>${{ sale.total.toFixed(2) }}</strong>
              </td>
              <td>{{ getPaymentMethodLabel(sale.paymentMethod) }}</td>
              <td>
                <span class="badge" :class="getStatusBadge(sale.status)">
                  {{ getStatusLabel(sale.status) }}
                </span>
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  data-bs-toggle="modal"
                  data-bs-target="#saleDetailModal"
                  @click="viewSaleDetail(sale)"
                  title="Ver detalle"
                >
                  👁️
                </button>
                <button
                  class="btn btn-sm btn-outline-success"
                  @click="viewInvoice(sale)"
                  title="Ver factura"
                >
                  📄
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="sales.length === 0 && !isLoading" class="text-center text-muted py-5">
        No hay ventas registradas
      </div>
    </div>

    <!-- Modal detalle de venta -->
    <div id="saleDetailModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalle de Venta #{{ selectedSale?.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div v-if="selectedSale" class="modal-body">
            <!-- Datos del cliente -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <strong>Datos del Cliente</strong>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <small class="text-muted">Nombre:</small><br />
                    <strong>{{ selectedSale.clientName || 'N/A' }}</strong>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Documento:</small><br />
                    <strong>{{ selectedSale.clientDocumentId || 'N/A' }}</strong>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Contacto:</small><br />
                    <strong>{{ selectedSale.clientContact || 'N/A' }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información de la venta -->
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Fecha:</strong> {{ formatDate(selectedSale.date) }}
              </div>
              <div class="col-md-6">
                <strong>Método de Pago:</strong>
                {{ getPaymentMethodLabel(selectedSale.paymentMethod) }}
              </div>
            </div>

            <h6 class="mb-3">Productos:</h6>
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cantidad</th>
                  <th class="text-end">Precio Unit.</th>
                  <th class="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedSale.items" :key="idx">
                  <td>{{ item.product.name }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-end">${{ item.product.price.toFixed(2) }}</td>
                  <td class="text-end">${{ item.subtotal.toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                  <td class="text-end">
                    <strong>${{ selectedSale.total.toFixed(2) }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-success"
              @click="viewInvoice(selectedSale!)"
              data-bs-dismiss="modal"
            >
              📄 Ver Factura
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Factura -->
    <div
      v-if="showInvoiceModal && selectedSale"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header d-print-none">
            <h5 class="modal-title">Factura #{{ selectedSale.id }}</h5>
            <button type="button" class="btn-close" @click="closeInvoiceModal"></button>
          </div>
          <div class="modal-body">
            <!-- Contenido de la factura -->
            <div class="invoice-container p-4">
              <div class="text-center mb-4">
                <h2>FACTURA</h2>
                <p class="mb-0">Sistema POS - Tu Empresa</p>
                <small class="text-muted">RUC: 12345678901</small>
              </div>

              <div class="row mb-4">
                <div class="col-6">
                  <strong>Factura N°:</strong> {{ selectedSale.id }}<br />
                  <strong>Fecha:</strong> {{ formatDate(selectedSale.date) }}<br />
                  <strong>Método de Pago:</strong>
                  {{ getPaymentMethodLabel(selectedSale.paymentMethod) }}
                </div>
                <div class="col-6 text-end">
                  <strong>Cliente</strong><br />
                  {{ selectedSale.clientName }}<br />
                  Doc: {{ selectedSale.clientDocumentId }}<br />
                  {{ selectedSale.clientContact }}
                </div>
              </div>

              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-end">P. Unit.</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in selectedSale.items" :key="idx">
                    <td>{{ item.product.name }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-end">${{ item.product.price.toFixed(2) }}</td>
                    <td class="text-end">${{ item.subtotal.toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                    <td class="text-end">
                      <h5 class="mb-0">${{ selectedSale.total.toFixed(2) }}</h5>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div class="text-center mt-4">
                <small class="text-muted">Gracias por su compra</small>
              </div>
            </div>
          </div>
          <div class="modal-footer d-print-none">
            <button class="btn btn-primary" @click="printInvoice">🖨️ Imprimir</button>
            <button class="btn btn-success" @click="downloadInvoice">📥 Descargar PDF</button>
            <button type="button" class="btn btn-secondary" @click="closeInvoiceModal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .d-print-none {
    display: none !important;
  }

  .invoice-container {
    padding: 20px;
  }
}

.modal.show {
  display: block;
}
</style>
