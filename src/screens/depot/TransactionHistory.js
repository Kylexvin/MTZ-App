// src/screens/depot/TransactionHistory.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function TransactionHistory({ navigation }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchTransactions = async (page = 1, reset = false) => {
    try {
      if (page === 1) setLoading(true);
      if (page > 1) setRefreshing(true);

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.limit);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(
        `/depots/${user.assignedDepot}/transactions?${params.toString()}`
      );

      if (response.data.success) {
        if (reset || page === 1) {
          setTransactions(response.data.data.transactions);
        } else {
          setTransactions(prev => [...prev, ...response.data.data.transactions]);
        }
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, true);
  }, [filters]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages && !loading) {
      fetchTransactions(pagination.page + 1);
    }
  };

  const handleRefresh = () => {
    fetchTransactions(1, true);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    fetchTransactions(1, true);
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: '',
    });
    setShowFilterModal(false);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'milk_deposit': return 'water';
      case 'kcc_pickup': return 'download';
      case 'kcc_delivery': return 'arrow-up';
      default: return 'receipt';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'milk_deposit': return '#00FF88';
      case 'kcc_pickup': return '#00D9FF';
      case 'kcc_delivery': return '#FF6B6B';
      default: return '#A78BFA';
    }
  };

  const getTransactionTitle = (type) => {
    switch (type) {
      case 'milk_deposit': return 'Milk Deposit';
      case 'kcc_pickup': return 'Factory Pickup';
      case 'kcc_delivery': return 'Factory Delivery';
      default: return type.replace('_', ' ').toUpperCase();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionCard}
    >
      <View style={styles.transactionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(item.type)}20` }]}>
          <Ionicons name={getTransactionIcon(item.type)} size={20} color={getTransactionColor(item.type)} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{getTransactionTitle(item.type)}</Text>
          <Text style={styles.transactionReference}>{item.reference}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amountText,
            { color: item.tokensAmount > 0 ? '#00FF88' : '#FF6B6B' }
          ]}>
            {item.tokensAmount > 0 ? '+' : ''}{item.tokensAmount || 0} MTZ
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        {item.type === 'milk_deposit' && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Farmer:</Text>
              <Text style={styles.detailValue}>
                {item.fromUser?.name || 'Unknown'} ({item.fromUser?.phone || 'N/A'})
              </Text>
            </View>
            {item.litersRaw > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Milk:</Text>
                <Text style={styles.detailValue}>{item.litersRaw}L {item.qualityGrade || ''}</Text>
              </View>
            )}
            {item.depositCode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Deposit Code:</Text>
                <Text style={styles.codeText}>{item.depositCode}</Text>
              </View>
            )}
          </>
        )}

        {(item.type === 'kcc_pickup' || item.type === 'kcc_delivery') && (
          <>
            {item.litersRaw > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Raw Milk:</Text>
                <Text style={styles.detailValue}>{item.litersRaw}L</Text>
              </View>
            )}
            {item.litersPasteurized > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pasteurized:</Text>
                <Text style={styles.detailValue}>{item.litersPasteurized}L</Text>
              </View>
            )}
            {item.kccAttendant && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Factory Attendant:</Text>
                <Text style={styles.detailValue}>{item.kccAttendant.name}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'completed' ? 'rgba(0, 255, 136, 0.2)' : 
                         item.status === 'pending' ? 'rgba(255, 203, 0, 0.2)' : 
                         'rgba(255, 107, 107, 0.2)' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'completed' ? '#00FF88' : 
                       item.status === 'pending' ? '#FFCB00' : '#FF6B6B' }
            ]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt" size={64} color="#2A3356" />
      <Text style={styles.emptyStateTitle}>No Transactions</Text>
      <Text style={styles.emptyStateText}>
        {filters.type || filters.status 
          ? 'No transactions match your filters'
          : 'Transactions will appear here'}
      </Text>
      {(filters.type || filters.status) && (
        <TouchableOpacity 
          style={styles.clearFiltersButton}
          onPress={handleClearFilters}
        >
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Loading Transactions...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00D9FF" />
          </TouchableOpacity>
          <Text style={styles.title}>Transaction History</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={24} color="#00D9FF" />
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {(filters.type || filters.status) && (
          <View style={styles.activeFilters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filters.type && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Type: {filters.type}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, type: '' }))}>
                    <Ionicons name="close" size={14} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.status && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Status: {filters.status}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, status: '' }))}>
                    <Ionicons name="close" size={14} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            pagination.page < pagination.pages ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#00D9FF" />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
        />

        {/* Filter Modal */}
        {showFilterModal && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              onPress={() => setShowFilterModal(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Transactions</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="#8B92B2" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterForm}>
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Transaction Type</Text>
                  <View style={styles.filterOptions}>
                    {['', 'milk_deposit', 'kcc_pickup', 'kcc_delivery'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterOption,
                          filters.type === type && styles.filterOptionActive
                        ]}
                        onPress={() => setFilters(prev => ({ ...prev, type }))}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.type === type && styles.filterOptionTextActive
                        ]}>
                          {type ? getTransactionTitle(type) : 'All Types'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Status</Text>
                  <View style={styles.filterOptions}>
                    {['', 'pending', 'completed', 'failed'].map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.filterOption,
                          filters.status === status && styles.filterOptionActive
                        ]}
                        onPress={() => setFilters(prev => ({ ...prev, status }))}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.status === status && styles.filterOptionTextActive
                        ]}>
                          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Status'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButtonSecondary}
                  onPress={handleClearFilters}
                >
                  <Text style={styles.modalButtonSecondaryText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButtonPrimary}
                  onPress={handleApplyFilters}
                >
                  <LinearGradient
                    colors={['#00FF88', '#00CC6A']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Apply Filters</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilters: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A3356',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  activeFilterText: {
    color: '#8B92B2',
    fontSize: 12,
    marginRight: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  transactionCard: {
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3356',
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  transactionReference: {
    color: '#8B92B2',
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#2A3356',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#8B92B2',
    fontSize: 13,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
  codeText: {
    color: '#00D9FF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeText: {
    color: '#8B92B2',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#8B92B2',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#2A3356',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  clearFiltersText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    color: '#8B92B2',
    marginTop: 8,
    fontSize: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.9)',
  },
  modalContent: {
    backgroundColor: '#1A1F3A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3356',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  filterForm: {
    padding: 20,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#2A3356',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  filterOptionActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  filterOptionText: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#0A0E27',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A3356',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#2A3356',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  modalButtonSecondaryText: {
    color: '#8B92B2',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
}); 