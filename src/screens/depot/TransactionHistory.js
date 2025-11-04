// src/screens/depot/TransactionHistory.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionHistory({ navigation }) {
  const [filter, setFilter] = useState('all');

  // Dummy transaction data
  const transactions = [
    { id: 1, type: 'milk_deposit', farmer: 'John Kamau', amount: 25, unit: 'L', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'token_payment', farmer: 'Jane Wambui', amount: 18, unit: 'MTZ', time: '1 hour ago', status: 'completed' },
    { id: 3, type: 'kcc_pickup', description: 'KCC Raw Milk Pickup', amount: 200, unit: 'MTZ', time: 'Today, 10:30 AM', status: 'completed' },
    { id: 4, type: 'kcc_delivery', description: 'KCC Pasteurized Delivery', amount: 150, unit: 'MTZ', time: 'Yesterday, 2:15 PM', status: 'completed' },
    { id: 5, type: 'milk_deposit', farmer: 'Peter Maina', amount: 32, unit: 'L', time: 'Pending', status: 'pending' },
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'milk_deposit': return { icon: 'water', color: '#00D9FF' };
      case 'token_payment': return { icon: 'cash', color: '#00FF88' };
      case 'kcc_pickup': return { icon: 'arrow-up', color: '#FFD700' };
      case 'kcc_delivery': return { icon: 'arrow-down', color: '#FF6B6B' };
      default: return { icon: 'swap-horizontal', color: '#00D9FF' };
    }
  };

  const getTransactionTitle = (tx) => {
    switch (tx.type) {
      case 'milk_deposit': return `Milk from ${tx.farmer}`;
      case 'token_payment': return `Payment to ${tx.farmer}`;
      case 'kcc_pickup': return tx.description;
      case 'kcc_delivery': return tx.description;
      default: return 'Transaction';
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#00D9FF" />
            </TouchableOpacity>
            <Text style={styles.title}>Transaction History</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Filters */}
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'milk_deposit', 'token_payment', 'kcc_pickup', 'kcc_delivery'].map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  style={[
                    styles.filterButton,
                    filter === filterType && styles.filterButtonActive
                  ]}
                  onPress={() => setFilter(filterType)}
                >
                  <Text style={[
                    styles.filterText,
                    filter === filterType && styles.filterTextActive
                  ]}>
                    {filterType === 'all' ? 'All' : 
                     filterType === 'milk_deposit' ? 'Deposits' :
                     filterType === 'token_payment' ? 'Payments' :
                     filterType === 'kcc_pickup' ? 'KCC Pickup' : 'KCC Delivery'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {filteredTransactions.length} Transactions
            </Text>

            {filteredTransactions.map((tx) => {
              const { icon, color } = getTransactionIcon(tx.type);
              return (
                <View key={tx.id} style={styles.transactionCard}>
                  <View style={[styles.txIcon, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                  </View>
                  
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{getTransactionTitle(tx)}</Text>
                    <Text style={styles.txTime}>{tx.time}</Text>
                  </View>

                  <View style={styles.txAmount}>
                    <Text style={[styles.amountText, { color }]}>
                      {tx.type === 'token_payment' || tx.type === 'kcc_delivery' ? '-' : '+'}
                      {tx.amount} {tx.unit}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: tx.status === 'completed' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 193, 7, 0.2)' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: tx.status === 'completed' ? '#00FF88' : '#FFD700' }
                      ]}>
                        {tx.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>425L</Text>
                  <Text style={styles.summaryLabel}>Milk Received</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>398 MTZ</Text>
                  <Text style={styles.summaryLabel}>Tokens Paid</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>650L</Text>
                  <Text style={styles.summaryLabel}>KCC Pickup</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>520L</Text>
                  <Text style={styles.summaryLabel}>KCC Delivery</Text>
                </View>
              </View>
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
  scrollView: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 24,
  },
  backButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  placeholder: { width: 40 },
  section: { marginBottom: 24 },
  filterScroll: { marginBottom: 16 },
  filterButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    backgroundColor: '#1E2749', 
    borderRadius: 20, 
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  filterButtonActive: { backgroundColor: '#00D9FF' },
  filterText: { color: '#8B92B2', fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#0A0E27' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3356',
    marginBottom: 12
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  txInfo: { flex: 1 },
  txTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  txTime: { color: '#8B92B2', fontSize: 14 },
  txAmount: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '600' },
  summaryCard: { 
    backgroundColor: '#1E2749', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356' 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 16 
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { color: '#00D9FF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  summaryLabel: { color: '#8B92B2', fontSize: 12 },
});