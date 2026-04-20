import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { adminService } from '../services/adminService';
import { User } from '../types';

interface AdminUser {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminDashboardScreenProps {
  user: User | null;
  onLogout: () => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ user, onLogout }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (): Promise<void> => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    loadUsers();
  };

  const openRoleModal = (userItem: AdminUser): void => {
    setSelectedUser(userItem);
    setNewRole(userItem.role);
    setModalVisible(true);
  };

  const handleUpdateRole = async (): Promise<void> => {
    if (!selectedUser || !newRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    try {
      await adminService.updateUserRole(selectedUser.userId, newRole);
      Alert.alert('Success', 'User role updated successfully');
      setModalVisible(false);
      loadUsers();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update user role'
      );
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'SystemAdmin':
        return '#ff3b30';
      case 'CanteenStaff':
        return '#007AFF';
      case 'Customer':
        return '#34c759';
      default:
        return '#666';
    }
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
        <Text style={styles.userDate}>
          Joined: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => openRoleModal(item)}
      >
        <Text style={styles.updateButtonText}>Update Role</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.userId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found</Text>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update User Role</Text>
            <Text style={styles.modalUser}>
              {selectedUser?.fullName} ({selectedUser?.email})
            </Text>

            <Text style={styles.modalLabel}>Select Role:</Text>
            <View style={styles.roleButtons}>
              {['Customer', 'CanteenStaff', 'SystemAdmin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    newRole === role && styles.roleOptionSelected,
                  ]}
                  onPress={() => setNewRole(role)}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      newRole === role && styles.roleOptionTextSelected,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateRole}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 5,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 14,
  },
  loader: {
    marginTop: 50,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  roleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalUser: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roleButtons: {
    marginBottom: 20,
  },
  roleOption: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#333',
  },
  roleOptionTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;
