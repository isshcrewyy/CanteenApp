import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { menuService } from '../services/menuService';
import { orderService } from '../services/orderService';

const PlaceOrderScreen = ({ navigation, route }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { menuItem } = route.params || {};

  useEffect(() => {
    if (menuItem) {
      setCart([{ menuId: menuItem.menuId, quantity: 1, menu: menuItem }]);
    }
  }, [menuItem]);

  const updateQuantity = (menuId, delta) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) => {
        if (item.menuId === menuId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return newCart;
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity,
      }));

      const order = await orderService.createOrder(orderItems);
      Alert.alert(
        'Order Placed!',
        `Your order has been placed successfully!\nOrder Tag: ${order.orderTag}\nPlease show this tag at the counter.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Order Failed',
        error.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Place Order</Text>

      {cart.map((item) => (
        <View key={item.menuId} style={styles.cartItem}>
          <View style={styles.cartItemInfo}>
            <Text style={styles.cartItemName}>{item.menu.name}</Text>
            <Text style={styles.cartItemPrice}>
              ${item.menu.price.toFixed(2)} each
            </Text>
          </View>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.menuId, -1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.menuId, 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtotal}>
            ${(item.menu.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityButton: {
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlaceOrderScreen;

