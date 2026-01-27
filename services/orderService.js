import api from '../config/api';

export const orderService = {
  async createOrder(items) {
    const response = await api.post('/api/orders', { items });
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/api/orders/my');
    return response.data;
  },

  async getAllOrders() {
    const response = await api.get('/api/orders');
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id, status) {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },
};

