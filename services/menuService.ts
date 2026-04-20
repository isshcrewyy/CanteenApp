import api from '../config/api';
import { MenuItem, MenuItemCreate } from '../types';

interface MenuService {
  getAll: (sortBy?: string | null) => Promise<MenuItem[]>;
  getById: (id: number) => Promise<MenuItem>;
  create: (menuData: MenuItemCreate) => Promise<MenuItem>;
  update: (id: number, menuData: MenuItemCreate) => Promise<MenuItem>;
  delete: (id: number) => Promise<void>;
  search: (keyword: string) => Promise<MenuItem[]>;
  searchExact: (name: string) => Promise<MenuItem | null>;
  getPopular: (count?: number) => Promise<MenuItem[]>;
}

export const menuService: MenuService = {
  async getAll(sortBy: string | null = null): Promise<MenuItem[]> {
    const params = sortBy ? { sortBy } : {};
    const response = await api.get<MenuItem[]>('/api/menu', { params });
    return response.data;
  },

  async getById(id: number): Promise<MenuItem> {
    const response = await api.get<MenuItem>(`/api/menu/${id}`);
    return response.data;
  },

  async create(menuData: MenuItemCreate): Promise<MenuItem> {
    const response = await api.post<MenuItem>('/api/menu', menuData);
    return response.data;
  },

  async update(id: number, menuData: MenuItemCreate): Promise<MenuItem> {
    const response = await api.put<MenuItem>(`/api/menu/${id}`, menuData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/menu/${id}`);
  },

  async search(keyword: string): Promise<MenuItem[]> {
    const response = await api.get<MenuItem[]>('/api/menu/search', { params: { keyword } });
    return response.data;
  },

  async searchExact(name: string): Promise<MenuItem | null> {
    const response = await api.get<MenuItem | null>('/api/menu/search/exact', { params: { name } });
    return response.data;
  },

  async getPopular(count: number = 5): Promise<MenuItem[]> {
    const response = await api.get<MenuItem[]>('/api/menu/popular', { params: { count } });
    return response.data;
  },
};
