import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TokenBalanceCard from '../../components/TokenBalanceCard';
import Btn from '../../components/Btn';
import { useTokens } from '../../hooks/useTokens';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Wallet({ navigation }) {
  const { balance, refreshBalance } = useTokens();
  const { user } = useAuth();
  const userPhone = user?.phone;
  
  const [showSendModal, setShowSendModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [sendStep, setSendStep] = useState(1);
  const [redeemStep, setRedeemStep] = useState(1);
  const [formData, setFormData] = useState({
    toUserPhone: '',
    tokenAmount: '',
    securityPin: '',
    notes: ''
  });
  const [redeemData, setRedeemData] = useState({
    tokenAmount: '',
    securityPin: '',
    estimatedCash: 0
  });
  const [sending, setSending] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [redeemError, setRedeemError] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get('/wallet/transactions');
      if (response.data.success) {
        setTransactions(response.data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), fetchTransactions()]);
    setRefreshing(false);
  }, [refreshBalance, fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate cash value when token amount changes
  useEffect(() => {
    if (redeemData.tokenAmount) {
      const tokenValue = parseFloat(redeemData.tokenAmount) * 50; // 1 MTZ = 50 KSH
      const fee = tokenValue * 0.05; // 5% fee
      const netCash = tokenValue - fee;
      setRedeemData(prev => ({ ...prev, estimatedCash: netCash }));
    }
  }, [redeemData.tokenAmount]);

  const showSuccess = (data) => {
    setSuccessData(data);
    setShowSuccessModal(true);
  };

  const handleSend = async () => {
    setError('');
    
    if (sendStep === 1) {
      if (!formData.toUserPhone.trim()) {
        setError('Recipient phone is required');
        return;
      }
      
      if (!formData.tokenAmount || parseFloat(formData.tokenAmount) <= 0) {
        setError('Enter valid amount');
        return;
      }
      
      if (parseFloat(formData.tokenAmount) > balance) {
        setError('Insufficient balance');
        return;
      }
      
      setSendStep(2);
      return;
    }
    
    if (sendStep === 2) {
      setSendStep(3);
      return;
    }
    
    if (sendStep === 3) {
      if (!formData.securityPin || formData.securityPin.length !== 4) {
        setError('Enter 4-digit PIN');
        return;
      }
      
      setSending(true);
      try {
        const payload = {
          toUserPhone: formData.toUserPhone.trim(),
          tokenAmount: parseFloat(formData.tokenAmount),
          securityPin: formData.securityPin,
          notes: formData.notes || ''
        };
        
        const response = await axios.post('/wallet/transfer', payload);
        
        if (response.data.success) {
          setShowSendModal(false);
          setSendStep(1);
          setFormData({ toUserPhone: '', tokenAmount: '', securityPin: '', notes: '' });
          onRefresh();
          
          // Show success modal
          showSuccess({
            type: 'send',
            amount: parseFloat(formData.tokenAmount),
            recipientPhone: formData.toUserPhone,
            recipientName: response.data.data?.receipt?.toUser?.name || 'User',
            newBalance: response.data.data?.receipt?.fromBalance || (balance - parseFloat(formData.tokenAmount)),
            transactionId: response.data.data?.receipt?.transactionId
          });
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || 
                        err.response?.data?.message || 
                        err.message || 
                        'Transfer failed';
        setError(errorMsg);
      } finally {
        setSending(false);
      }
    }
  };

  const handleRedeem = async () => {
    setRedeemError('');
    
    if (redeemStep === 1) {
      if (!redeemData.tokenAmount || parseFloat(redeemData.tokenAmount) <= 0) {
        setRedeemError('Enter valid amount');
        return;
      }
      
      if (parseFloat(redeemData.tokenAmount) > balance) {
        setRedeemError('Insufficient balance');
        return;
      }
      
      if (parseFloat(redeemData.tokenAmount) < 10) {
        setRedeemError('Minimum redemption is 10 MTZ');
        return;
      }
      
      setRedeemStep(2);
      return;
    }
    
    if (redeemStep === 2) {
      if (!redeemData.securityPin || redeemData.securityPin.length !== 4) {
        setRedeemError('Enter 4-digit PIN');
        return;
      }
      
      setRedeeming(true);
      try {
        const payload = {
          tokenAmount: parseFloat(redeemData.tokenAmount),
          securityPin: redeemData.securityPin
        };
        
        const response = await axios.post('/wallet/redeem', payload);
        
        if (response.data.success) {
          setShowRedeemModal(false);
          setRedeemStep(1);
          setRedeemData({ tokenAmount: '', securityPin: '', estimatedCash: 0 });
          onRefresh();
          
          // Show success modal
          showSuccess({
            type: 'redeem',
            tokens: parseFloat(redeemData.tokenAmount),
            cashAmount: response.data.data?.receipt?.redemptionValue || redeemData.estimatedCash,
            fee: response.data.data?.receipt?.fee || (redeemData.estimatedCash * 0.05),
            newBalance: response.data.data?.receipt?.newBalance || (balance - parseFloat(redeemData.tokenAmount)),
            transactionId: response.data.data?.receipt?.transactionId,
            mpesaStatus: response.data.data?.receipt?.mpesaStatus || 'completed'
          });
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || 
                        err.response?.data?.message || 
                        err.message || 
                        'Redemption failed';
        setRedeemError(errorMsg);
      } finally {
        setRedeeming(false);
      }
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.length === 12 && phone.startsWith('254')) {
      return `${phone.substring(0, 6)}***${phone.substring(9)}`;
    }
    return phone;
  };

  const getTransactionDisplay = (tx) => {
    const isSent = tx.fromUser?.phone === userPhone;
    const otherUser = isSent ? tx.toUser : tx.fromUser;
    const typeMap = {
      token_transfer: 'Transfer',
      milk_withdrawal: 'Milk Withdrawal',
      milk_deposit: 'Milk Deposit',
      cash_redemption: 'Cash Redemption'
    };

    return {
      type: typeMap[tx.type] || tx.type,
      amount: tx.tokensAmount || tx.cashAmount,
      sign: isSent ? '-' : '+',
      otherUser,
      date: new Date(tx.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      color: isSent ? '#00D9FF' : '#00FF88',
      isSelf: tx.toUser?.phone === tx.fromUser?.phone,
      isCashRedemption: tx.type === 'cash_redemption'
    };
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D9FF" />
        }
      >
        <View style={styles.content}>
          <TokenBalanceCard balance={balance} onRefresh={refreshBalance} />

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => setShowSendModal(true)} style={styles.actionBtn} activeOpacity={0.7}>
              <LinearGradient colors={['#00D9FF', '#0094FF']} style={styles.actionGradient}>
                <Ionicons name="arrow-up" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowRedeemModal(true)} style={styles.actionBtn} activeOpacity={0.7}>
              <LinearGradient colors={['#FF9500', '#FF5E00']} style={styles.actionGradient}>
                <Ionicons name="cash-outline" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Redeem Cash</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>Your Phone Number</Text>
            <View style={styles.addressRow}>
              <Text style={styles.address}>{formatPhone(userPhone)}</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons name="copy-outline" size={20} color="#00D9FF" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#4A5174" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map(tx => {
              const display = getTransactionDisplay(tx);
              return (
                <TouchableOpacity key={tx._id} style={styles.txCard} activeOpacity={0.7}>
                  <View style={[
                    styles.txIcon, 
                    { backgroundColor: display.isCashRedemption ? 'rgba(255, 149, 0, 0.1)' : 
                      display.sign === '+' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 217, 255, 0.1)' }
                  ]}>
                    <Ionicons 
                      name={display.isCashRedemption ? 'cash-outline' : 
                            display.sign === '+' ? 'arrow-down' : 'arrow-up'} 
                      size={20} 
                      color={display.isCashRedemption ? '#FF9500' : display.color} 
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{display.type}</Text>
                    {display.isSelf || display.isCashRedemption ? (
                      <Text style={styles.txAddress}>
                        {display.isCashRedemption ? 'M-Pesa Redemption' : 'Self transaction'}
                      </Text>
                    ) : (
                      <Text style={styles.txAddress} numberOfLines={1}>
                        {display.sign === '+' ? 'From: ' : 'To: '}{display.otherUser?.name}
                      </Text>
                    )}
                    <Text style={styles.txDate}>{display.date}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[
                      styles.txAmount, 
                      { color: display.isCashRedemption ? '#FF9500' : display.color }
                    ]}>
                      {display.isCashRedemption ? '≈' : display.sign}
                      {display.isCashRedemption ? `${tx.cashAmount} KSH` : `${display.amount} MTZ`}
                    </Text>
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: tx.status === 'completed' ? '#00FF88' : '#FFD700' }]} />
                      <Text style={styles.statusText}>{tx.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Send Modal */}
      <Modal 
        visible={showSendModal} 
        transparent={true} 
        animationType="slide"
        onRequestClose={() => {
          setShowSendModal(false);
          setSendStep(1);
          setFormData({ toUserPhone: '', tokenAmount: '', securityPin: '', notes: '' });
          setError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send MTZ</Text>
              <TouchableOpacity onPress={() => {
                setShowSendModal(false);
                setSendStep(1);
                setFormData({ toUserPhone: '', tokenAmount: '', securityPin: '', notes: '' });
                setError('');
              }} activeOpacity={0.7}>
                <Ionicons name="close" size={28} color="#8B92B2" />
              </TouchableOpacity>
            </View>

            <View style={styles.stepIndicator}>
              {[1, 2, 3].map(step => (
                <View key={step} style={styles.stepContainer}>
                  <View style={[styles.stepCircle, sendStep >= step && styles.stepCircleActive]}>
                    <Text style={[styles.stepText, sendStep >= step && styles.stepTextActive]}>
                      {step}
                    </Text>
                  </View>
                  {step < 3 && <View style={[styles.stepLine, sendStep > step && styles.stepLineActive]} />}
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
              <Text style={styles.modalBalanceAmount}>{balance.toLocaleString()} MTZ</Text>
            </View>

            {sendStep === 1 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Recipient Phone Number</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="254798765432"
                    placeholderTextColor="#4A5174"
                    value={formData.toUserPhone}
                    onChangeText={(text) => {
                      setFormData({...formData, toUserPhone: text});
                      setError('');
                    }}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Amount (MTZ)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="1.00"
                    placeholderTextColor="#4A5174"
                    value={formData.tokenAmount}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9.]/g, '');
                      setFormData({...formData, tokenAmount: numeric});
                      setError('');
                    }}
                    keyboardType="decimal-pad"
                    autoCorrect={false}
                  />
                </View>
              </>
            )}

            {sendStep === 2 && (
              <>
                <View style={styles.confirmationCard}>
                  <Text style={styles.confirmationLabel}>Sending</Text>
                  <Text style={styles.confirmationAmount}>{formData.tokenAmount} MTZ</Text>
                  <Text style={styles.confirmationText}>to {formatPhone(formData.toUserPhone)}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.modalInput, styles.textArea]}
                    placeholder="Test P2P transfer"
                    placeholderTextColor="#4A5174"
                    value={formData.notes}
                    onChangeText={(text) => setFormData({...formData, notes: text})}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </>
            )}

            {sendStep === 3 && (
              <>
                <View style={styles.confirmationCard}>
                  <Text style={styles.confirmationLabel}>Final Confirmation</Text>
                  <Text style={styles.confirmationAmount}>{formData.tokenAmount} MTZ</Text>
                  <Text style={styles.confirmationText}>to {formatPhone(formData.toUserPhone)}</Text>
                  {formData.notes ? <Text style={styles.confirmationNote}>Note: {formData.notes}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter Security PIN</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="1234"
                    placeholderTextColor="#4A5174"
                    value={formData.securityPin}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9]/g, '').substring(0, 4);
                      setFormData({...formData, securityPin: numeric});
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
              title={sending ? 'Processing...' : sendStep === 3 ? 'Confirm & Send' : 'Continue'} 
              onPress={handleSend} 
              loading={sending}
              disabled={
                (sendStep === 1 && (!formData.toUserPhone || !formData.tokenAmount)) ||
                (sendStep === 3 && (!formData.securityPin || formData.securityPin.length !== 4)) ||
                sending
              }
            />

            {sendStep > 1 && !sending && (
              <TouchableOpacity 
                onPress={() => {
                  setSendStep(sendStep - 1);
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

      {/* Redeem Cash Modal */}
      <Modal 
        visible={showRedeemModal} 
        transparent={true} 
        animationType="slide"
        onRequestClose={() => {
          setShowRedeemModal(false);
          setRedeemStep(1);
          setRedeemData({ tokenAmount: '', securityPin: '', estimatedCash: 0 });
          setRedeemError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Redeem for Cash</Text>
              <TouchableOpacity onPress={() => {
                setShowRedeemModal(false);
                setRedeemStep(1);
                setRedeemData({ tokenAmount: '', securityPin: '', estimatedCash: 0 });
                setRedeemError('');
              }} activeOpacity={0.7}>
                <Ionicons name="close" size={28} color="#8B92B2" />
              </TouchableOpacity>
            </View>

            <View style={styles.stepIndicator}>
              {[1, 2].map(step => (
                <View key={step} style={styles.stepContainer}>
                  <View style={[styles.stepCircle, redeemStep >= step && styles.stepCircleActive]}>
                    <Text style={[styles.stepText, redeemStep >= step && styles.stepTextActive]}>
                      {step}
                    </Text>
                  </View>
                  {step < 2 && <View style={[styles.stepLine, redeemStep > step && styles.stepLineActive]} />}
                </View>
              ))}
            </View>

            {redeemError ? (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
                <Text style={styles.errorText}>{redeemError}</Text>
              </View>
            ) : null}

            <View style={styles.modalBalance}>
              <Text style={styles.modalBalanceLabel}>Available Balance</Text>
              <Text style={styles.modalBalanceAmount}>{balance.toLocaleString()} MTZ</Text>
            </View>

            {redeemStep === 1 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tokens to Redeem (MTZ)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="10.00"
                    placeholderTextColor="#4A5174"
                    value={redeemData.tokenAmount}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9.]/g, '');
                      setRedeemData({...redeemData, tokenAmount: numeric});
                      setRedeemError('');
                    }}
                    keyboardType="decimal-pad"
                    autoCorrect={false}
                  />
                </View>

                {redeemData.estimatedCash > 0 && (
                  <View style={styles.calculationCard}>
                    <Text style={styles.calcLabel}>Estimated Cash Value</Text>
                    <Text style={styles.calcAmount}>{redeemData.estimatedCash.toFixed(2)} KSH</Text>
                    <View style={styles.calcBreakdown}>
                      <Text style={styles.calcText}>
                        {redeemData.tokenAmount} MTZ × 50 KSH = {(parseFloat(redeemData.tokenAmount) * 50).toFixed(2)} KSH
                      </Text>
                      <Text style={styles.calcText}>
                        Fee (5%): -{((parseFloat(redeemData.tokenAmount) * 50) * 0.05).toFixed(2)} KSH
                      </Text>
                    </View>
                    <Text style={styles.calcNote}>Minimum redemption: 10 MTZ (≈ 475 KSH)</Text>
                  </View>
                )}
              </>
            )}

            {redeemStep === 2 && (
              <>
                <View style={styles.confirmationCard}>
                  <Text style={styles.confirmationLabel}>Redeeming</Text>
                  <Text style={styles.confirmationAmount}>{redeemData.tokenAmount} MTZ</Text>
                  <Text style={styles.confirmationText}>for ≈ {redeemData.estimatedCash.toFixed(2)} KSH</Text>
                  <View style={styles.mpesaBadge}>
                    <Ionicons name="phone-portrait-outline" size={16} color="#FFF" />
                    <Text style={styles.mpesaText}>Via M-Pesa</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter Security PIN</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="1234"
                    placeholderTextColor="#4A5174"
                    value={redeemData.securityPin}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9]/g, '').substring(0, 4);
                      setRedeemData({...redeemData, securityPin: numeric});
                      setRedeemError('');
                    }}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#00D9FF" />
                  <Text style={styles.infoText}>
                    Cash will be sent to your M-Pesa registered phone number within 2-3 minutes.
                  </Text>
                </View>
              </>
            )}

            <Btn 
              title={redeeming ? 'Processing...' : redeemStep === 2 ? 'Confirm Redemption' : 'Continue'} 
              onPress={handleRedeem} 
              loading={redeeming}
              gradientColors={['#FF9500', '#FF5E00']}
              disabled={
                (redeemStep === 1 && (!redeemData.tokenAmount || parseFloat(redeemData.tokenAmount) < 10)) ||
                (redeemStep === 2 && (!redeemData.securityPin || redeemData.securityPin.length !== 4)) ||
                redeeming
              }
            />

            {redeemStep > 1 && !redeeming && (
              <TouchableOpacity 
                onPress={() => {
                  setRedeemStep(redeemStep - 1);
                  setRedeemError('');
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
      <Modal 
        visible={showSuccessModal} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <LinearGradient 
                colors={successData?.type === 'redeem' ? ['#FF9500', '#FF5E00'] : ['#00D9FF', '#0094FF']} 
                style={styles.successIconGradient}
              >
                <Ionicons 
                  name={successData?.type === 'redeem' ? 'cash-outline' : 'checkmark'} 
                  size={48} 
                  color="#FFF" 
                />
              </LinearGradient>
            </View>
            
            <Text style={styles.successTitle}>
              {successData?.type === 'redeem' ? 'Redemption Successful!' : 'Transfer Successful!'}
            </Text>
            
            <View style={styles.successDetails}>
              {successData?.type === 'redeem' ? (
                <>
                  <Text style={styles.successAmount}>
                    {successData?.cashAmount?.toFixed(2)} KSH
                  </Text>
                  <Text style={styles.successSubtitle}>
                    Sent to your M-Pesa
                  </Text>
                  <View style={styles.successRow}>
                    <Text style={styles.successLabel}>Tokens Redeemed:</Text>
                    <Text style={styles.successValue}>{successData?.tokens} MTZ</Text>
                  </View>
                  <View style={styles.successRow}>
                    <Text style={styles.successLabel}>Fee:</Text>
                    <Text style={styles.successValue}>-{successData?.fee?.toFixed(2)} KSH</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.successAmount}>
                    {successData?.amount} MTZ
                  </Text>
                  <Text style={styles.successSubtitle}>
                    Sent to {formatPhone(successData?.recipientPhone)}
                  </Text>
                  <View style={styles.successRow}>
                    <Text style={styles.successLabel}>Recipient:</Text>
                    <Text style={styles.successValue}>{successData?.recipientName}</Text>
                  </View>
                </>
              )}
              
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>New Balance:</Text>
                <Text style={styles.successValue}>{successData?.newBalance?.toFixed(2)} MTZ</Text>
              </View>
              
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Transaction ID:</Text>
                <Text style={styles.successValueSmall}>
                  {successData?.transactionId?.toString().substring(0, 8)}...
                </Text>
              </View>
            </View>
            
            <View style={styles.successButtons}>
              <TouchableOpacity 
                style={styles.successButtonSecondary}
                onPress={() => setShowSuccessModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.successButtonSecondaryText}>View Transaction</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.successButtonPrimary,
                  { backgroundColor: successData?.type === 'redeem' ? '#FF9500' : '#00D9FF' }
                ]}
                onPress={() => {
                  setShowSuccessModal(false);
                  if (successData?.type === 'redeem') {
                    setShowRedeemModal(true);
                  } else {
                    setShowSendModal(true);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.successButtonPrimaryText}>
                  {successData?.type === 'redeem' ? 'Redeem More' : 'Send Again'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.successClose}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Add success modal styles
const successStyles = {
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
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8
  },
  successSubtitle: {
    color: '#8B92B2',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24
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
  successValueSmall: {
    color: '#8B92B2',
    fontSize: 12,
    fontWeight: '600'
  },
  successButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20
  },
  successButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  successButtonPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  successButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2A3356',
    borderWidth: 1,
    borderColor: '#4A5174'
  },
  successButtonSecondaryText: {
    color: '#8B92B2',
    fontSize: 16,
    fontWeight: '600'
  },
  successClose: {
    alignItems: 'center'
  },
  successCloseText: {
    color: '#4A5174',
    fontSize: 14,
    fontWeight: '600'
  }
};

// Merge all styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { padding: 24, paddingTop: 40 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24
  },
  actionBtn: { alignItems: 'center' },
  actionGradient: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8
  },
  actionLabel: { color: '#8B92B2', fontSize: 12, fontWeight: '600' },
  addressCard: {
    backgroundColor: '#1E2749', padding: 20, borderRadius: 16,
    marginBottom: 32, borderWidth: 1, borderColor: '#2A3356'
  },
  addressLabel: { color: '#8B92B2', fontSize: 12, marginBottom: 12, fontWeight: '600' },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  address: { color: '#FFF', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 12 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 16 },
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
  txCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E2749', padding: 16, borderRadius: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#2A3356'
  },
  txIcon: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12
  },
  txInfo: { flex: 1 },
  txTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  txAddress: { color: '#8B92B2', fontSize: 12, marginBottom: 2 },
  txDate: { color: '#4A5174', fontSize: 11 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { color: '#00FF88', fontSize: 10, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#1A1F3A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24
  },
  modalTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  stepIndicator: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 24
  },
  stepContainer: {
    flexDirection: 'row', alignItems: 'center'
  },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A3356', justifyContent: 'center',
    alignItems: 'center'
  },
  stepCircleActive: { backgroundColor: '#00D9FF' },
  stepText: { color: '#8B92B2', fontSize: 14, fontWeight: '600' },
  stepTextActive: { color: '#FFF' },
  stepLine: {
    width: 40, height: 2, backgroundColor: '#2A3356', marginHorizontal: 8
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
    backgroundColor: '#0A0E27', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 24
  },
  modalBalanceLabel: { color: '#8B92B2', fontSize: 12, marginBottom: 4 },
  modalBalanceAmount: { color: '#00D9FF', fontSize: 28, fontWeight: '800' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#8B92B2', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  modalInput: {
    backgroundColor: '#0A0E27', borderRadius: 12, padding: 16,
    color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#2A3356'
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  confirmationCard: {
    backgroundColor: '#0A0E27', padding: 20, borderRadius: 12,
    alignItems: 'center', marginBottom: 24
  },
  confirmationLabel: { color: '#8B92B2', fontSize: 14, marginBottom: 8 },
  confirmationAmount: { color: '#00D9FF', fontSize: 32, fontWeight: '800', marginBottom: 4 },
  confirmationText: { color: '#FFF', fontSize: 16 },
  confirmationNote: { color: '#8B92B2', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  calculationCard: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)'
  },
  calcLabel: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  calcAmount: {
    color: '#FF9500',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12
  },
  calcBreakdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  calcText: {
    color: '#8B92B2',
    fontSize: 12,
    marginBottom: 4
  },
  calcNote: {
    color: '#8B92B2',
    fontSize: 11,
    fontStyle: 'italic'
  },
  mpesaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8
  },
  mpesaText: {
    color: '#00C800',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)'
  },
  infoText: {
    color: '#00D9FF',
    fontSize: 12,
    marginLeft: 8,
    flex: 1
  },
  backButton: { alignItems: 'center', marginTop: 16 },
  backButtonText: { color: '#8B92B2', fontSize: 14, fontWeight: '600' },
  ...successStyles // Merge success styles
});