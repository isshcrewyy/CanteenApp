import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { authService } from '../services/authService';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MenuScreen from '../screens/MenuScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import StaffDashboardScreen from '../screens/StaffDashboardScreen';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomerTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Menu" component={MenuScreen} />
    <Tab.Screen name="My Orders" component={OrdersScreen} />
  </Tab.Navigator>
);

const StaffTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Menu Management" component={StaffDashboardScreen} />
    <Tab.Screen name="All Orders" component={OrdersScreen} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="User Management" component={AdminDashboardScreen} />
    <Tab.Screen name="Menu" component={MenuScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await authService.getStoredUser();
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

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return null; // You can add a loading screen here
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
  const getMainComponent = () => {
    switch (user?.role) {
      case 'SystemAdmin':
        return AdminTabs;
      case 'CanteenStaff':
        return StaffTabs;
      case 'Customer':
      default:
        return CustomerTabs;
    }
  };

  const MainComponent = getMainComponent();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          options={{ headerShown: false }}
        >
          {(props) => <MainComponent {...props} user={user} onLogout={handleLogout} />}
        </Stack.Screen>
        <Stack.Screen 
          name="PlaceOrder" 
          component={PlaceOrderScreen}
          options={{ title: 'Place Order' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

