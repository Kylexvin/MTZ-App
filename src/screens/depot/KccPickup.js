// src/screens/depot/KccPickup.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';


export default function KccPickup({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signalStatus, setSignalStatus] = useState(null);
  const [estimatedLiters, setEstimatedLiters] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [depotStock, setDepotStock] = useState({
    rawMilk: 0,
    pasteurizedMilk: 0,
    capacity: 0,
    utilization: 0
  });

  // Fetch current pickup signal status
// Fetch current pickup signal status
const fetchSignalStatus = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // Fetch both inventory data and pickup signal in parallel
    const [inventoryResponse, signalResponse] = await Promise.allSettled([
      axios.get(`/depots/${user.assignedDepot}/inventory`),
      axios.get(`/depots/${user.assignedDepot}/pickup-signal`)
    ]);

    // Handle inventory data
    if (inventoryResponse.status === 'fulfilled' && inventoryResponse.value.data.success) {
      const stockData = inventoryResponse.value.data.data?.stock || inventoryResponse.value.data.data || {};
      
      setDepotStock({
        rawMilk: stockData.rawMilk || 0,
        pasteurizedMilk: stockData.pasteurizedMilk || 0,
        capacity: stockData.capacity || 0,
        utilization: stockData.utilization || 0
      });
      
      // Pre-fill estimated liters with raw milk if no signal
      // But only if we don't already have a signal from the other response
      const hasSignal = signalResponse.status === 'fulfilled' && 
                       signalResponse.value.data.success && 
                       signalResponse.value.data.data?.signal;
      
      if (!hasSignal) {
        setEstimatedLiters((stockData.rawMilk || 0).toString());
      }
    } else {
      console.error('Inventory fetch failed:', inventoryResponse.reason);
    }

    // Handle pickup signal
    if (signalResponse.status === 'fulfilled' && signalResponse.value.data.success) {
      setSignalStatus(signalResponse.value.data.data?.signal || null);
    } else {
      console.error('Signal fetch failed:', signalResponse.reason);
      setSignalStatus(null);
    }

  } catch (error) {
    console.error('Failed to fetch data:', error);
    Alert.alert('Error', 'Failed to load pickup status');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchSignalStatus();
  }, []);

  // Signal pickup available - keep existing
  const handleSignalPickup = async () => {
    if (!estimatedLiters || isNaN(estimatedLiters) || parseInt(estimatedLiters) < 1) {
      Alert.alert('Invalid Input', 'Please enter a valid number of liters');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axios.post(`/depots/${user.assignedDepot}/pickup-signal`, {
        estimatedLiters: parseInt(estimatedLiters)
      });

      if (response.data.success) {
        Alert.alert(
          'Success', 
          `Pickup signaled: ~${response.data.data.signal.estimatedLiters}L available\n\nKCC attendants in your county have been notified.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        fetchSignalStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Failed to signal pickup:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to signal pickup'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel pickup signal - keep existing
  const handleCancelSignal = async () => {
    Alert.alert(
      'Cancel Pickup Signal',
      'Are you sure you want to cancel the pickup signal?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              
              const response = await axios.delete(`/depots/${user.assignedDepot}/pickup-signal`);
              
              if (response.data.success) {
                Alert.alert('Cancelled', 'Pickup signal has been cancelled');
                setSignalStatus(null);
              }
            } catch (error) {
              console.error('Failed to cancel signal:', error);
              Alert.alert('Error', 'Failed to cancel pickup signal');
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
          <SafeAreaView style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00D9FF" />
            <Text style={styles.loadingText}>Loading pickup status...</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchSignalStatus(true)}
                tintColor="#00D9FF"
                colors={['#00D9FF']}
              />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Request KCC Pickup</Text>
              <View style={styles.placeholder} />
            </View>

            <Text style={styles.subtitle}>
              Signal that you have raw milk ready for collection
            </Text>

            {/* Current Status Card */}
            {signalStatus && (
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons 
                    name={signalStatus.status === 'accepted' ? "checkmark-circle" : "time"} 
                    size={24} 
                    color={signalStatus.status === 'accepted' ? '#00FF88' : '#FFD700'} 
                  />
                  <Text style={styles.statusTitle}>
                    {signalStatus.status === 'available' ? 'Signal Active' : 
                     signalStatus.status === 'accepted' ? 'KCC En Route' : 
                     'Pickup Status'}
                  </Text>
                </View>

                <View style={styles.statusDetails}>
                  <View style={styles.statusRow}>
                    <Ionicons name="water" size={16} color="#00D9FF" />
                    <Text style={styles.statusLabel}>Estimated Liters:</Text>
                    <Text style={styles.statusValue}>{signalStatus.estimatedLiters}L</Text>
                  </View>

                  <View style={styles.statusRow}>
                    <Ionicons name="time" size={16} color="#8B92B2" />
                    <Text style={styles.statusLabel}>Signaled:</Text>
                    <Text style={styles.statusValue}>
                      {new Date(signalStatus.signaledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>

                  {signalStatus.expiresAt && (
                    <View style={styles.statusRow}>
                      <Ionicons name="hourglass" size={16} color="#FF6B6B" />
                      <Text style={styles.statusLabel}>Expires:</Text>
                      <Text style={styles.statusValue}>
                        {signalStatus.timeRemaining || 
                         Math.round((new Date(signalStatus.expiresAt) - new Date()) / 60000) + ' min'}
                      </Text>
                    </View>
                  )}

                  {signalStatus.status === 'accepted' && signalStatus.acceptedBy && (
                    <View style={styles.acceptedSection}>
                      <View style={styles.acceptedBadge}>
                        <Ionicons name="checkmark" size={12} color="#00FF88" />
                        <Text style={styles.acceptedText}>Accepted by KCC</Text>
                      </View>
                      <View style={styles.kccInfo}>
                        <Text style={styles.kccLabel}>KCC Attendant:</Text>
                        <Text style={styles.kccName}>{signalStatus.acceptedBy.name}</Text>
                        <Text style={styles.kccPhone}>{signalStatus.acceptedBy.phone}</Text>
                      </View>
                    </View>
                  )}

                  {signalStatus.status === 'available' && (
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={handleCancelSignal}
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                          <Text style={styles.cancelButtonText}>Cancel Signal</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Signal Form (only show if no active signal) */}
            {!signalStatus && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Signal Pickup Availability</Text>
                <Text style={styles.formDescription}>
                  Let KCC attendants know you have raw milk ready for collection. 
                  They'll see this signal and can come to collect.
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="water" size={18} color="#00D9FF" />
                    <Text style={styles.inputLabel}>Estimated Liters Available</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={estimatedLiters}
                    onChangeText={setEstimatedLiters}
                    placeholder="Enter estimated liters"
                    placeholderTextColor="#4A5174"
                    keyboardType="numeric"
                    editable={!submitting}
                  />
                  {/* Updated: Use depotStock state instead of signalStatus */}
                  <Text style={styles.inputHint}>
                    Current raw milk stock: {depotStock.rawMilk}L
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#00D9FF" />
                  <Text style={styles.infoText}>
                    • Signal expires after 2 hours{'\n'}
                    • Only KCC attendants in your county will see this{'\n'}
                    • You can cancel the signal anytime{'\n'}
                    • KCC will physically measure milk upon arrival
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.signalButton, submitting && styles.signalButtonDisabled]}
                  onPress={handleSignalPickup}
                  disabled={submitting || !estimatedLiters}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="megaphone" size={20} color="#FFFFFF" />
                      <Text style={styles.signalButtonText}>Signal Pickup Available</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Next Steps Info */}
            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>How it works:</Text>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Signal Availability</Text>
                  <Text style={styles.stepDescription}>
                    Enter estimated liters. KCC attendants in your county will be notified.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>KCC Accepts</Text>
                  <Text style={styles.stepDescription}>
                    A KCC attendant will accept your signal and come to your depot.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Physical Verification</Text>
                  <Text style={styles.stepDescription}>
                    KCC attendant will physically measure the milk upon arrival.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Token Payment</Text>
                  <Text style={styles.stepDescription}>
                    KCC pays you tokens (1 MTZ per liter) after verification.
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Inventory')}
              >
                <Ionicons name="stats-chart" size={20} color="#00D9FF" />
                <Text style={styles.quickActionText}>View Inventory</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('KccDeliveryQR')}
              >
                <Ionicons name="arrow-down" size={20} color="#FF6B6B" />
                <Text style={styles.quickActionText}>Request Delivery</Text>
              </TouchableOpacity>
            </View>

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
    paddingTop: 20,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2749',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B92B2',
    textAlign: 'center',
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  statusDetails: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 12,
    flex: 1,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptedSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptedText: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  kccInfo: {
    marginLeft: 4,
  },
  kccLabel: {
    color: '#8B92B2',
    fontSize: 12,
    marginBottom: 2,
  },
  kccName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  kccPhone: {
    color: '#00D9FF',
    fontSize: 14,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  formCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formDescription: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#2A3356',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  inputHint: {
    color: '#4A5174',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  infoText: {
    color: '#8B92B2',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  signalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D9FF',
    padding: 18,
    borderRadius: 12,
  },
  signalButtonDisabled: {
    backgroundColor: '#1A4567',
  },
  signalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  stepsCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#8B92B2',
    fontSize: 14,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});