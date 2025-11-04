// src/screens/depot/Inventory.js
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
import Btn from '../../components/Btn';

export default function Inventory({ navigation }) {
  // Dummy data
  const stockData = {
    rawMilk: 125,
    pasteurizedMilk: 80,
    capacity: 500,
    utilization: 41
  };

  const kccOperations = [
    { id: 1, type: 'pickup', liters: 200, time: 'Today, 10:30 AM', status: 'completed' },
    { id: 2, type: 'delivery', liters: 150, time: 'Yesterday, 2:15 PM', status: 'completed' },
    { id: 3, type: 'pickup', liters: 180, time: 'Scheduled', status: 'pending' },
  ];

  const handleKccPickup = () => {
    navigation.navigate('KccPickup');
  };

  const handleKccDelivery = () => {
    navigation.navigate('KccDeliveryQR');
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.subtitle}>Stock management & KCC operations</Text>
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
                <Text style={styles.stockValue}>{stockData.rawMilk}L</Text>
                <View style={styles.capacityBar}>
                  <View 
                    style={[
                      styles.capacityFill, 
                      { width: `${(stockData.rawMilk / stockData.capacity) * 100}%`, backgroundColor: '#00D9FF' }
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
                <Text style={styles.stockValue}>{stockData.pasteurizedMilk}L</Text>
                <View style={styles.capacityBar}>
                  <View 
                    style={[
                      styles.capacityFill, 
                      { width: `${(stockData.pasteurizedMilk / stockData.capacity) * 100}%`, backgroundColor: '#00FF88' }
                    ]} 
                  />
                </View>
              </View>

              {/* Total Capacity */}
              <View style={styles.capacityInfo}>
                <Text style={styles.capacityText}>
                  Total: {stockData.rawMilk + stockData.pasteurizedMilk}L / {stockData.capacity}L
                </Text>
                <Text style={styles.capacityPercent}>{stockData.utilization}% utilized</Text>
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
                >
                  <Ionicons name="arrow-down" size={28} color="#FFF" />
                  <Text style={styles.kccActionText}>Expect Delivery</Text>
                  <Text style={styles.kccActionSubtext}>Pasteurized milk</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Recent KCC Operations */}
            <View style={styles.recentOperations}>
              <Text style={styles.subSectionTitle}>Recent Operations</Text>
              {kccOperations.map((op) => (
                <View key={op.id} style={styles.operationCard}>
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
                      {op.liters}L • {op.time}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: op.status === 'completed' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 193, 7, 0.2)' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: op.status === 'completed' ? '#00FF88' : '#FFD700' }
                    ]}>
                      {op.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Stock Alerts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Alerts</Text>
            <View style={styles.alertCard}>
              <Ionicons name="warning" size={24} color="#FFD700" />
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>Raw Milk Nearing Capacity</Text>
                <Text style={styles.alertMessage}>
                  Consider scheduling KCC pickup soon
                </Text>
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
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#8B92B2' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  stockCard: { backgroundColor: '#1E2749', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A3356' },
  stockItem: { marginBottom: 20 },
  stockHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stockLabel: { color: '#8B92B2', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  stockValue: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  capacityBar: { height: 6, backgroundColor: '#2A3356', borderRadius: 3, overflow: 'hidden' },
  capacityFill: { height: '100%', borderRadius: 3 },
  capacityInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  capacityText: { color: '#8B92B2', fontSize: 14 },
  capacityPercent: { color: '#00D9FF', fontSize: 14, fontWeight: '600' },
  kccActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  kccAction: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  kccActionGradient: { padding: 16, alignItems: 'center', borderRadius: 12, minHeight: 120, justifyContent: 'center' },
  kccActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  kccActionSubtext: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginTop: 4, textAlign: 'center' },
  subSectionTitle: { color: '#8B92B2', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  recentOperations: { marginTop: 8 },
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
  operationInfo: { flex: 1 },
  operationType: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  operationDetails: { color: '#8B92B2', fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  alertCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 193, 7, 0.1)', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 193, 7, 0.3)' 
  },
  alertInfo: { flex: 1, marginLeft: 12 },
  alertTitle: { color: '#FFD700', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  alertMessage: { color: '#8B92B2', fontSize: 14 },
});