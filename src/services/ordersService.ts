import { apiClient } from './apiClient';
import type { Order, CreateOrderPayload } from '../types/checkout';

export interface BankTransferInfo {
  bankName: string;
  accountHolder: string;
  cbu: string;
  alias: string;
  cuit: string;
}

/** Foto elegida con expo-image-picker, lista para mandar como parte de un FormData. */
export interface PickedProofFile {
  uri: string;
  name: string;
  type: string;
}

export const ordersService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    return apiClient.post<Order>('/orders', payload);
  },

  async payCard(orderId: string, cardToken: string, deviceSessionId: string): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/pay/card`, { cardToken, deviceSessionId });
  },

  async uploadTransferProof(orderId: string, file: PickedProofFile, reference?: string): Promise<Order> {
    const formData = new FormData();
    // En React Native, FormData.append espera este objeto especial en vez
    // de un File del DOM — RN arma el multipart a partir de uri/name/type.
    formData.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    if (reference) formData.append('reference', reference);
    return apiClient.postForm<Order>(`/orders/${orderId}/transfer-proof`, formData);
  },

  async getMyOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders/me');
  },

  async getById(orderId: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  },

  async getBankTransferInfo(): Promise<BankTransferInfo> {
    return apiClient.get<BankTransferInfo>('/orders/bank-transfer-info');
  },
};
