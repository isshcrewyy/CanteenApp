// User Types
export interface User {
  userId: number;
  name: string;
  email: string;
  role: 'Customer' | 'CanteenStaff' | 'SystemAdmin';
  token?: string;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

// Menu Types
export interface MenuItem {
  menuId: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  category?: string;
  totalOrders?: number;
}

export interface MenuItemCreate {
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  category?: string;
}

// Order Types
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface OrderItem {
  orderedItemId: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface Order {
  orderId: number;
  orderTag: string;
  userId: number;
  userName: string;
  userEmail: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderCreate {
  items: {
    menuId: number;
    quantity: number;
  }[];
}

// Order Queue Types
export interface QueueItem {
  orderId: number;
  orderTag: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
  estimatedWaitMinutes?: number;
  createdAt: string;
  items?: OrderItem[];
}

export interface QueueStats {
  totalOrdersInQueue: number;
  estimatedTotalProcessingTime: number;
}

export interface WaitTimeInfo {
  orderId: number;
  estimatedWaitMinutes: number;
  ordersAhead: number;
  totalOrdersInQueue: number;
}

// Cart Types
export interface CartItem {
  menuId: number;
  quantity: number;
  menu: MenuItem;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  PlaceOrder: { menuItem: MenuItem; initialQuantity?: number };
  OrderTracking: { orderId: number; orderTag: string; initialOrder?: Order };
  MenuItemDetail: { menuItem: MenuItem };
};

// Props Types
export interface ScreenProps {
  user: User | null;
  onLogout: () => void;
}
