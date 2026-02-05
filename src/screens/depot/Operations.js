// src/screens/depot/Operations.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Operations({ navigation }) {
  const { user } = useAuth();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [todayStats, setTodayStats] = useState({
    milkReceived: 0,
    farmersCount: 0,
    tokensPaid: 0,
    avgQuality: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  const fetchOperationsData = async () => {
    try {
      setLoading(true);
      
      const [pendingRes, statsRes] = await Promise.all([
  axios.get(`/depots/${user.assignedDepot}/deposit/pending`), 
  axios.get(`/depots/${user.assignedDepot}/today-stats`)
]);

      if (pendingRes.data.success) {
        setPendingPayments(pendingRes.data.data.pendingDeposits);
      }

      if (statsRes.data.success) {
        setTodayStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch operations data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  const handleQuickPayment = (payment) => {
    navigation.navigate('PaymentScreen', {
      transactionId: payment.transactionId,
      farmerName: payment.farmer.name,
      farmerPhone: payment.farmer.phone,
      liters: payment.liters,
      quality: payment.quality,
      depositCode: payment.depositCode,
      shortCode: payment.shortCode,
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Loading Operations...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Milk Operations</Text>
            <Text style={styles.subtitle}>Manage milk receipts & payments</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Milk Deposit</Text>
            <TouchableOpacity 
              style={styles.ctaCard}
              onPress={() => navigation.navigate('FarmerLookup')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00FF88', '#00CC6A']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="water" size={40} color="#FFF" />
                <Text style={styles.ctaTitle}>Record Milk Deposit</Text>
                <Text style={styles.ctaSubtitle}>Look up farmer to begin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{todayStats.milkReceived}L</Text>
                <Text style={styles.summaryLabel}>Milk Received</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{todayStats.farmersCount}</Text>
                <Text style={styles.summaryLabel}>Farmers</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{todayStats.tokensPaid}</Text>
                <Text style={styles.summaryLabel}>Tokens Paid</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Payments</Text>
              <Text style={styles.pendingCount}>{pendingPayments.length} pending</Text>
            </View>

            {pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => (
                <View key={payment.transactionId} style={styles.paymentCard}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.farmerName}>{payment.farmer.name}</Text>
                    <Text style={styles.paymentDetails}>
                      {payment.liters}L • {payment.quality} • {payment.depositCode}
                    </Text>
                    <Text style={styles.timeText}>
                      {new Date(payment.depositTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => handleQuickPayment(payment)}
                  >
                    <LinearGradient
                      colors={['#00FF88', '#00CC6A']}
                      style={styles.payButtonGradient}
                    >
                      <Text style={styles.payButtonText}>Pay {payment.tokensDue} MTZ</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={48} color="#00FF88" />
                <Text style={styles.emptyStateText}>No pending payments</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('FarmerLookup')}
              >
                <LinearGradient
                  colors={['#00D9FF', '#0094FF']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="search" size={24} color="#FFF" />
                  <Text style={styles.quickActionText}>Find Farmer</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('KccDeliveryQR')}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF4757']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="qr-code" size={24} color="#FFF" />
                  <Text style={styles.quickActionText}>KCC QR</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('TransactionHistory')}
              >
                <LinearGradient
                  colors={['#A78BFA', '#7E5BEF']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="list" size={24} color="#FFF" />
                  <Text style={styles.quickActionText}>History</Text>
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8B92B2',
    marginTop: 16,
    fontSize: 16,
  },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#8B92B2' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  ctaCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  summaryCard: { 
    flexDirection: 'row', 
    backgroundColor: '#1E2749', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356',
    justifyContent: 'space-between'
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { color: '#00D9FF', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  summaryLabel: { color: '#8B92B2', fontSize: 12 },
  pendingCount: { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  paymentCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1E2749', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#2A3356',
    marginBottom: 12 
  },
  paymentInfo: { flex: 1 },
  farmerName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  paymentDetails: { color: '#8B92B2', fontSize: 14 },
  timeText: { color: '#8B92B2', fontSize: 12, marginTop: 4 },
  payButton: { borderRadius: 8, overflow: 'hidden' },
  payButtonGradient: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  payButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#1E2749',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  emptyStateText: {
    color: '#00FF88',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { width: '31%', borderRadius: 12, overflow: 'hidden' },
  quickActionGradient: { height: 100, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  quickActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});