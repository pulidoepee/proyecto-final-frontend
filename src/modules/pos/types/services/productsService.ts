// src/modules/pos/services/productsService.ts

import apiClient from '@/api/apiClient';
import type { Product } from '@/modules/pos/types/index';

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products');
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', product);
    return data;
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, product);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async search(query: string): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products/search', {
      params: { q: query },
    });
    return data;
  },
};
