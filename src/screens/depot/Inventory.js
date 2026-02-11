// src/screens/depot/Inventory.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function Inventory({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryData, setInventoryData] = useState({
    stockData: null,
    kccOperations: [],
    stockAlerts: [],
  });

  // Fetch inventory data
  const fetchInventoryData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`/depots/${user.assignedDepot}/inventory-screen`);
      
      console.log('Inventory API Response:', response.data); // Debug log
      
      if (response.data.success) {
        setInventoryData({
          stockData: response.data.data.stockData || {},
          kccOperations: response.data.data.kccOperations || [],
          stockAlerts: response.data.data.stockAlerts || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
      
      // Fallback: Try individual endpoints if combined fails
      try {
        await fetchFallbackData();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback: Fetch data from individual endpoints
  const fetchFallbackData = async () => {
    const [stockRes, opsRes, alertsRes] = await Promise.all([
      axios.get(`/depots/${user.assignedDepot}/inventory`),
      axios.get(`/depots/${user.assignedDepot}/operations/recent?limit=3`),
      axios.get(`/depots/${user.assignedDepot}/alerts`),
    ]);

    console.log('Fallback responses:', { stockRes, opsRes, alertsRes }); // Debug

    setInventoryData({
      stockData: stockRes.data.data?.stock || stockRes.data.data || {},
      kccOperations: opsRes.data.data?.operations || [],
      stockAlerts: alertsRes.data.data?.alerts || [],
    });
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleKccPickup = () => {
    navigation.navigate('KccPickup');
  };

  const handleKccDelivery = () => {
    navigation.navigate('KccDeliveryQR');
  };

const formatOperationTime = (op) => {
  // If the backend is returning "Nov 2", let's make it more user-friendly
  const dateString = op.time;
  
  if (!dateString || dateString === 'Scheduled') {
    return dateString || 'Recently';
  }
  
  try {
    // Try to parse "Nov 2" or similar format
    const currentYear = new Date().getFullYear();
    const date = new Date(`${dateString} ${currentYear}`);
    
    if (isNaN(date.getTime())) {
      // If parsing fails, return as-is
      return dateString;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Calculate difference in days
    const diffTime = today.getTime() - transactionDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return daysOfWeek[date.getDay()];
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      // Return original format for older dates
      return dateString;
    }
  } catch (error) {
    return dateString;
  }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
          <SafeAreaView style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00D9FF" />
            <Text style={styles.loadingText}>Loading Inventory...</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  const stockData = inventoryData.stockData || {
    rawMilk: 0,
    pasteurizedMilk: 0,
    capacity: 1,
    utilization: 0,
  };

  const kccOperations = inventoryData.kccOperations || [];
  const stockAlerts = inventoryData.stockAlerts || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
      <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchInventoryData(true)}
                tintColor="#00D9FF"
                colors={['#00D9FF']}
              />
            }
          >
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Inventory</Text>
                <Text style={styles.subtitle}>Stock management & KCC operations</Text>
              </View>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={() => fetchInventoryData(true)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={refreshing ? "refresh" : "refresh-outline"} 
                  size={22} 
                  color="#00D9FF" 
                />
              </TouchableOpacity>
            </View>

            {/* Stock Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Stock</Text>
              <View style={styles.stockCard}>
                
                {/* Raw Milk */}
                <View style={styles.stockItem}>
                  <View style={styles.stockHeader}>
                    <Ionicons name="water" size={20} color="#00D9FF" />
                    <Text style={styles.stockLabel}>Raw Milk</Text>
                  </View>
                  <Text style={styles.stockValue}>{stockData.rawMilk || 0}L</Text>
                  <View style={styles.capacityBar}>
                    <View 
                      style={[
                        styles.capacityFill, 
                        { 
                          width: `${Math.min(100, ((stockData.rawMilk || 0) / (stockData.capacity || 1)) * 100)}%`, 
                          backgroundColor: '#00D9FF' 
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Pasteurized Milk */}
                <View style={styles.stockItem}>
                  <View style={styles.stockHeader}>
                    <Ionicons name="flask" size={20} color="#00FF88" />
                    <Text style={styles.stockLabel}>Pasteurized</Text>
                  </View>
                  <Text style={styles.stockValue}>{stockData.pasteurizedMilk || 0}L</Text>
                  <View style={styles.capacityBar}>
                    <View 
                      style={[
                        styles.capacityFill, 
                        { 
                          width: `${Math.min(100, ((stockData.pasteurizedMilk || 0) / (stockData.capacity || 1)) * 100)}%`, 
                          backgroundColor: '#00FF88' 
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Total Capacity */}
                <View style={styles.capacityInfo}>
                  <Text style={styles.capacityText}>
                    Total: {(stockData.rawMilk || 0) + (stockData.pasteurizedMilk || 0)}L / {stockData.capacity || 0}L
                  </Text>
                  <Text style={styles.capacityPercent}>
                    {stockData.utilization ? parseFloat(stockData.utilization).toFixed(1) : 0}% utilized
                  </Text>
                </View>
              </View>
            </View>

            {/* KCC Operations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KCC Operations</Text>
              
              <View style={styles.kccActions}>
                <TouchableOpacity 
                  style={styles.kccAction}
                  onPress={handleKccPickup}
                >
                  <LinearGradient
                    colors={['#00D9FF', '#0094FF']}
                    style={styles.kccActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="arrow-up" size={28} color="#FFF" />
                    <Text style={styles.kccActionText}>Request Pickup</Text>
                    <Text style={styles.kccActionSubtext}>Raw milk collection</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.kccAction}
                  onPress={handleKccDelivery}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF4757']}
                    style={styles.kccActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="arrow-down" size={28} color="#FFF" />
                    <Text style={styles.kccActionText}>Expect Delivery</Text>
                    <Text style={styles.kccActionSubtext}>Pasteurized milk</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Recent KCC Operations */}
              <View style={styles.recentOperations}>
                <View style={styles.subSectionHeader}>
                  <Text style={styles.subSectionTitle}>Recent Operations</Text>
                  {kccOperations.length > 0 && (
                    <TouchableOpacity>
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {kccOperations.length > 0 ? (
                  kccOperations.map((op, index) => (
                    <View key={op.id || index} style={styles.operationCard}>
                      <View style={styles.operationIcon}>
                        <Ionicons 
                          name={op.type === 'pickup' ? 'arrow-up' : 'arrow-down'} 
                          size={20} 
                          color={op.type === 'pickup' ? '#00D9FF' : '#FF6B6B'} 
                        />
                      </View>
                      <View style={styles.operationInfo}>
                        <Text style={styles.operationType}>
                          {op.type === 'pickup' ? 'KCC Pickup' : 'KCC Delivery'}
                        </Text>
                        <Text style={styles.operationDetails}>
                          {op.liters || 0}L • {formatOperationTime(op)}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { 
                          backgroundColor: op.status === 'completed' 
                            ? 'rgba(0, 255, 136, 0.2)' 
                            : 'rgba(255, 193, 7, 0.2)' 
                        }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { 
                            color: op.status === 'completed' 
                              ? '#00FF88' 
                              : '#FFD700' 
                          }
                        ]}>
                          {op.status || 'pending'}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={40} color="#4A5174" />
                    <Text style={styles.emptyStateText}>No recent KCC operations</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Schedule your first pickup or delivery
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stock Alerts */}
            {stockAlerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stock Alerts</Text>
                {stockAlerts.map((alert, index) => (
                  <View key={alert.id || index} style={[
                    styles.alertCard,
                    { 
                      backgroundColor: alert.severity === 'high' 
                        ? 'rgba(255, 107, 107, 0.1)' 
                        : 'rgba(255, 193, 7, 0.1)',
                      borderColor: alert.severity === 'high'
                        ? 'rgba(255, 107, 107, 0.3)'
                        : 'rgba(255, 193, 7, 0.3)'
                    }
                  ]}>
                    <Ionicons 
                      name={alert.severity === 'high' ? "warning" : "alert-circle"} 
                      size={24} 
                      color={alert.severity === 'high' ? '#FF6B6B' : '#FFD700'} 
                    />
                    <View style={styles.alertInfo}>
                      <Text style={[
                        styles.alertTitle,
                        { color: alert.severity === 'high' ? '#FF6B6B' : '#FFD700' }
                      ]}>
                        {alert.title}
                      </Text>
                      <Text style={styles.alertMessage}>
                        {alert.message}
                      </Text>
                      <Text style={styles.alertDetails}>
                        {alert.current}% capacity • {alert.suggestedAction}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Empty alerts state */}
            {stockAlerts.length === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stock Status</Text>
                <View style={styles.allGoodCard}>
                  <Ionicons name="checkmark-circle" size={40} color="#00FF88" />
                  <View style={styles.allGoodInfo}>
                    <Text style={styles.allGoodTitle}>All Systems Normal</Text>
                    <Text style={styles.allGoodMessage}>
                      Stock levels are within optimal ranges
                    </Text>
                  </View>
                </View>
              </View>
            )}



          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  loadingContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 20 
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8B92B2',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#8B92B2' 
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2749',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
    marginLeft: 12,
  },
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 16 
  },
  stockCard: { 
    backgroundColor: '#1E2749', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356' 
  },
  stockItem: { 
    marginBottom: 20 
  },
  stockHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  stockLabel: { 
    color: '#8B92B2', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  stockValue: { 
    color: '#FFFFFF', 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  capacityBar: { 
    height: 6, 
    backgroundColor: '#2A3356', 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  capacityFill: { 
    height: '100%', 
    borderRadius: 3 
  },
  capacityInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 8 
  },
  capacityText: { 
    color: '#8B92B2', 
    fontSize: 14 
  },
  capacityPercent: { 
    color: '#00D9FF', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  kccActions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  kccAction: { 
    flex: 1, 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  kccActionGradient: { 
    padding: 16, 
    alignItems: 'center', 
    borderRadius: 12, 
    minHeight: 120, 
    justifyContent: 'center' 
  },
  kccActionText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '700', 
    marginTop: 8, 
    textAlign: 'center' 
  },
  kccActionSubtext: { 
    color: 'rgba(255, 255, 255, 0.8)', 
    fontSize: 12, 
    marginTop: 4, 
    textAlign: 'center' 
  },
  recentOperations: { 
    marginTop: 8 
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subSectionTitle: { 
    color: '#8B92B2', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  viewAllText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
  },
  operationCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E2749', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#2A3356',
    marginBottom: 12 
  },
  operationIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(0, 217, 255, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12 
  },
  operationInfo: { 
    flex: 1 
  },
  operationType: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  operationDetails: { 
    color: '#8B92B2', 
    fontSize: 14 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  emptyState: {
    backgroundColor: '#1E2749',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    color: '#8B92B2',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  alertCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1,
    marginBottom: 12,
  },
  alertInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  alertTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  alertMessage: { 
    color: '#8B92B2', 
    fontSize: 14,
    marginBottom: 4,
  },
  alertDetails: {
    color: '#8B92B2',
    fontSize: 12,
    fontStyle: 'italic',
  },
  allGoodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  allGoodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  allGoodTitle: {
    color: '#00FF88',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  allGoodMessage: {
    color: '#8B92B2',
    fontSize: 14,
  },
  // Debug styles (remove in production)
  debugSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D9FF',
  },
  debugTitle: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: '#8B92B2',
    fontSize: 12,
    marginBottom: 8,
  },
  debugButton: {
    color: '#00D9FF',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});