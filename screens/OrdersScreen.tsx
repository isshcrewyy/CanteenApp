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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { orderService } from '../services/orderService';
import { Order, OrderItem, User, RootStackParamList } from '../types';

interface OrdersScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Main'>;
  user: User | null;
  onLogout: () => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation, route, user, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (): Promise<void> => {
    try {
      let data: Order[];
      if (user?.role === 'Customer') {
        data = await orderService.getMyOrders();
      } else {
        data = await orderService.getAllOrders();
      }
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    loadOrders();
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string): Promise<void> => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', 'Order status updated');
      loadOrders();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending':
        return '#ff9500';
      case 'Preparing':
        return '#007AFF';
      case 'Ready':
        return '#34c759';
      case 'Completed':
        return '#34c759';
      case 'Cancelled':
        return '#ff3b30';
      default:
        return '#666';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => {
        if (user?.role === 'Customer') {
          navigation.navigate('OrderTracking', { 
            orderId: item.orderId,
            orderTag: item.orderTag,
            initialOrder: item
          });
        }
      }}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderTag}>Tag: {item.orderTag}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {user?.role !== 'Customer' && (
        <Text style={styles.customerInfo}>
          Customer: {item.userName} ({item.userEmail})
        </Text>
      )}

      <Text style={styles.orderDate}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>

      <View style={styles.itemsContainer}>
        {item.items.map((orderItem: OrderItem) => (
          <View key={orderItem.orderedItemId} style={styles.orderItemRow}>
            <Text style={styles.itemName}>{orderItem.menuName}</Text>
            <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
            <Text style={styles.itemPrice}>
              ${orderItem.subTotal.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
      </View>

      {(user?.role === 'CanteenStaff' || user?.role === 'SystemAdmin') && (
        <View style={styles.statusButtons}>
          {item.status === 'Pending' && (
            <>
              <TouchableOpacity
                style={[styles.statusButton, styles.preparingButton]}
                onPress={() => handleStatusUpdate(item.orderId, 'Preparing')}
              >
                <Text style={styles.statusButtonText}>Start Preparing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.cancelButton]}
                onPress={() => handleStatusUpdate(item.orderId, 'Cancelled')}
              >
                <Text style={styles.statusButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'Preparing' && (
            <>
              <TouchableOpacity
                style={[styles.statusButton, styles.readyButton]}
                onPress={() => handleStatusUpdate(item.orderId, 'Ready')}
              >
                <Text style={styles.statusButtonText}>Mark Ready</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.cancelButton]}
                onPress={() => handleStatusUpdate(item.orderId, 'Cancelled')}
              >
                <Text style={styles.statusButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'Ready' && (
            <>
              <TouchableOpacity
                style={[styles.statusButton, styles.completeButton]}
                onPress={() => handleStatusUpdate(item.orderId, 'Completed')}
              >
                <Text style={styles.statusButtonText}>Mark Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.cancelButton]}
                onPress={() => handleStatusUpdate(item.orderId, 'Cancelled')}
              >
                <Text style={styles.statusButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Track Order button for customers */}
      {user?.role === 'Customer' && item.status !== 'Completed' && item.status !== 'Cancelled' && (
        <View style={styles.trackOrderContainer}>
          <Text style={styles.trackOrderHint}>Tap to track order</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.role === 'Customer' ? 'My Orders' : 'All Orders'}
        </Text>
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
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.orderId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders found</Text>
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
  orderItem: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderTag: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  customerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  itemsContainer: {
    marginBottom: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemQuantity: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusButtons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  preparingButton: {
    backgroundColor: '#007AFF',
  },
  readyButton: {
    backgroundColor: '#34c759',
  },
  completeButton: {
    backgroundColor: '#34c759',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  trackOrderContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  trackOrderHint: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default OrdersScreen;
