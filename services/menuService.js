import api from '../config/api';

export const menuService = {
  async getAll(sortBy = null) {
    const params = sortBy ? { sortBy } : {};
    const response = await api.get('/api/menu', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/api/menu/${id}`);
    return response.data;
  },

  async create(menuData) {
    const response = await api.post('/api/menu', menuData);
    return response.data;
  },

  async update(id, menuData) {
    const response = await api.put(`/api/menu/${id}`, menuData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/api/menu/${id}`);
    return response.data;
  },
};

