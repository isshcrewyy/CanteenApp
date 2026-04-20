import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { orderService } from '../services/orderService';
import { Order, WaitTimeInfo, RootStackParamList } from '../types';

interface OrderTrackingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OrderTracking'>;
  route: RouteProp<RootStackParamList, 'OrderTracking'>;
}

const STATUS_STEPS: string[] = ['Pending', 'Preparing', 'Ready', 'Completed'];

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ navigation, route }) => {
  const { orderId, orderTag, initialOrder } = route.params || {};
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [waitTimeInfo, setWaitTimeInfo] = useState<WaitTimeInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const previousStatus = useRef<string | null>(null);

  useEffect(() => {
    loadOrderDetails();
    loadWaitTime();

    // Poll every 30 seconds for status updates
    pollInterval.current = setInterval(() => {
      loadOrderDetails(true);
      loadWaitTime();
    }, 30000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [orderId]);

  const loadOrderDetails = async (silent: boolean = false): Promise<void> => {
    if (!orderId) return;
    
    try {
      if (!silent) setLoading(true);
      const data = await orderService.getOrderById(orderId);
      
      // Check if status changed to "Ready"
      if (previousStatus.current && 
          previousStatus.current !== 'Ready' && 
          data.status === 'Ready') {
        Alert.alert(
          '🎉 Order Ready!',
          `Your order (${data.orderTag}) is ready for pickup!`,
          [{ text: 'OK' }]
        );
      }
      
      previousStatus.current = data.status;
      setOrder(data);
    } catch (error) {
      if (!silent) {
        Alert.alert('Error', 'Failed to load order details');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadWaitTime = async (): Promise<void> => {
    if (!orderId) return;
    
    try {
      const data = await orderService.getWaitTime(orderId);
      setWaitTimeInfo(data);
    } catch (error) {
      console.error('Failed to load wait time:', error);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    loadOrderDetails();
    loadWaitTime();
  };

  const getStatusIndex = (status: string): number => {
    return STATUS_STEPS.indexOf(status);
  };

  const getStatusColor = (status: string | undefined): string => {
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

  const renderProgressIndicator = (): React.ReactNode => {
    if (!order || order.status === 'Cancelled') return null;

    const currentIndex = getStatusIndex(order.status);

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Order Progress</Text>
        <View style={styles.progressSteps}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <View key={step} style={styles.stepContainer}>
                <View style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    {isCompleted && <Text style={styles.stepCheckmark}>✓</Text>}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        index < currentIndex && styles.stepLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Order Confirmation Card */}
      <View style={styles.confirmationCard}>
        <Text style={styles.confirmationIcon}>✅</Text>
        <Text style={styles.confirmationTitle}>Order Placed Successfully!</Text>
        
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderId}>#{order?.orderId}</Text>
        </View>
        
        <View style={styles.orderTagContainer}>
          <Text style={styles.orderTagLabel}>Order Tag</Text>
          <Text style={styles.orderTag}>{order?.orderTag || orderTag}</Text>
        </View>
        
        <Text style={styles.pickupNote}>
          Show this tag at the counter for pickup
        </Text>
      </View>

      {/* Wait Time Card */}
      {waitTimeInfo && order?.status !== 'Completed' && order?.status !== 'Cancelled' && (
        <View style={styles.waitTimeCard}>
          <Text style={styles.waitTimeTitle}>⏱️ Estimated Wait Time</Text>
          <Text style={styles.waitTimeValue}>
            {waitTimeInfo.estimatedWaitMinutes} minutes
          </Text>
          <View style={styles.waitTimeDetails}>
            <View style={styles.waitTimeDetail}>
              <Text style={styles.waitTimeDetailLabel}>Orders Ahead</Text>
              <Text style={styles.waitTimeDetailValue}>
                {waitTimeInfo.ordersAhead}
              </Text>
            </View>
            <View style={styles.waitTimeDetail}>
              <Text style={styles.waitTimeDetailLabel}>Total in Queue</Text>
              <Text style={styles.waitTimeDetailValue}>
                {waitTimeInfo.totalOrdersInQueue}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Progress Indicator */}
      {renderProgressIndicator()}

      {/* Current Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusCardTitle}>Current Status</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order?.status) },
          ]}
        >
          <Text style={styles.statusBadgeText}>{order?.status}</Text>
        </View>
        {order?.status === 'Preparing' && (
          <Text style={styles.statusMessage}>
            🍳 Your order is being prepared...
          </Text>
        )}
        {order?.status === 'Ready' && (
          <Text style={styles.statusMessage}>
            🎉 Your order is ready for pickup!
          </Text>
        )}
        {order?.status === 'Completed' && (
          <Text style={styles.statusMessage}>
            ✅ Order completed. Thank you!
          </Text>
        )}
        {order?.status === 'Cancelled' && (
          <Text style={[styles.statusMessage, styles.cancelledMessage]}>
            ❌ This order has been cancelled.
          </Text>
        )}
      </View>

      {/* Order Items */}
      {order?.items && order.items.length > 0 && (
        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.orderedItemId} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.menuName}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>${item.subTotal.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              ${order.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Refresh Note */}
      <Text style={styles.refreshNote}>
        Pull down to refresh • Auto-updates every 30 seconds
      </Text>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  confirmationCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmationIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#34c759',
  },
  orderIdContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#999',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTagContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  orderTagLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  orderTag: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  pickupNote: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  waitTimeCard: {
    backgroundColor: '#fff8e7',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe0a0',
  },
  waitTimeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  waitTimeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff9500',
    textAlign: 'center',
    marginBottom: 15,
  },
  waitTimeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  waitTimeDetail: {
    alignItems: 'center',
  },
  waitTimeDetailLabel: {
    fontSize: 12,
    color: '#666',
  },
  waitTimeDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircleCompleted: {
    backgroundColor: '#34c759',
  },
  stepCircleCurrent: {
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#cce5ff',
  },
  stepCheckmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepLine: {
    position: 'absolute',
    left: '50%',
    width: '100%',
    height: 3,
    backgroundColor: '#e0e0e0',
    zIndex: 0,
  },
  stepLineCompleted: {
    backgroundColor: '#34c759',
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#34c759',
    fontWeight: 'bold',
  },
  stepLabelCurrent: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusCardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusMessage: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  cancelledMessage: {
    color: '#ff3b30',
  },
  itemsCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
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
  refreshNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginVertical: 10,
  },
  backButton: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderTrackingScreen;
