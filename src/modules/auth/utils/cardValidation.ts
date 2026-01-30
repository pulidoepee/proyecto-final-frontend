// src/modules/pos/utils/cardValidation.ts

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface CardValidationResult {
  isValid: boolean;
  cardType: CardType;
  message?: string;
}

/**
 * Detecta el tipo de tarjeta por su número
 */
export function detectCardType(cardNumber: string): CardType {
  const cleaned = cardNumber.replace(/\s/g, '');

  // Visa: empieza con 4
  if (/^4/.test(cleaned)) return 'visa';

  // Mastercard: empieza con 51-55 o 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';

  // American Express: empieza con 34 o 37
  if (/^3[47]/.test(cleaned)) return 'amex';

  return 'unknown';
}

/**
 * Algoritmo de Luhn para validar número de tarjeta
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valida CVV según tipo de tarjeta
 */
export function validateCVV(cvv: string, cardType: CardType): boolean {
  const cleaned = cvv.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) return false;

  // American Express usa 4 dígitos, el resto 3
  if (cardType === 'amex') {
    return cleaned.length === 4;
  }

  return cleaned.length === 3;
}

/**
 * Valida fecha de expiración (MM/YY)
 */
export function validateExpiryDate(expiry: string): boolean {
  const cleaned = expiry.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{2})\/(\d{2})$/);

  if (!match || !match[1] || !match[2]) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt('20' + match[2], 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

/**
 * Formatea número de tarjeta con espacios
 */
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}

/**
 * Formatea fecha de expiración (MM/YY)
 */
export function formatExpiryDate(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
}

/**
 * Obtiene los últimos 4 dígitos de la tarjeta
 */
export function getLastFourDigits(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.slice(-4);
}

/**
 * Enmascara el número de tarjeta (ej: **** **** **** 1234)
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const lastFour = cleaned.slice(-4);
  return '**** **** **** ' + lastFour;
}
