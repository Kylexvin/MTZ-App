import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TokenBalanceCard from '../../components/TokenBalanceCard';
import Btn from '../../components/Btn';
import { useTokens } from '../../hooks/useTokens';

export default function Wallet({ navigation }) {
  const { balance, refreshBalance } = useTokens();
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const transactions = [
    { id: '1', type: 'received', amount: 500, date: '2 hours ago', from: '0xAB12...CD34', status: 'confirmed' },
    { id: '2', type: 'sent', amount: 200, date: '5 hours ago', to: '0xEF56...GH78', status: 'confirmed' },
    { id: '3', type: 'received', amount: 750, date: 'Yesterday', from: '0x1234...5678', status: 'confirmed' },
    { id: '4', type: 'sent', amount: 300, date: '2 days ago', to: '0x9ABC...DEF0', status: 'confirmed' },
    { id: '5', type: 'received', amount: 1200, date: '3 days ago', from: '0x2468...ACE0', status: 'confirmed' }
  ];

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setShowSendModal(false);
      setRecipient('');
      setAmount('');
      refreshBalance();
    }, 2000);
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Scanner')} style={styles.scanBtn}>
            <Ionicons name="qr-code-outline" size={24} color="#00D9FF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <TokenBalanceCard balance={balance} onRefresh={refreshBalance} />

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => setShowSendModal(true)} style={styles.actionBtn} activeOpacity={0.7}>
                <LinearGradient colors={['#00D9FF', '#0094FF']} style={styles.actionGradient}>
                  <Ionicons name="arrow-up" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.actionLabel}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <LinearGradient colors={['#00FF88', '#00CC6A']} style={styles.actionGradient}>
                  <Ionicons name="arrow-down" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.actionLabel}>Receive</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <LinearGradient colors={['#7B2CFF', '#A855F7']} style={styles.actionGradient}>
                  <Ionicons name="swap-horizontal" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.actionLabel}>Swap</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>Your Wallet Address</Text>
              <View style={styles.addressRow}>
                <Text style={styles.address} numberOfLines={1}>0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name="copy-outline" size={20} color="#00D9FF" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.map(tx => (
              <TouchableOpacity key={tx.id} style={styles.txCard} activeOpacity={0.7}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === 'received' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 217, 255, 0.1)' }]}>
                  <Ionicons 
                    name={tx.type === 'received' ? 'arrow-down' : 'arrow-up'} 
                    size={20} 
                    color={tx.type === 'received' ? '#00FF88' : '#00D9FF'} 
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.type === 'received' ? 'Received' : 'Sent'}</Text>
                  <Text style={styles.txAddress} numberOfLines={1}>{tx.from || tx.to}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: tx.type === 'received' ? '#00FF88' : '#00D9FF' }]}>
                    {tx.type === 'received' ? '+' : '-'}{tx.amount} MTZ
                  </Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{tx.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Modal 
          visible={showSendModal} 
          transparent={true} 
          animationType="slide"
          onRequestClose={() => setShowSendModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Send MTZ</Text>
                <TouchableOpacity onPress={() => setShowSendModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={28} color="#8B92B2" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBalance}>
                <Text style={styles.modalBalanceLabel}>Available Balance</Text>
                <Text style={styles.modalBalanceAmount}>{balance.toLocaleString()} MTZ</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipient Address</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0x..."
                    placeholderTextColor="#4A5174"
                    value={recipient}
                    onChangeText={setRecipient}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      setShowSendModal(false);
                      navigation.navigate('Scanner');
                    }} 
                    style={styles.inputIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="qr-code" size={20} color="#00D9FF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0.00"
                  placeholderTextColor="#4A5174"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.modalFee}>
                <Text style={styles.feeLabel}>Network Fee</Text>
                <Text style={styles.feeAmount}>0.5 MTZ</Text>
              </View>

              <Btn title="Send Tokens" onPress={handleSend} loading={sending} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
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
  scanBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2749',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    flexGrow: 1
  },
  content: {
    padding: 24,
    paddingTop: 0
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24
  },
  actionBtn: {
    alignItems: 'center'
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  actionLabel: {
    color: '#8B92B2',
    fontSize: 12,
    fontWeight: '600'
  },
  addressCard: {
    backgroundColor: '#1E2749',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  addressLabel: {
    color: '#8B92B2',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '600'
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  address: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 12
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  txInfo: {
    flex: 1
  },
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
    marginBottom: 6
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
    marginRight: 4
  },
  statusText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '600'
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
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600'
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  modalInput: {
    flex: 1,
    backgroundColor: '#0A0E27',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1
  },
  modalFee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2A3356'
  },
  feeLabel: {
    color: '#8B92B2',
    fontSize: 14
  },
  feeAmount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700'
  }
});