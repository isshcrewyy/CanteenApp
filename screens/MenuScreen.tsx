import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { menuService } from '../services/menuService';
import { MenuItem, User, RootStackParamList } from '../types';

const POPULAR_ITEM_WIDTH = Dimensions.get('window').width * 0.4;

interface MenuScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  user: User | null;
  onLogout: () => void;
}

type SortOption = 'name' | 'price' | 'category';

const MenuScreen: React.FC<MenuScreenProps> = ({ navigation, user, onLogout }) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [searchText, setSearchText] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<MenuItem[] | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMenus();
    loadPopularItems();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchText.trim() === '') {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await menuService.search(searchText.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchText]);

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

  const loadPopularItems = async (): Promise<void> => {
    try {
      const data = await menuService.getPopular(5);
      setPopularItems(data);
    } catch (error) {
      console.error('Failed to load popular items:', error);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    setSearchText('');
    setSearchResults(null);
    loadMenus();
    loadPopularItems();
  };

  const getSortedMenus = useCallback((): MenuItem[] => {
    const dataToSort = searchResults !== null ? searchResults : menus;
    const sorted = [...dataToSort].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [menus, searchResults, sortBy]);

  const handleAddToCart = (menuItem: MenuItem): void => {
    navigation.navigate('PlaceOrder', { menuItem });
  };

  const renderPopularItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.popularItem}
      onPress={() => navigation.navigate('MenuItemDetail', { menuItem: item })}
    >
      <View style={styles.popularImagePlaceholder}>
        <Text style={styles.popularImageText}>🍔</Text>
      </View>
      <Text style={styles.popularItemName} numberOfLines={1}>{item.name}</Text>
      {item.category && (
        <Text style={styles.popularItemCategory} numberOfLines={1}>
          {item.category}
        </Text>
      )}
      <Text style={styles.popularItemPrice}>${item.price.toFixed(2)}</Text>
      <Text style={styles.popularItemOrders}>
        {item.totalOrders || 0} orders
      </Text>
      <TouchableOpacity
        style={styles.popularAddButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.popularAddButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => navigation.navigate('MenuItemDetail', { menuItem: item })}
    >
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
      {item.isAvailable && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchText('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {isSearching && (
          <ActivityIndicator style={styles.searchLoader} />
        )}
      </View>

      {/* Search Results Header */}
      {searchResults !== null && (
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsText}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchText}"
          </Text>
        </View>
      )}

      {/* Popular Items Carousel - only show when not searching */}
      {searchResults === null && popularItems.length > 0 && (
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>🔥 Popular Items</Text>
          <FlatList
            data={popularItems}
            renderItem={renderPopularItem}
            keyExtractor={(item) => `popular-${item.menuId}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularList}
          />
        </View>
      )}

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
          onPress={() => setSortBy('name')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonActiveText]}>
            Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
          onPress={() => setSortBy('price')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'price' && styles.sortButtonActiveText]}>
            Price
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'category' && styles.sortButtonActive]}
          onPress={() => setSortBy('category')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'category' && styles.sortButtonActiveText]}>
            Category
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
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
          data={getSortedMenus()}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.menuId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            searchResults !== null ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>No menu items available</Text>
            )
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
  // Search Styles
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  searchLoader: {
    marginTop: 10,
  },
  searchResultsHeader: {
    padding: 15,
    backgroundColor: '#e8f4fd',
    borderBottomWidth: 1,
    borderBottomColor: '#cce5ff',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#0066cc',
    fontStyle: 'italic',
  },
  // Popular Items Styles
  popularSection: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginBottom: 10,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
  },
  popularList: {
    paddingHorizontal: 10,
  },
  popularItem: {
    width: POPULAR_ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  popularImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  popularImageText: {
    fontSize: 40,
  },
  popularItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  popularItemCategory: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  popularItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  popularItemOrders: {
    fontSize: 11,
    color: '#34c759',
    marginBottom: 8,
  },
  popularAddButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  popularAddButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Sort Styles
  sortContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
});

export default MenuScreen;
