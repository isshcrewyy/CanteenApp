import api from '../config/api';
import { Order, OrderCreate, OrderStatus, QueueItem, QueueStats, WaitTimeInfo } from '../types';

interface OrderService {
  createOrder: (items: OrderCreate['items']) => Promise<Order>;
  getMyOrders: () => Promise<Order[]>;
  getAllOrders: () => Promise<Order[]>;
  getOrderById: (id: number) => Promise<Order>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<Order>;
  getWaitTime: (orderId: number) => Promise<WaitTimeInfo>;
  getOrderQueue: () => Promise<QueueItem[]>;
  getQueueStats: () => Promise<QueueStats>;
  processNextOrder: () => Promise<Order>;
}

export const orderService: OrderService = {
  async createOrder(items: OrderCreate['items']): Promise<Order> {
    const response = await api.post<Order>('/api/orders', { items });
    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/api/orders/my');
    return response.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/api/orders');
    return response.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/api/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await api.put<Order>(`/api/orders/${id}/status`, { status });
    return response.data;
  },

  async getWaitTime(orderId: number): Promise<WaitTimeInfo> {
    const response = await api.get<WaitTimeInfo>(`/api/orderqueue/${orderId}/wait-time`);
    return response.data;
  },

  async getOrderQueue(): Promise<QueueItem[]> {
    const response = await api.get<QueueItem[]>('/api/orderqueue');
    return response.data;
  },

  async getQueueStats(): Promise<QueueStats> {
    const response = await api.get<QueueStats>('/api/orderqueue/stats');
    return response.data;
  },

  async processNextOrder(): Promise<Order> {
    const response = await api.post<Order>('/api/orderqueue/process-next');
    return response.data;
  },
};
