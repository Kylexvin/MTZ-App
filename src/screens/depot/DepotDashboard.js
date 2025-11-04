// src/screens/depot/DepotDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TokenBalanceCard from '../../components/TokenBalanceCard';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function DepotDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch depot dashboard data from API
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`/depot/${user.assignedDepot}/dashboard`);
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch depot dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick actions for depot attendant
  const quickActions = [
    { 
      title: 'Receive Milk', 
      icon: 'water', 
      screen: 'Operations',
      color: ['#00D9FF', '#0094FF'],
      description: 'From farmers'
    },
    { 
      title: 'Pay Tokens', 
      icon: 'cash', 
      screen: 'Operations',
      color: ['#00FF88', '#00CC6A'],
      description: 'Pending payments'
    },
    { 
      title: 'KCC Pickup', 
      icon: 'arrow-up', 
      screen: 'KccPickup',
      color: ['#FF6B6B', '#FF4757'],
      description: 'Raw milk collection'
    },
    { 
      title: 'KCC Delivery', 
      icon: 'arrow-down', 
      screen: 'KccDeliveryQR',
      color: ['#A78BFA', '#7E5BEF'],
      description: 'Pasteurized milk'
    }
  ];

  const getUserDisplayName = () => {
    return user?.name?.split(' ')[0] || 'Attendant';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
          <SafeAreaView style={[styles.safeArea, styles.center]}>
            <ActivityIndicator size="large" color="#00D9FF" />
            <Text style={styles.loadingText}>Loading Depot Dashboard...</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            bounces={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchDashboardData(true)}
                tintColor="#00D9FF"
                colors={['#00D9FF']}
              />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.welcomeSection}>
                <View style={styles.avatar}>
                  <Ionicons name="business" size={24} color="#00D9FF" />
                </View>
                <View style={styles.welcomeText}>
                  <Text style={styles.greeting}>Welcome back</Text>
                  <Text style={styles.userName}>{getUserDisplayName()}!</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color="#00D9FF" />
                <View style={styles.badge} />
              </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceSection}>
              <TokenBalanceCard 
                balance={dashboardData?.attendant?.walletBalance || 0} 
                onRefresh={() => fetchDashboardData(true)} 
              />
            </View>

            {/* Stock Overview */}
            <View style={styles.stockSection}>
              <Text style={styles.sectionTitle}>Current Stock</Text>
              <View style={styles.stockCards}>
                {/* Raw Milk Card */}
                <View style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <View style={[styles.stockIcon, { backgroundColor: 'rgba(0, 217, 255, 0.2)' }]}>
                      <Ionicons name="water" size={20} color="#00D9FF" />
                    </View>
                    <Text style={styles.stockLabel}>Raw Milk</Text>
                  </View>
                  <Text style={styles.stockValue}>{dashboardData?.stock?.rawMilk || 0}L</Text>
                  <View style={styles.capacityBar}>
                    <View 
                      style={[
                        styles.capacityFill,
                        { 
                          width: `${Math.min(100, ((dashboardData?.stock?.rawMilk || 0) / (dashboardData?.stock?.capacity || 1)) * 100)}%`,
                          backgroundColor: '#00D9FF'
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Pasteurized Milk Card */}
                <View style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <View style={[styles.stockIcon, { backgroundColor: 'rgba(0, 255, 136, 0.2)' }]}>
                      <Ionicons name="flask" size={20} color="#00FF88" />
                    </View>
                    <Text style={styles.stockLabel}>Pasteurized</Text>
                  </View>
                  <Text style={styles.stockValue}>{dashboardData?.stock?.pasteurizedMilk || 0}L</Text>
                  <View style={styles.capacityBar}>
                    <View 
                      style={[
                        styles.capacityFill,
                        { 
                          width: `${Math.min(100, ((dashboardData?.stock?.pasteurizedMilk || 0) / (dashboardData?.stock?.capacity || 1)) * 100)}%`,
                          backgroundColor: '#00FF88'
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {/* Capacity Summary */}
              <View style={styles.capacitySummary}>
                <Text style={styles.capacityText}>
                  Total: {((dashboardData?.stock?.rawMilk || 0) + (dashboardData?.stock?.pasteurizedMilk || 0))}L / {dashboardData?.stock?.capacity || 0}L
                </Text>
                <Text style={styles.capacityPercent}>
                  {dashboardData?.stock?.utilization || 0}% utilized
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => navigation.navigate(action.screen)}
                    activeOpacity={0.8}
                    style={styles.actionCard}
                  >
                    <LinearGradient 
                      colors={action.color} 
                      style={styles.actionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.actionIcon}>
                        <Ionicons name={action.icon} size={24} color="#FFF" />
                      </View>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionDescription}>{action.description}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pending Tasks */}
            <View style={styles.tasksSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Tasks</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Operations')}>
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.tasksCard}>
                <View style={styles.taskItem}>
                  <View style={[styles.taskIcon, { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}>
                    <Ionicons name="time" size={16} color="#FFD700" />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>Pending Payments</Text>
                    <Text style={styles.taskCount}>
                      {dashboardData?.operations?.pendingDeposits || 0} farmers waiting
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#8B92B2" />
                </View>

                <View style={styles.divider} />

                <View style={styles.taskItem}>
                  <View style={[styles.taskIcon, { backgroundColor: 'rgba(0, 217, 255, 0.2)' }]}>
                    <Ionicons name="business" size={16} color="#00D9FF" />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>KCC Operations</Text>
                    <Text style={styles.taskCount}>
                      {dashboardData?.operations?.needsPickup ? 'Pickup scheduled' : 'No pending operations'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#8B92B2" />
                </View>
              </View>
            </View>

            {/* Depot Status */}
            {dashboardData && (
              <View style={styles.statusSection}>
                <Text style={styles.sectionTitle}>Depot Status</Text>
                <View style={styles.statusCard}>
                  <View style={styles.statusItem}>
                    <Ionicons name="business" size={16} color="#8B92B2" />
                    <Text style={styles.statusLabel}>Depot:</Text>
                    <Text style={styles.statusValue}>{dashboardData.depot?.name}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Ionicons name="location" size={16} color="#8B92B2" />
                    <Text style={styles.statusLabel}>Location:</Text>
                    <Text style={styles.statusValue}>{dashboardData.depot?.location}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                    <Text style={styles.statusLabel}>Status:</Text>
                    <Text style={[styles.statusValue, styles.statusActive]}>
                      {dashboardData.depot?.status || 'Active'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Secured by Blockchain Technology</Text>
              <Text style={styles.footerVersion}>MilkChain Depot v1.0</Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8B92B2',
    marginTop: 16,
    fontSize: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    marginRight: 12,
  },
  welcomeText: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 14,
    color: '#8B92B2',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2749',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  // Stock Section
  stockSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  stockCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  stockCard: {
    flex: 1,
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stockLabel: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600',
  },
  stockValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  capacityBar: {
    height: 4,
    backgroundColor: '#2A3356',
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 2,
  },
  capacitySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  capacityText: {
    color: '#8B92B2',
    fontSize: 12,
  },
  capacityPercent: {
    color: '#00D9FF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Actions Section
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: (width - 64) / 2,
    marginBottom: 12,
  },
  actionGradient: {
    height: 100,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  // Tasks Section
  tasksSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  seeAllText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
  },
  tasksCard: {
    backgroundColor: '#1E2749',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskCount: {
    color: '#8B92B2',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A3356',
    marginVertical: 8,
  },
  // Status Section
  statusSection: {
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#1E2749',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '500',
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusActive: {
    color: '#00FF88',
  },
  // Footer
  footer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#8B92B2',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 10,
    color: '#4A5174',
  },
});