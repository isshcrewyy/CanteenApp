import React, { useState, useEffect, useRef } from 'react';
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
import { orderService } from '../services/orderService';
import { QueueItem, QueueStats, User } from '../types';

interface OrderQueueScreenProps {
  user: User | null;
  onLogout: () => void;
}

const OrderQueueScreen: React.FC<OrderQueueScreenProps> = ({ user, onLogout }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();

    // Poll every 15 seconds for queue updates
    pollInterval.current = setInterval(() => {
      loadData(true);
    }, 15000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const loadData = async (silent: boolean = false): Promise<void> => {
    try {
      if (!silent) setLoading(true);
      const [queueData, statsData] = await Promise.all([
        orderService.getOrderQueue(),
        orderService.getQueueStats(),
      ]);
      setQueue(queueData);
      setStats(statsData);
    } catch (error) {
      if (!silent) {
        Alert.alert('Error', 'Failed to load order queue');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    loadData();
  };

  const handleProcessNext = async (): Promise<void> => {
    Alert.alert(
      'Process Next Order',
      'This will start preparing the next order in queue. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process',
          onPress: async () => {
            setProcessing(true);
            try {
              const result = await orderService.processNextOrder();
              Alert.alert(
                'Success',
                `Order #${result.orderId} (${result.orderTag}) is now being prepared!`
              );
              loadData();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to process order'
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string): Promise<void> => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      loadData();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderQueueItem = ({ item, index }: { item: QueueItem; index: number }) => (
    <View style={styles.queueItem}>
      <View style={styles.queuePositionContainer}>
        <Text style={styles.queuePosition}>#{item.queuePosition || index + 1}</Text>
      </View>
      
      <View style={styles.queueItemInfo}>
        <View style={styles.queueItemHeader}>
          <Text style={styles.orderId}>Order #{item.orderId}</Text>
          <Text style={styles.orderTag}>{item.orderTag}</Text>
        </View>
        
        <View style={styles.queueItemDetails}>
          <Text style={styles.detailText}>
            ⏱️ Est. Wait: {item.estimatedWaitTime || item.estimatedWaitMinutes || '-'} min
          </Text>
          <Text style={styles.detailText}>
            🕐 Created: {formatTime(item.createdAt)}
          </Text>
        </View>

        {item.items && (
          <View style={styles.orderItemsList}>
            {item.items.slice(0, 3).map((orderItem, idx) => (
              <Text key={idx} style={styles.orderItemText}>
                • {orderItem.menuName} x{orderItem.quantity}
              </Text>
            ))}
            {item.items.length > 3 && (
              <Text style={styles.moreItemsText}>
                +{item.items.length - 3} more items
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.queueItemActions}>
        <TouchableOpacity
          style={styles.readyButton}
          onPress={() => handleUpdateStatus(item.orderId, 'Ready')}
        >
          <Text style={styles.readyButtonText}>Ready</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleUpdateStatus(item.orderId, 'Completed')}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Queue</Text>
        {user && (
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Card */}
      {stats && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalOrdersInQueue || 0}</Text>
            <Text style={styles.statLabel}>Orders in Queue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.estimatedTotalProcessingTime || 0} min
            </Text>
            <Text style={styles.statLabel}>Est. Processing Time</Text>
          </View>
        </View>
      )}

      {/* Process Next Button */}
      <TouchableOpacity
        style={[
          styles.processNextButton,
          (processing || queue.length === 0) && styles.processNextButtonDisabled,
        ]}
        onPress={handleProcessNext}
        disabled={processing || queue.length === 0}
      >
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.processNextIcon}>▶️</Text>
            <Text style={styles.processNextText}>Process Next Order</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Queue List */}
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={queue}
          renderItem={renderQueueItem}
          keyExtractor={(item) => item.orderId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No orders in queue</Text>
              <Text style={styles.emptySubtext}>
                New orders will appear here automatically
              </Text>
            </View>
          }
          contentContainerStyle={queue.length === 0 ? styles.emptyListContainer : undefined}
        />
      )}

      {/* Auto-refresh indicator */}
      <View style={styles.refreshIndicator}>
        <Text style={styles.refreshIndicatorText}>
          Auto-refreshes every 15 seconds
        </Text>
      </View>
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
  statsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  processNextButton: {
    backgroundColor: '#34c759',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  processNextButtonDisabled: {
    backgroundColor: '#a8d5ba',
  },
  processNextIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  processNextText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  queueItem: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  queuePositionContainer: {
    backgroundColor: '#007AFF',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queuePosition: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  queueItemInfo: {
    flex: 1,
    padding: 15,
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTag: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  queueItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  orderItemsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderItemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  queueItemActions: {
    justifyContent: 'center',
    padding: 10,
    gap: 8,
  },
  readyButton: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  readyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#34c759',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  refreshIndicator: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  refreshIndicatorText: {
    fontSize: 11,
    color: '#999',
  },
});

export default OrderQueueScreen;
