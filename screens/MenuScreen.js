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
} from 'react-native';
import { menuService } from '../services/menuService';

const MenuScreen = ({ navigation, route, user, onLogout }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadMenus();
  }, [sortBy]);

  const loadMenus = async () => {
    try {
      const data = await menuService.getAll(sortBy);
      setMenus(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMenus();
  };

  const handleAddToCart = (menuItem) => {
    if (user?.role === 'Customer') {
      navigation.navigate('PlaceOrder', { menuItem });
    }
  };

  const renderMenuItem = ({ item }) => (
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
      {user?.role === 'Customer' && item.isAvailable && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonActiveText]}>Name</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'price' && styles.sortButtonActiveText]}>Price</Text>
          </TouchableOpacity>
        </View>
        {user && (
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
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
            <Text style={styles.emptyText}>No menu items available</Text>
          }
        />
      )}
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
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  sortButtonActiveText: {
    color: '#fff',
  },
  logoutButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
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
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default MenuScreen;

