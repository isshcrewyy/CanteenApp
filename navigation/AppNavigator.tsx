import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { authService } from '../services/authService';
import { User, MenuItem, Order, RootStackParamList, AuthResponse } from '../types';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MenuScreen from '../screens/MenuScreen';
import MenuItemDetailScreen from '../screens/MenuItemDetailScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import StaffDashboardScreen from '../screens/StaffDashboardScreen';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderQueueScreen from '../screens/OrderQueueScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Simple Tab Icon component
interface TabIconProps {
  name: string;
  color?: string;
}

const TabIcon: React.FC<TabIconProps> = ({ name }) => (
  <Text style={{ fontSize: 20 }}>{name}</Text>
);

interface TabsProps {
  user: User | null;
  onLogout: () => void;
}

const CustomerTabs: React.FC<TabsProps> = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
    }}
  >
    <Tab.Screen 
      name="Menu" 
      options={{ 
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="🍔" color={color} />,
      }}
    >
      {(props) => <MenuScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="My Orders" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
      }}
    >
      {(props) => <OrdersScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="Profile" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
      }}
    >
      {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

const StaffTabs: React.FC<TabsProps> = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
    }}
  >
    <Tab.Screen 
      name="Order Queue" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="📥" color={color} />,
      }}
    >
      {(props) => <OrderQueueScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="Menu Management" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="🍽️" color={color} />,
      }}
    >
      {(props) => <StaffDashboardScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="All Orders" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
      }}
    >
      {(props) => <OrdersScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="Profile" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
      }}
    >
      {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

const AdminTabs: React.FC<TabsProps> = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
    }}
  >
    <Tab.Screen 
      name="Users" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="👥" color={color} />,
      }}
    >
      {(props) => <AdminDashboardScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="Order Queue" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="📥" color={color} />,
      }}
    >
      {(props) => <OrderQueueScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="Menu" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="🍔" color={color} />,
      }}
    >
      {(props) => <MenuScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="Orders" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
      }}
    >
      {(props) => <OrdersScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
    <Tab.Screen 
      name="Profile" 
      options={{
        headerShown: false,
        tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
      }}
    >
      {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

const AppNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      // Prevent indefinite blank screen if storage call hangs for any reason.
      const storedUser = await Promise.race<User | null>([
        authService.getStoredUser(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: AuthResponse): void => {
    setUser({
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      role: userData.role as User['role'],
      token: userData.token,
    });
    setIsAuthenticated(true);
  };

  const handleLogout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, color: '#444' }}>Loading app...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} onRegister={handleLogin} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Role-based navigation
  const getMainComponent = (): React.FC<any> => {
    switch (user?.role) {
      case 'SystemAdmin':
        return (props: any) => <AdminTabs {...props} user={user} onLogout={handleLogout} />;
      case 'CanteenStaff':
        return (props: any) => <StaffTabs {...props} user={user} onLogout={handleLogout} />;
      case 'Customer':
      default:
        return (props: any) => <CustomerTabs {...props} user={user} onLogout={handleLogout} />;
    }
  };

  const MainComponent = getMainComponent();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          options={{ headerShown: false }}
          component={MainComponent}
        />
        <Stack.Screen 
          name="PlaceOrder" 
          component={PlaceOrderScreen}
          options={{ title: 'Place Order' }}
        />
        <Stack.Screen 
          name="OrderTracking" 
          component={OrderTrackingScreen}
          options={{ title: 'Track Order' }}
        />
        <Stack.Screen 
          name="MenuItemDetail" 
          component={MenuItemDetailScreen}
          options={{ title: 'Item Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
