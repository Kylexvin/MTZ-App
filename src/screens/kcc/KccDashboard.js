// src/screens/kcc/KccDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TokenBalanceCard from '../../components/TokenBalanceCard';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function KccDashboard({ navigation }) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Simulate API call - replace with actual endpoint
      const response = await axios.get('/kcc/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch KCC dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickActions = [
    { 
      title: 'Pickup Milk', 
      icon: 'arrow-up', 
      screen: 'Pickup',
      color: ['#00D9FF', '#0094FF'],
      description: 'Collect raw milk'
    },
    { 
      title: 'Deliver Milk', 
      icon: 'arrow-down', 
      screen: 'Delivery', 
      color: ['#00FF88', '#00CC6A'],
      description: 'Pasteurized milk'
    },
    { 
      title: 'Pending Pickups', 
      icon: 'time', 
      screen: 'Pickup',
      color: ['#FF6B6B', '#FF4757'],
      description: 'Unpaid collections'
    },
    { 
      title: 'Delivery Requests', 
      icon: 'list', 
      screen: 'Delivery',
      color: ['#A78BFA', '#7E5BEF'],
      description: 'From depots'
    }
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
          <SafeAreaView style={[styles.safeArea, styles.center]}>
            <Text style={styles.loadingText}>Loading KCC Dashboard...</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchDashboardData(true)}
              tintColor="#00D9FF"
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
                <Text style={styles.greeting}>KCC Attendant</Text>
                <Text style={styles.userName}>{user?.name}</Text>
              </View>
            </View>
          </View>

          {/* Balance */}
          <View style={styles.balanceSection}>
            <TokenBalanceCard 
              balance={dashboardData?.walletBalance || 0}
              onRefresh={fetchDashboardData}
            />
          </View>

          {/* Today's Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Today's Activity</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="arrow-up" size={20} color="#00D9FF" />
                <Text style={styles.statValue}>{dashboardData?.todayPickups || 0}</Text>
                <Text style={styles.statLabel}>Pickups</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="arrow-down" size={20} color="#00FF88" />
                <Text style={styles.statValue}>{dashboardData?.todayDeliveries || 0}</Text>
                <Text style={styles.statLabel}>Deliveries</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={20} color="#FFD700" />
                <Text style={styles.statValue}>{dashboardData?.pendingPayments || 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(action.screen)}
                >
                  <LinearGradient
                    colors={action.color}
                    style={styles.actionGradient}
                  >
                    <Ionicons name={action.icon} size={24} color="#FFF" />
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {dashboardData?.recentActivity?.length > 0 ? (
                dashboardData.recentActivity.slice(0, 3).map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={[
                      styles.activityIcon,
                      { backgroundColor: activity.type === 'pickup' ? 'rgba(0, 217, 255, 0.2)' : 'rgba(0, 255, 136, 0.2)' }
                    ]}>
                      <Ionicons 
                        name={activity.type === 'pickup' ? 'arrow-up' : 'arrow-down'} 
                        size={16} 
                        color={activity.type === 'pickup' ? '#00D9FF' : '#00FF88'} 
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>
                        {activity.type === 'pickup' ? 'Milk Pickup' : 'Milk Delivery'}
                      </Text>
                      <Text style={styles.activityDetails}>
                        {activity.liters}L • {activity.depot}
                      </Text>
                    </View>
                    <Text style={[
                      styles.activityAmount,
                      { color: activity.type === 'pickup' ? '#FF6B6B' : '#00FF88' }
                    ]}>
                      {activity.type === 'pickup' ? '-' : '+'}{activity.tokens} MTZ
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyActivity}>
                  <Ionicons name="time-outline" size={32} color="#8B92B2" />
                  <Text style={styles.emptyText}>No recent activity</Text>
                </View>
              )}
            </View>
          </View>

          {/* KCC Branch Info */}
          {dashboardData?.branch && (
            <View style={styles.branchSection}>
              <Text style={styles.sectionTitle}>My Branch</Text>
              <View style={styles.branchCard}>
                <View style={styles.branchItem}>
                  <Ionicons name="business" size={16} color="#8B92B2" />
                  <Text style={styles.branchLabel}>Branch:</Text>
                  <Text style={styles.branchValue}>{dashboardData.branch.name}</Text>
                </View>
                <View style={styles.branchItem}>
                  <Ionicons name="location" size={16} color="#8B92B2" />
                  <Text style={styles.branchLabel}>Location:</Text>
                  <Text style={styles.branchValue}>{dashboardData.branch.location}</Text>
                </View>
                <View style={styles.branchItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                  <Text style={styles.branchLabel}>Status:</Text>
                  <Text style={[styles.branchValue, styles.statusActive]}>
                    {dashboardData.branch.status}
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8B92B2', fontSize: 16 },
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
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#8B92B2',
    fontSize: 12,
  },
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
    width: '47%',
    marginBottom: 12,
  },
  actionGradient: {
    height: 100,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  actionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: '#1E2749',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDetails: {
    color: '#8B92B2',
    fontSize: 12,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#8B92B2',
    marginTop: 8,
    fontSize: 14,
  },
  branchSection: {
    marginBottom: 24,
  },
  branchCard: {
    backgroundColor: '#1E2749',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  branchLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '500',
  },
  branchValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusActive: {
    color: '#00FF88',
  },
});