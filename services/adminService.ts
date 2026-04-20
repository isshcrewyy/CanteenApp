import api from '../config/api';
import { User } from '../types';

interface AdminService {
  getAllUsers: () => Promise<User[]>;
  updateUserRole: (userId: number, role: string) => Promise<User>;
}

export const adminService: AdminService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/admin/users');
    return response.data;
  },

  async updateUserRole(userId: number, role: string): Promise<User> {
    const response = await api.put<User>(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },
};
