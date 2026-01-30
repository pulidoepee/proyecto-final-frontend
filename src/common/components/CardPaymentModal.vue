<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  detectCardType,
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  formatCardNumber,
  formatExpiryDate,
  getLastFourDigits,
  type CardType,
} from '@/modules/auth/utils/cardValidation';

const props = defineProps<{
  show: boolean;
  amount: number;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [cardData: { lastFour: string; cardType: CardType; holderName: string }];
}>();

const cardNumber = ref('');
const holderName = ref('');
const expiryDate = ref('');
const cvv = ref('');

const errors = ref({
  cardNumber: '',
  holderName: '',
  expiryDate: '',
  cvv: '',
});

const cardType = computed(() => detectCardType(cardNumber.value));

const cardIcon = computed(() => {
  switch (cardType.value) {
    case 'visa':
      return '💳 Visa';
    case 'mastercard':
      return '💳 Mastercard';
    case 'amex':
      return '💳 Amex';
    default:
      return '💳';
  }
});

// Formatear número de tarjeta mientras se escribe
watch(cardNumber, (newValue) => {
  const formatted = formatCardNumber(newValue);
  if (formatted !== newValue) {
    cardNumber.value = formatted;
  }
});

// Formatear fecha mientras se escribe
watch(expiryDate, (newValue) => {
  const formatted = formatExpiryDate(newValue);
  if (formatted !== newValue) {
    expiryDate.value = formatted;
  }
});

function validateForm(): boolean {
  errors.value = {
    cardNumber: '',
    holderName: '',
    expiryDate: '',
    cvv: '',
  };

  let isValid = true;

  // Validar número de tarjeta
  if (!cardNumber.value.trim()) {
    errors.value.cardNumber = 'El número de tarjeta es obligatorio';
    isValid = false;
  } else if (!validateCardNumber(cardNumber.value)) {
    errors.value.cardNumber = 'Número de tarjeta inválido';
    isValid = false;
  }

  // Validar nombre
  if (!holderName.value.trim()) {
    errors.value.holderName = 'El nombre es obligatorio';
    isValid = false;
  } else if (holderName.value.trim().length < 3) {
    errors.value.holderName = 'El nombre debe tener al menos 3 caracteres';
    isValid = false;
  }

  // Validar fecha
  if (!expiryDate.value.trim()) {
    errors.value.expiryDate = 'La fecha es obligatoria';
    isValid = false;
  } else if (!validateExpiryDate(expiryDate.value)) {
    errors.value.expiryDate = 'Fecha inválida o expirada';
    isValid = false;
  }

  // Validar CVV
  if (!cvv.value.trim()) {
    errors.value.cvv = 'El CVV es obligatorio';
    isValid = false;
  } else if (!validateCVV(cvv.value, cardType.value)) {
    errors.value.cvv =
      cardType.value === 'amex' ? 'CVV debe ser de 4 dígitos' : 'CVV debe ser de 3 dígitos';
    isValid = false;
  }

  return isValid;
}

function handleConfirm() {
  if (!validateForm()) {
    return;
  }

  emit('confirm', {
    lastFour: getLastFourDigits(cardNumber.value),
    cardType: cardType.value,
    holderName: holderName.value,
  });

  // Limpiar formulario
  resetForm();
}

function handleClose() {
  resetForm();
  emit('close');
}

function resetForm() {
  cardNumber.value = '';
  holderName.value = '';
  expiryDate.value = '';
  cvv.value = '';
  errors.value = {
    cardNumber: '',
    holderName: '',
    expiryDate: '',
    cvv: '',
  };
}

// Prevenir entrada de letras en campos numéricos
function onlyNumbers(event: KeyboardEvent) {
  if (
    !/[0-9]/.test(event.key) &&
    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)
  ) {
    event.preventDefault();
  }
}
</script>

<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">💳 Pago con Tarjeta</h5>
          <button type="button" class="btn-close btn-close-white" @click="handleClose"></button>
        </div>

        <div class="modal-body">
          <!-- Monto a pagar -->
          <div class="alert alert-info text-center mb-4">
            <h4 class="mb-0">Total a pagar: ${{ amount.toFixed(2) }}</h4>
          </div>

          <!-- Número de tarjeta -->
          <div class="mb-3">
            <label class="form-label">
              Número de Tarjeta *
              <span v-if="cardType !== 'unknown'" class="ms-2">{{ cardIcon }}</span>
            </label>
            <input
              v-model="cardNumber"
              type="text"
              class="form-control form-control-lg"
              :class="{ 'is-invalid': errors.cardNumber }"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              @keydown="onlyNumbers"
            />
            <div v-if="errors.cardNumber" class="invalid-feedback">
              {{ errors.cardNumber }}
            </div>
          </div>

          <!-- Nombre del titular -->
          <div class="mb-3">
            <label class="form-label">Nombre del Titular *</label>
            <input
              v-model="holderName"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.holderName }"
              placeholder="JUAN PEREZ"
              style="text-transform: uppercase"
            />
            <div v-if="errors.holderName" class="invalid-feedback">
              {{ errors.holderName }}
            </div>
          </div>

          <div class="row">
            <!-- Fecha de expiración -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Fecha de Expiración *</label>
              <input
                v-model="expiryDate"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.expiryDate }"
                placeholder="MM/YY"
                maxlength="5"
                @keydown="onlyNumbers"
              />
              <div v-if="errors.expiryDate" class="invalid-feedback">
                {{ errors.expiryDate }}
              </div>
            </div>

            <!-- CVV -->
            <div class="col-md-6 mb-3">
              <label class="form-label">CVV *</label>
              <input
                v-model="cvv"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.cvv }"
                placeholder="123"
                :maxlength="cardType === 'amex' ? 4 : 3"
                @keydown="onlyNumbers"
              />
              <div v-if="errors.cvv" class="invalid-feedback">
                {{ errors.cvv }}
              </div>
            </div>
          </div>

          <!-- Información de seguridad -->
          <div class="alert alert-warning small">
            <i class="bi bi-shield-check"></i>
            <strong>Simulación:</strong> Esta es una transacción simulada. No se procesará ningún
            pago real.
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleClose">Cancelar</button>
          <button type="button" class="btn btn-success btn-lg" @click="handleConfirm">
            💳 Procesar Pago
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal.show {
  display: block;
}

input[type='text'] {
  font-family: 'Courier New', monospace;
}

.form-control-lg {
  font-size: 1.1rem;
  letter-spacing: 2px;
}
</style>
