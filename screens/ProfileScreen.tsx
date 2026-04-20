import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { User } from '../types';

interface ProfileScreenProps {
  user: User | null;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const handleLogout = (): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string | undefined): string => {
    switch (role) {
      case 'SystemAdmin':
        return '#ff3b30';
      case 'CanteenStaff':
        return '#ff9500';
      case 'Customer':
      default:
        return '#007AFF';
    }
  };

  const getRoleLabel = (role: string | undefined): string => {
    switch (role) {
      case 'SystemAdmin':
        return 'System Admin';
      case 'CanteenStaff':
        return 'Canteen Staff';
      case 'Customer':
      default:
        return 'Customer';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user?.role) }]}>
          <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
        </View>
      </View>

      {/* User Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Name</Text>
          <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🔑 Role</Text>
          <Text style={styles.infoValue}>{getRoleLabel(user?.role)}</Text>
        </View>

        {user?.userId && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🆔 User ID</Text>
            <Text style={styles.infoValue}>#{user.userId}</Text>
          </View>
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Canteen Management System</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
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
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  roleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 30,
  },
  appInfoText: {
    fontSize: 14,
    color: '#999',
  },
  appVersion: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 5,
  },
});

export default ProfileScreen;
