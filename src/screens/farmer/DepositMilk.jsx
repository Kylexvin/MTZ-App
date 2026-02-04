import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Btn from '../../components/Btn';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

export default function DepositMilk({ navigation }) {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState({
    pending: { count: 0, liters: 0, tokens: 0 },
    completed: { count: 0, liters: 0, tokens: 0 },
    failed: { count: 0, liters: 0, tokens: 0 },
    cancelled: { count: 0, liters: 0, tokens: 0 },
    total: { count: 0, liters: 0, tokens: 0 }
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed', 'failed'

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/farmers/deposits');
      
      if (response.data.success) {
        setDeposits(response.data.data.deposits);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
      Alert.alert('Error', 'Could not load deposit history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeposits();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDeposits();
    }, [])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#00FF88';
      case 'pending': return '#FFA500';
      case 'failed': return '#FF6B6B';
      case 'cancelled': return '#8B92B2';
      default: return '#8B92B2';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'failed': return 'close-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const handleCollectTokens = async (depositId) => {
    try {
      Alert.alert(
        'Collect Tokens',
        'Visit the depot counter with your deposit code to collect your tokens. Show the attendant your deposit details.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Collection error:', error);
    }
  };

  const openDepositDetail = (deposit) => {
    setSelectedDeposit(deposit);
    setShowDetailModal(true);
  };

  const filteredDeposits = deposits.filter(deposit => {
    if (filter === 'all') return true;
    return deposit.status === filter;
  });

  const renderStatusBadge = (status, description) => {
    return (
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
        <Ionicons name={getStatusIcon(status)} size={14} color={getStatusColor(status)} />
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
          {description || status}
        </Text>
      </View>
    );
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
            <Text style={styles.headerTitle}>Milk Deposits</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={styles.summaryValue}>{summary.pending.count}</Text>
                <Text style={styles.summarySubtext}>{summary.pending.liters}L</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Completed</Text>
                <Text style={styles.summaryValue}>{summary.completed.count}</Text>
                <Text style={styles.summarySubtext}>{summary.completed.tokens} MTZ</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>{summary.total.count}</Text>
                <Text style={styles.summarySubtext}>{summary.total.liters}L</Text>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#00D9FF" />
              <Text style={styles.infoText}>
                Bring your milk to any depot. The attendant will record your deposit and issue a deposit code.
                Return to the counter later to collect your tokens.
              </Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
              {['all', 'pending', 'completed', 'failed'].map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  style={[styles.filterTab, filter === filterType && styles.filterTabActive]}
                  onPress={() => setFilter(filterType)}
                >
                  <Text style={[styles.filterText, filter === filterType && styles.filterTextActive]}>
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deposits List */}
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? 'All Deposits' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Deposits`}
              {filteredDeposits.length > 0 && ` (${filteredDeposits.length})`}
            </Text>

            {loading && filteredDeposits.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading deposits...</Text>
              </View>
            ) : filteredDeposits.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="water-outline" size={48} color="#4A5174" />
                <Text style={styles.emptyStateTitle}>No deposits found</Text>
                <Text style={styles.emptyStateText}>
                  {filter === 'all' 
                    ? "You haven't made any milk deposits yet"
                    : `No ${filter} deposits found`}
                </Text>
              </View>
            ) : (
              filteredDeposits.map((deposit) => (
                <TouchableOpacity 
                  key={deposit.depositId} 
                  style={styles.depositCard}
                  onPress={() => openDepositDetail(deposit)}
                  activeOpacity={0.7}
                >
                  <View style={styles.depositHeader}>
                    <View style={styles.depotInfo}>
                      <Ionicons name="business-outline" size={16} color="#00D9FF" />
                      <Text style={styles.depotName}>{deposit.depot.name}</Text>
                    </View>
                    {renderStatusBadge(deposit.status, deposit.statusDescription)}
                  </View>
                  
                  <View style={styles.depositDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={styles.detailValue}>{deposit.liters}L</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quality:</Text>
                      <Text style={[styles.detailValue, { color: deposit.quality === 'premium' ? '#FFD700' : '#00D9FF' }]}>
                        {deposit.qualityDescription}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Deposit Code:</Text>
                      <Text style={styles.detailValue}>
                        {deposit.depositCode || deposit.shortCode || deposit.reference}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Time:</Text>
                      <Text style={styles.detailValue}>{formatTimeAgo(deposit.depositTime)}</Text>
                    </View>
                    
                    {deposit.tokensReceived > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tokens Received:</Text>
                        <Text style={[styles.detailValue, { color: '#00FF88' }]}>
                          +{deposit.tokensReceived} MTZ
                        </Text>
                      </View>
                    )}
                    
                    {deposit.tokensExpected > 0 && deposit.tokensReceived === 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tokens Expected:</Text>
                        <Text style={[styles.detailValue, { color: '#FFA500' }]}>
                          {deposit.tokensExpected} MTZ
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {deposit.canCollectPayment && deposit.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.collectButton}
                      onPress={() => handleCollectTokens(deposit.depositId)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient colors={['#00D9FF', '#0094FF']} style={styles.collectGradient}>
                        <Ionicons name="cash-outline" size={18} color="#FFF" />
                        <Text style={styles.collectButtonText}>Collect Tokens</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Deposit Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Deposit Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={28} color="#8B92B2" />
              </TouchableOpacity>
            </View>
            
            {selectedDeposit && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Transaction</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reference:</Text>
                    <Text style={styles.detailValue}>{selectedDeposit.reference}</Text>
                  </View>
                  {selectedDeposit.depositCode && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Deposit Code:</Text>
                      <Text style={[styles.detailValue, styles.codeText]}>{selectedDeposit.depositCode}</Text>
                    </View>
                  )}
                  {selectedDeposit.shortCode && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Short Code:</Text>
                      <Text style={[styles.detailValue, styles.codeText]}>{selectedDeposit.shortCode}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    {renderStatusBadge(selectedDeposit.status, selectedDeposit.statusDescription)}
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Deposit Time:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedDeposit.depositTime)}</Text>
                  </View>
                  {selectedDeposit.paymentTime && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Time:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedDeposit.paymentTime)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Milk Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Liters:</Text>
                    <Text style={[styles.detailValue, styles.highlightValue]}>{selectedDeposit.liters}L</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quality:</Text>
                    <Text style={[styles.detailValue, { color: selectedDeposit.quality === 'premium' ? '#FFD700' : '#00D9FF' }]}>
                      {selectedDeposit.qualityDescription}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Lactometer:</Text>
                    <Text style={styles.detailValue}>{selectedDeposit.lactometerReading}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Payment Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tokens Expected:</Text>
                    <Text style={[styles.detailValue, { color: '#FFA500' }]}>
                      {selectedDeposit.tokensExpected} MTZ
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tokens Received:</Text>
                    <Text style={[styles.detailValue, { color: '#00FF88' }]}>
                      {selectedDeposit.tokensReceived} MTZ
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Depot Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Depot:</Text>
                    <Text style={styles.detailValue}>{selectedDeposit.depot.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Code:</Text>
                    <Text style={styles.detailValue}>{selectedDeposit.depot.code}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>
                      {selectedDeposit.depot.location.village}, {selectedDeposit.depot.location.subcounty}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Attendant</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedDeposit.recordedBy.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedDeposit.recordedBy.phone}</Text>
                  </View>
                </View>

                {selectedDeposit.nextStep && (
                  <View style={styles.nextStepBox}>
                    <Ionicons name="arrow-forward-circle-outline" size={20} color="#00D9FF" />
                    <Text style={styles.nextStepText}>{selectedDeposit.nextStep}</Text>
                  </View>
                )}

                {selectedDeposit.canCollectPayment && selectedDeposit.status === 'pending' && (
                  <Btn
                    title="Collect Tokens Now"
                    onPress={() => {
                      setShowDetailModal(false);
                      handleCollectTokens(selectedDeposit.depositId);
                    }}
                    style={styles.collectBtn}
                  />
                )}

                <TouchableOpacity
                  style={styles.closeDetailButton}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Text style={styles.closeDetailButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  summaryCard: {
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4
  },
  summaryLabel: {
    color: '#8B92B2',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600'
  },
  summaryValue: {
    color: '#00D9FF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4
  },
  summarySubtext: {
    color: '#8B92B2',
    fontSize: 11
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E2749',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  filterTabActive: {
    backgroundColor: '#0A0E27'
  },
  filterText: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600'
  },
  filterTextActive: {
    color: '#00D9FF'
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16
  },
  depositCard: {
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  depositHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  depotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  depotName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  depositDetails: {
    gap: 6
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    color: '#8B92B2',
    fontSize: 14
  },
  detailValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  },
  collectButton: {
    marginTop: 12
  },
  collectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  collectButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  loadingText: {
    color: '#8B92B2',
    fontSize: 16
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyStateTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4
  },
  emptyStateText: {
    color: '#8B92B2',
    fontSize: 14,
    textAlign: 'center'
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
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3356'
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800'
  },
  detailSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3356'
  },
  detailSectionTitle: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 16,
    letterSpacing: 1
  },
  highlightValue: {
    fontSize: 18,
    color: '#00D9FF',
    fontWeight: '800'
  },
  nextStepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 16,
    margin: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    gap: 12
  },
  nextStepText: {
    color: '#00D9FF',
    fontSize: 14,
    flex: 1,
    lineHeight: 20
  },
  collectBtn: {
    marginHorizontal: 24,
    marginBottom: 16
  },
  closeDetailButton: {
    alignItems: 'center',
    padding: 24
  },
  closeDetailButtonText: {
    color: '#8B92B2',
    fontSize: 16,
    fontWeight: '600'
  }
});