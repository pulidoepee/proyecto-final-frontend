// src/modules/pos/types/index.ts

// src/modules/pos/types/index.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  barcode?: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  items: CartItem[];
  total: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'transfer';
  customerId?: number;
  status: 'completed' | 'pending' | 'cancelled';
  clientName?: string;
  clientDocumentId?: string;
  clientContact?: string;
}

export interface CreateSaleDto {
  items: { productId: number; quantity: number }[];
  paymentMethod: 'cash' | 'card' | 'transfer';
  clientName: string;
  clientDocumentId: string;
  clientContact: string;
  customerId?: number;
}
