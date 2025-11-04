// src/screens/depot/Operations.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Btn from '../../components/Btn';

export default function Operations({ navigation }) {
  const [farmerPhone, setFarmerPhone] = useState('');
  const [liters, setLiters] = useState('');
  const [lactometer, setLactometer] = useState('');

  // Dummy data
  const pendingPayments = [
    { id: 1, farmer: 'John Kamau', liters: 25, quality: 'premium', time: '2 hours ago' },
    { id: 2, farmer: 'Jane Wambui', liters: 18, quality: 'standard', time: '1 hour ago' },
    { id: 3, farmer: 'Peter Maina', liters: 32, quality: 'premium', time: '30 mins ago' },
  ];

  const handleReceiveMilk = () => {
    if (!farmerPhone || !liters || !lactometer) {
      Alert.alert('Missing Info', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', `Recorded ${liters}L from ${farmerPhone}`);
    setFarmerPhone('');
    setLiters('');
    setLactometer('');
  };

  const handleQuickPayment = (payment) => {
    Alert.alert('Payment Processed', `Paid ${payment.liters} MTZ to ${payment.farmer}`);
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Milk Operations</Text>
            <Text style={styles.subtitle}>Manage milk receipts & payments</Text>
          </View>

          {/* Quick Receive Milk */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Milk Receipt</Text>
            <View style={styles.inputCard}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Farmer Phone</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="254712345678"
                  placeholderTextColor="#4A5174"
                  value={farmerPhone}
                  onChangeText={setFarmerPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Liters</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0"
                    placeholderTextColor="#4A5174"
                    value={liters}
                    onChangeText={setLiters}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Lactometer</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="28"
                    placeholderTextColor="#4A5174"
                    value={lactometer}
                    onChangeText={setLactometer}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Btn 
                title="Record Milk Deposit" 
                onPress={handleReceiveMilk}
                style={styles.actionButton}
              />
            </View>
          </View>

          {/* Pending Payments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Payments</Text>
              <Text style={styles.pendingCount}>{pendingPayments.length} pending</Text>
            </View>

            {pendingPayments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.farmerName}>{payment.farmer}</Text>
                  <Text style={styles.paymentDetails}>
                    {payment.liters}L • {payment.quality} • {payment.time}
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
                    <Text style={styles.payButtonText}>Pay {payment.liters} MTZ</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
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

          {/* Today's Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>125L</Text>
                <Text style={styles.summaryLabel}>Milk Received</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>8</Text>
                <Text style={styles.summaryLabel}>Farmers</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>117 MTZ</Text>
                <Text style={styles.summaryLabel}>Tokens Paid</Text>
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  pendingCount: { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  inputCard: { backgroundColor: '#1E2749', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A3356' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#8B92B2', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textInput: { backgroundColor: '#2A3356', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#3A4567' },
  inputRow: { flexDirection: 'row' },
  actionButton: { marginTop: 8 },
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
  payButton: { borderRadius: 8, overflow: 'hidden' },
  payButtonGradient: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  payButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { width: '31%', borderRadius: 12, overflow: 'hidden' },
  quickActionGradient: { height: 100, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  quickActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
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
});