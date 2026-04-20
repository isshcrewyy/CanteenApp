import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MenuItem, RootStackParamList } from '../types';

interface MenuItemDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MenuItemDetail'>;
  route: RouteProp<RootStackParamList, 'MenuItemDetail'>;
}

const MenuItemDetailScreen: React.FC<MenuItemDetailScreenProps> = ({ navigation, route }) => {
  const { menuItem } = route.params;
  const [quantity, setQuantity] = useState<number>(1);

  const updateQuantity = (delta: number): void => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = (): void => {
    navigation.navigate('PlaceOrder', { 
      menuItem: { ...menuItem },
      initialQuantity: quantity 
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image Placeholder */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageIcon}>🍔</Text>
        </View>
      </View>

      {/* Item Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.itemName}>{menuItem.name}</Text>
          <View style={[
            styles.availabilityBadge,
            !menuItem.isAvailable && styles.unavailableBadge
          ]}>
            <Text style={[
              styles.availabilityText,
              !menuItem.isAvailable && styles.unavailableText
            ]}>
              {menuItem.isAvailable ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>

        {menuItem.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{menuItem.category}</Text>
          </View>
        )}

        <Text style={styles.price}>${menuItem.price.toFixed(2)}</Text>

        {menuItem.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{menuItem.description}</Text>
          </View>
        )}

        {menuItem.totalOrders !== undefined && (
          <View style={styles.popularityContainer}>
            <Text style={styles.popularityIcon}>🔥</Text>
            <Text style={styles.popularityText}>
              {menuItem.totalOrders} orders placed
            </Text>
          </View>
        )}
      </View>

      {/* Quantity Selector */}
      {menuItem.isAvailable && (
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(-1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Total and Add to Cart */}
      {menuItem.isAvailable && (
        <View style={styles.bottomContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              ${(menuItem.price * quantity).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {!menuItem.isAvailable && (
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableMessage}>
            This item is currently not available
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    backgroundColor: '#fff',
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    fontSize: 100,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  availabilityBadge: {
    backgroundColor: '#e8f9ee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  unavailableBadge: {
    backgroundColor: '#ffebee',
  },
  availabilityText: {
    color: '#34c759',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unavailableText: {
    color: '#ff3b30',
  },
  categoryBadge: {
    backgroundColor: '#e8f4fd',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  popularityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fff8e7',
    borderRadius: 8,
  },
  popularityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  popularityText: {
    fontSize: 14,
    color: '#ff9500',
    fontWeight: '600',
  },
  quantityContainer: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 25,
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 30,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unavailableContainer: {
    backgroundColor: '#ffebee',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  unavailableMessage: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MenuItemDetailScreen;
