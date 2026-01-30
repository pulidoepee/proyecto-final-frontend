// src/modules/pos/services/salesService.ts

import apiClient from '@/api/apiClient';
import type { Sale, CreateSaleDto } from '@/modules/pos/types/index';

export const salesService = {
  async getAll(): Promise<Sale[]> {
    const { data } = await apiClient.get<Sale[]>('/sales');
    return data;
  },

  async getById(id: number): Promise<Sale> {
    const { data } = await apiClient.get<Sale>(`/sales/${id}`);
    return data;
  },

  async create(saleData: CreateSaleDto): Promise<Sale> {
    const { data } = await apiClient.post<Sale>('/sales', saleData);
    return data;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const { data } = await apiClient.get<Sale[]>('/sales/range', {
      params: { startDate, endDate },
    });
    return data;
  },
};
