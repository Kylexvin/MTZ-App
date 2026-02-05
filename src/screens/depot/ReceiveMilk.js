// src/screens/depot/ReceiveMilk.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function ReceiveMilk({ route, navigation }) {
  const { user } = useAuth();
  const { farmer } = route.params || {};
  const [liters, setLiters] = useState('');
  const [lactometer, setLactometer] = useState('28');
  const [processing, setProcessing] = useState(false);

  const handleRecordDeposit = async () => {
    if (!liters || parseFloat(liters) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter valid liters amount');
      return;
    }

    if (!lactometer || parseFloat(lactometer) < 20 || parseFloat(lactometer) > 35) {
      Alert.alert('Invalid Lactometer', 'Lactometer reading must be between 20-35');
      return;
    }

    if (!farmer?.phone) {
      Alert.alert('Error', 'Farmer information missing');
      return;
    }

    try {
      setProcessing(true);

      const response = await axios.post(`/depots/${user.assignedDepot}/deposit/record`, {
        farmerPhone: farmer.phone,
        liters: parseFloat(liters),
        lactometerReading: parseFloat(lactometer),
      });

      if (response.data.success) {
        const depositData = response.data.data.depositRecord;
        
        Alert.alert(
          'Milk Deposit Recorded!',
          `${liters}L milk recorded for ${farmer.name}\n\n📝 Deposit Code: ${depositData.depositCode}\n🔢 Short Code: ${depositData.shortCode}\n\nGive these codes to the farmer for payment`,
          [
            {
              text: 'Make Payment Now',
              onPress: () => navigation.navigate('PaymentScreen', {
                transactionId: depositData.transactionId,
                farmerName: farmer.name,
                farmerPhone: farmer.phone,
                liters: parseFloat(liters),
                quality: depositData.quality,
                depositCode: depositData.depositCode,
                shortCode: depositData.shortCode,
              }),
            },
            {
              text: 'Back to Dashboard',
              onPress: () => navigation.navigate('Tabs', { screen: 'Dashboard' }),
            },
          ]
        );

        setLiters('');
        setLactometer('28');
      }
    } catch (error) {
      Alert.alert(
        'Deposit Failed',
        error.response?.data?.message || 'Please try again'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleQualityInfo = () => {
    Alert.alert(
      'Milk Quality Guide',
      '• Lactometer measures milk density\n• Standard range: 20-35\n• Higher reading = better quality\n\n⚠️ All milk pays 1 MTZ per liter'
    );
  };

  const calculateQuality = () => {
    const reading = parseFloat(lactometer) || 28;
    return reading >= 28 ? 'Premium' : 'Standard';
  };

  const calculateTokens = () => {
    const litersNum = parseFloat(liters) || 0;
    // 1:1 ratio - NO premium bonus
    return litersNum; // 1 liter = 1 MTZ
  };

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
            <Text style={styles.title}>Record Milk Deposit</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farmer Details</Text>
            <View style={styles.farmerCard}>
              <View style={styles.farmerHeader}>
                <View style={styles.farmerAvatar}>
                  <Ionicons name="person" size={20} color="#00D9FF" />
                </View>
                <View style={styles.farmerInfo}>
                  <Text style={styles.farmerName}>{farmer?.name || 'Not Selected'}</Text>
                  <Text style={styles.farmerPhone}>{farmer?.phone || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.farmerDetail}>
                <Ionicons name="location" size={14} color="#8B92B2" />
                <Text style={styles.farmerDetailText}>{farmer?.county || 'County not specified'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milk Details</Text>
            
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Liters of Milk</Text>
                  <Text style={styles.inputHint}>(Minimum: 1L)</Text>
                </View>
                <View style={styles.inputContainer}>
                  <Ionicons name="water" size={20} color="#00D9FF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="0"
                    placeholderTextColor="#4A5174"
                    value={liters}
                    onChangeText={setLiters}
                    keyboardType="numeric"
                    editable={!processing}
                  />
                  <Text style={styles.inputUnit}>L</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Lactometer Reading</Text>
                  <TouchableOpacity onPress={handleQualityInfo}>
                    <Ionicons name="information-circle" size={18} color="#00D9FF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <Ionicons name="speedometer" size={20} color="#00D9FF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="28"
                    placeholderTextColor="#4A5174"
                    value={lactometer}
                    onChangeText={setLactometer}
                    keyboardType="numeric"
                    editable={!processing}
                  />
                  <View style={[
                    styles.qualityBadge,
                    { backgroundColor: calculateQuality() === 'Premium' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 217, 255, 0.2)' }
                  ]}>
                    <Text style={[
                      styles.qualityText,
                      { color: calculateQuality() === 'Premium' ? '#00FF88' : '#00D9FF' }
                    ]}>
                      {calculateQuality()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.lactometerHint}>Reading affects quality grade only</Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Milk Quantity:</Text>
                  <Text style={styles.summaryValue}>{liters || 0} Liters</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Quality Grade:</Text>
                  <Text style={[
                    styles.summaryValue,
                    { color: calculateQuality() === 'Premium' ? '#00FF88' : '#00D9FF' }
                  ]}>
                    {calculateQuality()}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tokens to Pay:</Text>
                  <Text style={styles.tokensValue}>{calculateTokens()} MTZ</Text>
                </View>
                <Text style={styles.tokensNote}>
                  Rate: 1 MTZ per liter (all qualities)
                </Text>
              </View>
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
              style={styles.depositButton}
              onPress={handleRecordDeposit}
              disabled={processing || !liters || !farmer}
            >
              <LinearGradient
                colors={['#00FF88', '#00CC6A']}
                style={styles.depositButtonGradient}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.depositButtonText}>
                      Record {liters || 0}L Deposit
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Ionicons name="information-circle" size={16} color="#00D9FF" />
            <Text style={styles.infoText}>
              Farmer will receive deposit codes for payment. Milk is added to depot stock immediately.
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
  farmerCard: {
    backgroundColor: '#1E2749',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    marginRight: 12,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  farmerPhone: {
    color: '#8B92B2',
    fontSize: 14,
  },
  farmerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerDetailText: {
    color: '#8B92B2',
    fontSize: 13,
    marginLeft: 6,
  },
  formCard: {
    backgroundColor: '#1E2749',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputHint: {
    color: '#8B92B2',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A3356',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    paddingVertical: 16,
    fontWeight: '600',
  },
  inputUnit: {
    color: '#8B92B2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lactometerHint: {
    color: '#8B92B2',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#2A3356',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#8B92B2',
    fontSize: 15,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#3A4567',
    marginVertical: 16,
  },
  tokensValue: {
    color: '#00FF88',
    fontSize: 24,
    fontWeight: '800',
  },
  tokensNote: {
    color: '#8B92B2',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
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
  depositButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  depositButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  depositButtonText: {
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