import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TokenBalanceCard from '../../components/TokenBalanceCard';
import { useTokens } from '../../hooks/useTokens';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const { balance, refreshBalance } = useTokens();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data from API
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get('/farmers/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format stats from API data
  const getStats = () => {
    if (!dashboardData) return [];

    const baseStats = [
      { 
        label: 'Today', 
        value: `${dashboardData.stats.today}L`, 
        icon: 'water', 
        color: '#00D9FF' 
      },
      { 
        label: 'This Week', 
        value: `${dashboardData.stats.week}L`, 
        icon: 'trending-up', 
        color: '#00D9FF' 
      },
    ];

    // Farmer only stats
    return [...baseStats, { 
      label: 'Milk Quality', 
      value: dashboardData.stats.additional, 
      icon: 'ribbon', 
      color: '#00FF88' 
    }];
  };

  // Farmer only quick actions
  const getQuickActions = () => {
    return [
      { title: 'Scan QR', icon: 'qr-code', screen: 'Scanner', color: ['#00D9FF', '#0094FF'] },
      { title: 'History', icon: 'time', screen: 'History', color: ['#00D9FF', '#0077CC'] },
      { title: 'Deposit', icon: 'arrow-up', screen: 'Deposit', color: ['#00FF88', '#00CC6A'] }
    ];
  };

  const getUserDisplayName = () => {
    return user?.name || 'Farmer';
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Get icon and color for transaction type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sent':
        return { icon: 'arrow-up', color: '#FF6B6B' };
      case 'received':
        return { icon: 'arrow-down', color: '#00FF88' };
      case 'deposit':
        return { icon: 'add-circle', color: '#00FF88' };
      case 'withdrawal':
        return { icon: 'remove-circle', color: '#FF6B6B' };
      default:
        return { icon: 'swap-horizontal', color: '#00D9FF' };
    }
  };

  const stats = getStats();
  const quickActions = getQuickActions();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
          <SafeAreaView style={[styles.safeArea, styles.center]}>
            <ActivityIndicator size="large" color="#00D9FF" />
            <Text style={styles.loadingText}>Loading Dashboard...</Text>
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
              <View style={styles.headerContent}>
                <View style={styles.logoTextContainer}>
                  <View style={styles.logo}>
                    <Ionicons name="leaf" size={28} color="#00D9FF" />
                  </View>
                  <View>
                    <Text style={styles.appName}>MilkChain</Text>
                    <Text style={styles.greeting}>Welcome back, {getUserDisplayName()}!</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
                  <Ionicons name="notifications-outline" size={22} color="#00D9FF" />
                  <View style={styles.badge} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceSection}>
              <TokenBalanceCard 
                balance={balance} 
                onRefresh={() => {
                  refreshBalance();
                  fetchDashboardData(true);
                }} 
              />
            </View>

            {/* Stats Cards - Real API Data */}
            {/* <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View> */}

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => navigation.navigate(action.screen)}
                  activeOpacity={0.8}
                  style={styles.actionTouchable}
                >
                  <LinearGradient 
                    colors={action.color} 
                    style={styles.actionCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons name={action.icon} size={28} color="#FFF" />
                    </View>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Activity - Real API Data */}
            <View style={styles.recentTransactions}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => navigation.navigate('History')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {dashboardData?.recentActivity?.length > 0 ? (
                dashboardData.recentActivity.slice(0, 5).map((activity) => {
                  const { icon, color } = getTransactionIcon(activity.type);
                  return (
                    <View key={activity.id} style={styles.txCard}>
                      <View style={[styles.txIcon, { backgroundColor: `${color}20` }]}>
                        <Ionicons name={icon} size={18} color={color} />
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txTitle}>{activity.description}</Text>
                        <Text style={styles.txDate}>{formatTimeAgo(activity.timestamp)}</Text>
                      </View>
                      <Text style={[styles.txAmount, { color }]}>
                        {activity.type === 'sent' || activity.type === 'withdrawal' ? '-' : '+'}
                        {activity.amount} {activity.unit}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={48} color="#8B92B2" />
                  <Text style={styles.emptyStateText}>No recent activity</Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Secured by Blockchain Technology</Text>
              <Text style={styles.footerVersion}>MilkChain v1.0</Text>
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
  // Header styles
  header: {
    backgroundColor: '#0A0E27',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#8B92B2',
    marginTop: 2,
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
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
    minHeight: 100,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    color: '#8B92B2',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  seeAllText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  actionTouchable: {
    width: (width - 64) / 3,
    marginBottom: 12,
  },
  actionCard: {
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  recentTransactions: {
    marginBottom: 20,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2749',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { 
    flex: 1,
  },
  txTitle: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '600',
    marginBottom: 2,
  },
  txDate: { 
    color: '#8B92B2', 
    fontSize: 12,
  },
  txAmount: { 
    fontSize: 16, 
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#8B92B2',
    fontSize: 16,
    marginTop: 12,
  },
  footer: {
    marginTop: 30,
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