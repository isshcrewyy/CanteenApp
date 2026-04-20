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
  TextInput,
} from 'react-native';
import { menuService } from '../services/menuService';
import { MenuItem, MenuItemCreate, User } from '../types';

interface StaffDashboardScreenProps {
  user: User | null;
  onLogout: () => void;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  category: string;
}

const StaffDashboardScreen: React.FC<StaffDashboardScreenProps> = ({ user, onLogout }) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    isAvailable: true,
    category: '',
  });

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async (): Promise<void> => {
    try {
      const data = await menuService.getAll();
      setMenus(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    loadMenus();
  };

  const openAddModal = (): void => {
    setEditingMenu(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      isAvailable: true,
      category: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (menu: MenuItem): void => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      description: menu.description,
      price: menu.price.toString(),
      isAvailable: menu.isAvailable,
      category: menu.category || '',
    });
    setModalVisible(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const menuData: MenuItemCreate = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        isAvailable: formData.isAvailable,
        category: formData.category || undefined,
      };

      if (editingMenu) {
        await menuService.update(editingMenu.menuId, menuData);
        Alert.alert('Success', 'Menu item updated successfully');
      } else {
        await menuService.create(menuData);
        Alert.alert('Success', 'Menu item created successfully');
      }

      setModalVisible(false);
      loadMenus();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save menu item'
      );
    }
  };

  const handleDelete = async (menuId: number): Promise<void> => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await menuService.delete(menuId);
              Alert.alert('Success', 'Menu item deleted successfully');
              loadMenus();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
        {item.category && (
          <Text style={styles.menuCategory}>Category: {item.category}</Text>
        )}
        <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
        <Text style={[styles.availability, !item.isAvailable && styles.unavailable]}>
          {item.isAvailable ? 'Available' : 'Not Available'}
        </Text>
      </View>
      <View style={styles.menuActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.menuId)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={menus}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.menuId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No menu items found</Text>
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
            <Text style={styles.modalTitle}>
              {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Price *"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Category"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
            >
              <Text style={styles.toggleButtonText}>
                Available: {formData.isAvailable ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#34c759',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
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
  menuItem: {
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
  menuInfo: {
    marginBottom: 10,
  },
  menuName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  menuCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  availability: {
    fontSize: 12,
    color: '#34c759',
    marginTop: 5,
  },
  unavailable: {
    color: '#ff3b30',
  },
  menuActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleButtonText: {
    fontSize: 16,
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

export default StaffDashboardScreen;
