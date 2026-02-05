// src/screens/depot/PaymentScreen.js
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

export default function PaymentScreen({ route, navigation }) {
  const { user } = useAuth();
  const { transactionId, farmerName, farmerPhone, liters, quality, depositCode, shortCode } = route.params || {};
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/depots/${user.assignedDepot}/deposit/pending`);
      
      if (response.data.success) {
        const pendingDeposits = response.data.data.pendingDeposits;
        let deposit;
        
        if (transactionId) {
          deposit = pendingDeposits.find(d => d.transactionId === transactionId);
        } else if (depositCode) {
          deposit = pendingDeposits.find(d => d.depositCode === depositCode);
        } else if (shortCode) {
          deposit = pendingDeposits.find(d => d.shortCode === shortCode);
        }
        
        if (deposit) {
          setPaymentData({
            transactionId: deposit.transactionId,
            farmerName: deposit.farmer.name,
            farmerPhone: deposit.farmer.phone,
            liters: deposit.liters,
            quality: deposit.quality,
            tokensDue: deposit.tokensDue,
            depositCode: deposit.depositCode,
            shortCode: deposit.shortCode,
            depositTime: new Date(deposit.depositTime).toLocaleString(),
            lactometerReading: deposit.lactometerReading,
          });
        } else {
          setPaymentData({
            transactionId: transactionId || 'N/A',
            farmerName: farmerName || 'Unknown Farmer',
            farmerPhone: farmerPhone || 'N/A',
            liters: liters || 0,
            quality: quality || 'standard',
            tokensDue: liters || 0,
            depositCode: depositCode || 'N/A',
            shortCode: shortCode || 'N/A',
            depositTime: new Date().toLocaleString(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      setPaymentData({
        transactionId: transactionId || 'N/A',
        farmerName: farmerName || 'Unknown Farmer',
        farmerPhone: farmerPhone || 'N/A',
        liters: liters || 0,
        quality: quality || 'standard',
        tokensDue: liters || 0,
        depositCode: depositCode || 'N/A',
        shortCode: shortCode || 'N/A',
        depositTime: new Date().toLocaleString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentData?.transactionId) {
      Alert.alert('Error', 'Transaction ID missing');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await axios.post(`/depots/${user.assignedDepot}/deposit/pay`, {
        transactionId: paymentData.transactionId,
      });

      if (response.data.success) {
        Alert.alert(
          '✅ Payment Successful',
          `${response.data.data.paymentReceipt.paymentDetails.tokensPaid} MTZ paid to ${paymentData.farmerName}`,
          [{ 
            text: 'Back to Dashboard', 
            onPress: () => navigation.navigate('Tabs', { screen: 'Dashboard' }) 
          }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Payment Failed', 
        error.response?.data?.message || 'Please try again'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Loading Payment Details...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#00D9FF" />
            </TouchableOpacity>
            <Text style={styles.title}>Process Payment</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.section}>
            <View style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <Ionicons name="cash" size={32} color="#00FF88" />
                <Text style={styles.detailsTitle}>Milk Deposit Payment</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Farmer:</Text>
                <Text style={styles.detailValue}>{paymentData?.farmerName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{paymentData?.farmerPhone}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Deposit Code:</Text>
                <Text style={styles.codeValue}>{paymentData?.depositCode}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Short Code:</Text>
                <Text style={styles.codeValue}>{paymentData?.shortCode}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.milkDetails}>
                <View style={styles.milkDetailRow}>
                  <Text style={styles.milkLabel}>Milk Quantity:</Text>
                  <Text style={styles.milkValue}>{paymentData?.liters} Liters</Text>
                </View>
                <View style={styles.milkDetailRow}>
                  <Text style={styles.milkLabel}>Quality:</Text>
                  <View style={[
                    styles.qualityBadge,
                    { backgroundColor: paymentData?.quality === 'premium' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 217, 255, 0.2)' }
                  ]}>
                    <Text style={[
                      styles.qualityText,
                      { color: paymentData?.quality === 'premium' ? '#00FF88' : '#00D9FF' }
                    ]}>
                      {paymentData?.quality?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {paymentData?.lactometerReading && (
                  <View style={styles.milkDetailRow}>
                    <Text style={styles.milkLabel}>Lactometer:</Text>
                    <Text style={styles.milkValue}>{paymentData.lactometerReading}</Text>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Tokens to Pay</Text>
                <Text style={styles.amountValue}>{paymentData?.tokensDue || 0} MTZ</Text>
                <Text style={styles.amountRate}>Rate: 1 MTZ per liter</Text>
              </View>

              <View style={styles.timeInfo}>
                <Ionicons name="time" size={14} color="#8B92B2" />
                <Text style={styles.timeText}>Deposited: {paymentData?.depositTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirm Payment</Text>
            <View style={styles.confirmationCard}>
              <Ionicons name="shield-checkmark" size={48} color="#00FF88" style={styles.confirmIcon} />
              <Text style={styles.confirmTitle}>Ready to Process</Text>
              <Text style={styles.confirmText}>
                This will transfer {paymentData?.tokensDue || 0} MTZ from your attendant wallet to the farmer's wallet.
              </Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={processing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.payButton}
              onPress={handleProcessPayment}
              disabled={processing || !paymentData?.transactionId}
            >
              <LinearGradient
                colors={['#00FF88', '#00CC6A']}
                style={styles.payButtonGradient}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.payButtonText}>Pay {paymentData?.tokensDue || 0} MTZ</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Ionicons name="information-circle" size={16} color="#00D9FF" />
            <Text style={styles.infoText}>
              Verify deposit codes match farmer's receipt before payment
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#1E2749',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  codeValue: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A3356',
    marginVertical: 16,
  },
  milkDetails: {
    marginBottom: 16,
  },
  milkDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milkLabel: {
    color: '#8B92B2',
    fontSize: 14,
  },
  milkValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    color: '#00FF88',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  amountRate: {
    color: '#8B92B2',
    fontSize: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  timeText: {
    color: '#8B92B2',
    fontSize: 12,
    marginLeft: 4,
  },
  confirmationCard: {
    backgroundColor: '#1E2749',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
    alignItems: 'center',
  },
  confirmIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    color: '#00FF88',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  confirmText: {
    color: '#8B92B2',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A3356',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  cancelButtonText: {
    color: '#8B92B2',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  payButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    marginBottom: 40,
  },
  infoText: {
    color: '#8B92B2',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});