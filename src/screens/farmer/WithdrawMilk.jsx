import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Btn from '../../components/Btn';
import { useTokens } from '../../hooks/useTokens';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function WithdrawMilk({ navigation }) {
  const { balance, refreshBalance } = useTokens();
  const { user } = useAuth();
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Depot code, 2: Verify depot, 3: Amount, 4: PIN
  const [formData, setFormData] = useState({
    depotCode: '',
    liters: '',
    pin: ''
  });
  const [withdrawing, setWithdrawing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [depotInfo, setDepotInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecentWithdrawals = async () => {
    try {
      const response = await axios.get('/wallet/transactions?type=milk_withdrawal&limit=5');
      if (response.data.success) {
        setRecentWithdrawals(response.data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), fetchRecentWithdrawals()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRecentWithdrawals();
  }, []);

  const verifyDepot = async () => {
    if (!formData.depotCode.trim()) {
      setError('Enter depot code');
      return;
    }

    try {
      setVerifying(true);
      const response = await axios.get(`/farmers/check-depot/${formData.depotCode.toUpperCase()}`);
      
      if (response.data.success) {
        setDepotInfo(response.data.data);
        setError('');
        setStep(2); // Show depot info
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Depot not found. Check code or try another depot.');
      setDepotInfo(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    setError('');
    
    if (step === 1) {
      await verifyDepot();
      return;
    }
    
    if (step === 2) {
      if (!depotInfo.canWithdraw) {
        setError('This depot cannot process withdrawals right now');
        return;
      }
      
      setStep(3); // Move to amount entry
      return;
    }
    
    if (step === 3) {
      if (!formData.liters || parseFloat(formData.liters) <= 0) {
        setError('Enter valid amount');
        return;
      }
      
      if (parseFloat(formData.liters) > balance) {
        setError(`Insufficient tokens. You have ${balance} MTZ`);
        return;
      }
      
      // Check if depot has enough milk
      if (parseFloat(formData.liters) > depotInfo.stock.pasteurizedMilk) {
        setError(`Only ${depotInfo.stock.pasteurizedMilk}L available at ${depotInfo.name}`);
        return;
      }
      
      setStep(4);
      return;
    }
    
    if (step === 4) {
      if (!formData.pin || formData.pin.length !== 4) {
        setError('Enter 4-digit PIN');
        return;
      }
      
      setWithdrawing(true);
      try {
        const payload = {
          depotCode: formData.depotCode.toUpperCase(),
          liters: parseFloat(formData.liters),
          pin: formData.pin
        };
        
        const response = await axios.post('/farmers/withdraw-milk', payload);
        
        if (response.data.success) {
          setSuccess(response.data.data);
          setShowWithdrawModal(false);
          setStep(1);
          setFormData({ depotCode: '', liters: '', pin: '' });
          setDepotInfo(null);
          onRefresh();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Withdrawal failed');
      } finally {
        setWithdrawing(false);
      }
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Enter Depot Code';
      case 2: return 'Verify Depot';
      case 3: return 'Enter Amount';
      case 4: return 'Confirm Withdrawal';
      default: return 'Withdraw Milk';
    }
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D9FF" />
          }
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Withdraw Milk</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Your Milk Tokens</Text>
              <Text style={styles.balanceAmount}>{balance} MTZ</Text>
              <Text style={styles.balanceNote}>1 MTZ = 1L Pasteurized Milk</Text>
            </View>

            {/* Withdraw Button */}
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => setShowWithdrawModal(true)}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#00D9FF', '#0094FF']} style={styles.withdrawGradient}>
                <Ionicons name="flask-outline" size={28} color="#FFF" />
                <Text style={styles.withdrawButtonText}>Withdraw Milk</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#00D9FF" />
              <Text style={styles.infoText}>
                Visit any depot, enter the depot code, and collect pasteurized milk using your MTZ tokens.
              </Text>
            </View>

            {/* Recent Withdrawals */}
            <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
            {recentWithdrawals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="flask-outline" size={48} color="#4A5174" />
                <Text style={styles.emptyStateText}>No withdrawals yet</Text>
              </View>
            ) : (
              recentWithdrawals.map(tx => (
                <View key={tx._id} style={styles.txCard}>
                  <View style={styles.txIcon}>
                    <Ionicons name="flask-outline" size={20} color="#00D9FF" />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>
                      {tx.depot?.name || 'Depot'}
                    </Text>
                    <Text style={styles.txAddress}>
                      Code: {tx.depot?.code || 'N/A'}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={styles.txAmount}>-{tx.litersPasteurized}L</Text>
                    <Text style={styles.txTokens}>-{tx.tokensAmount} MTZ</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Withdraw Modal */}
      <Modal 
        visible={showWithdrawModal} 
        transparent={true} 
        animationType="slide"
        onRequestClose={() => {
          setShowWithdrawModal(false);
          setStep(1);
          setFormData({ depotCode: '', liters: '', pin: '' });
          setDepotInfo(null);
          setError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getStepTitle()}</Text>
              <TouchableOpacity onPress={() => {
                setShowWithdrawModal(false);
                setStep(1);
                setFormData({ depotCode: '', liters: '', pin: '' });
                setDepotInfo(null);
                setError('');
              }} activeOpacity={0.7}>
                <Ionicons name="close" size={28} color="#8B92B2" />
              </TouchableOpacity>
            </View>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              {[1, 2, 3, 4].map(stepNum => (
                <View key={stepNum} style={styles.stepContainer}>
                  <View style={[styles.stepCircle, step >= stepNum && styles.stepCircleActive]}>
                    <Text style={[styles.stepText, step >= stepNum && styles.stepTextActive]}>
                      {stepNum}
                    </Text>
                  </View>
                  {stepNum < 4 && <View style={[styles.stepLine, step > stepNum && styles.stepLineActive]} />}
                </View>
              ))}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.modalBalance}>
              <Text style={styles.modalBalanceLabel}>Available Balance</Text>
              <Text style={styles.modalBalanceAmount}>{balance} MTZ</Text>
            </View>

            {/* Step 1: Depot Code */}
            {step === 1 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Depot Code</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., KMB001"
                  placeholderTextColor="#4A5174"
                  value={formData.depotCode}
                  onChangeText={(text) => {
                    const upper = text.toUpperCase();
                    setFormData({...formData, depotCode: upper});
                    setError('');
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <Text style={styles.inputHint}>
                  Ask the depot attendant for their code
                </Text>
              </View>
            )}

            {/* Step 2: Depot Verification */}
            {step === 2 && depotInfo && (
              <View style={styles.depotCard}>
                <View style={styles.depotHeader}>
                  <View style={styles.depotIcon}>
                    <Ionicons name="business-outline" size={24} color="#00D9FF" />
                  </View>
                  <View>
                    <Text style={styles.depotName}>{depotInfo.name}</Text>
                    <Text style={styles.depotCode}>Code: {depotInfo.code}</Text>
                  </View>
                </View>
                
                <View style={styles.depotDetails}>
                  <View style={styles.depotDetail}>
                    <Ionicons name="location-outline" size={16} color="#8B92B2" />
                    <Text style={styles.depotDetailText}>{depotInfo.location.fullAddress}</Text>
                  </View>
                  
                  <View style={styles.depotDetail}>
                    <Ionicons name="water-outline" size={16} color="#8B92B2" />
                    <Text style={styles.depotDetailText}>
                      Available Pasteurized Milk: {depotInfo.stock.pasteurizedMilk}L
                    </Text>
                  </View>
                  
                  <View style={styles.depotDetail}>
                    <Ionicons name="person-outline" size={16} color="#8B92B2" />
                    <Text style={styles.depotDetailText}>
                      Attendant: {depotInfo.attendant.name} ({depotInfo.attendant.phone})
                    </Text>
                  </View>
                  
                  <View style={styles.depotDetail}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={depotInfo.canWithdraw ? '#00FF88' : '#FF6B6B'} />
                    <Text style={[styles.depotDetailText, { color: depotInfo.canWithdraw ? '#00FF88' : '#FF6B6B' }]}>
                      {depotInfo.canWithdraw ? 'Ready for withdrawals' : 'Cannot process withdrawals'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Step 3: Amount */}
            {step === 3 && depotInfo && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Liters to Withdraw</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={`e.g., 5 (max: ${depotInfo.stock.pasteurizedMilk}L)`}
                  placeholderTextColor="#4A5174"
                  value={formData.liters}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9.]/g, '');
                    setFormData({...formData, liters: numeric});
                    setError('');
                  }}
                  keyboardType="decimal-pad"
                  autoCorrect={false}
                />
                <View style={styles.amountInfo}>
                  <Text style={styles.amountInfoText}>
                    Available at depot: {depotInfo.stock.pasteurizedMilk}L
                  </Text>
                  <Text style={styles.amountInfoText}>
                    Cost: {formData.liters || '0'} MTZ for {formData.liters || '0'}L milk
                  </Text>
                  <Text style={styles.amountInfoText}>
                    Your balance after: {(balance - parseFloat(formData.liters || 0)).toFixed(2)} MTZ
                  </Text>
                </View>
              </View>
            )}

            {/* Step 4: PIN */}
            {step === 4 && (
              <>
                <View style={styles.confirmationCard}>
                  <Text style={styles.confirmationLabel}>Withdrawing</Text>
                  <Text style={styles.confirmationAmount}>{formData.liters}L</Text>
                  <Text style={styles.confirmationText}>from {depotInfo?.name}</Text>
                  <Text style={styles.confirmationText}>for {formData.liters} MTZ</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter Security PIN</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="4-digit PIN"
                    placeholderTextColor="#4A5174"
                    value={formData.pin}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9]/g, '').substring(0, 4);
                      setFormData({...formData, pin: numeric});
                      setError('');
                    }}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
              </>
            )}

            <Btn 
              title={verifying ? 'Checking Depot...' : 
                     withdrawing ? 'Processing...' : 
                     step === 1 ? 'Check Depot' : 
                     step === 2 ? 'Continue' : 
                     step === 3 ? 'Continue' : 
                     'Confirm Withdrawal'} 
              onPress={handleWithdraw} 
              loading={verifying || withdrawing}
              disabled={
                (step === 1 && !formData.depotCode) ||
                (step === 3 && (!formData.liters || parseFloat(formData.liters) <= 0)) ||
                (step === 4 && (!formData.pin || formData.pin.length !== 4)) ||
                verifying || withdrawing
              }
            />

            {step > 1 && !verifying && !withdrawing && (
              <TouchableOpacity 
                onPress={() => {
                  setStep(step - 1);
                  setError('');
                }} 
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      {success && (
        <Modal visible={!!success} transparent={true} animationType="fade">
          <View style={styles.successOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIconContainer}>
                <LinearGradient colors={['#00D9FF', '#0094FF']} style={styles.successIconGradient}>
                  <Ionicons name="checkmark" size={48} color="#FFF" />
                </LinearGradient>
              </View>
              
              <Text style={styles.successTitle}>Withdrawal Successful!</Text>
              
              <View style={styles.successDetails}>
                <Text style={styles.successAmount}>
                  {success.receipt?.milk?.liters}L Milk
                </Text>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Depot:</Text>
                  <Text style={styles.successValue}>{success.receipt?.depot?.name}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Code:</Text>
                  <Text style={styles.successValue}>{success.receipt?.depot?.code}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Tokens Used:</Text>
                  <Text style={styles.successValue}>-{success.receipt?.payment?.tokensUsed} MTZ</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>New Balance:</Text>
                  <Text style={styles.successValue}>{success.receipt?.payment?.yourNewBalance} MTZ</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Attendant:</Text>
                  <Text style={styles.successValue}>{success.receipt?.attendant}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.successButton}
                onPress={() => {
                  setSuccess(null);
                  setShowWithdrawModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.successButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2749',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800'
  },
  placeholder: { width: 40 },
  content: { padding: 24 },
  balanceCard: {
    backgroundColor: '#1E2749',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  balanceLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600'
  },
  balanceAmount: {
    color: '#00D9FF',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4
  },
  balanceNote: {
    color: '#8B92B2',
    fontSize: 12
  },
  withdrawButton: {
    marginBottom: 24
  },
  withdrawGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12
  },
  withdrawButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700'
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)'
  },
  infoText: {
    color: '#00D9FF',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  txInfo: { flex: 1 },
  txTitle: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 4
  },
  txAddress: { 
    color: '#8B92B2', 
    fontSize: 12,
    marginBottom: 2
  },
  txDate: { 
    color: '#4A5174', 
    fontSize: 11
  },
  txRight: { 
    alignItems: 'flex-end'
  },
  txAmount: { 
    fontSize: 16, 
    fontWeight: '800',
    color: '#00D9FF',
    marginBottom: 4
  },
  txTokens: { 
    color: '#8B92B2', 
    fontSize: 12 
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyStateText: {
    color: '#4A5174',
    fontSize: 16,
    marginTop: 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#1A1F3A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800'
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A3356',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepCircleActive: { backgroundColor: '#00D9FF' },
  stepText: { 
    color: '#8B92B2', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  stepTextActive: { color: '#FFF' },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: '#2A3356',
    marginHorizontal: 6
  },
  stepLineActive: { backgroundColor: '#00D9FF' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)'
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
    flex: 1
  },
  modalBalance: {
    backgroundColor: '#0A0E27',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24
  },
  modalBalanceLabel: {
    color: '#8B92B2',
    fontSize: 12,
    marginBottom: 4
  },
  modalBalanceAmount: {
    color: '#00D9FF',
    fontSize: 28,
    fontWeight: '800'
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600'
  },
  modalInput: {
    backgroundColor: '#0A0E27',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  inputHint: {
    color: '#4A5174',
    fontSize: 12,
    marginTop: 8
  },
  amountInfo: {
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12
  },
  amountInfoText: {
    color: '#8B92B2',
    fontSize: 12,
    marginBottom: 4
  },
  depotCard: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)'
  },
  depotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  depotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  depotName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2
  },
  depotCode: {
    color: '#00D9FF',
    fontSize: 14
  },
  depotDetails: {
    gap: 10
  },
  depotDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  depotDetailText: {
    color: '#8B92B2',
    fontSize: 13,
    flex: 1
  },
  confirmationCard: {
    backgroundColor: '#0A0E27',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24
  },
  confirmationLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 8
  },
  confirmationAmount: {
    color: '#00D9FF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4
  },
  confirmationText: {
    color: '#FFF',
    fontSize: 16
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16
  },
  backButtonText: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600'
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  successModal: {
    backgroundColor: '#1A1F3A',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  successTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20
  },
  successAmount: {
    color: '#00FF88',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16
  },
  successDetails: {
    backgroundColor: '#0A0E27',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  successLabel: {
    color: '#8B92B2',
    fontSize: 14
  },
  successValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  },
  successButton: {
    backgroundColor: '#00D9FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  }
});