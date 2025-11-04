import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function TokenBalanceCard({ onRefresh }) {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/wallet/balance');
      if (response.data.success) {
        setWalletData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleRefresh = () => {
    fetchBalance();
    if (onRefresh) onRefresh();
  };

  // Show loading state
  if (!walletData) {
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={['#0A1F2E', '#1A2F45', '#0A1F2E']} 
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.loadingContainer}>
            <Ionicons name="water" size={32} color="rgba(0, 217, 255, 0.5)" />
            <Text style={styles.loadingText}>Loading balance...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Glow Effects */}
      <View style={styles.outerGlow} />
      <View style={styles.innerGlow} />
      
      {/* Main Card */}
      <LinearGradient 
        colors={['#0A1F2E', '#1A2F45', '#0A1F2E']} 
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Grid Pattern using Views */}
        <View style={styles.gridOverlay}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.gridLine, styles.gridHorizontal, { top: `${(i + 1) * 16}%` }]} />
          ))}
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.gridLine, styles.gridVertical, { left: `${(i + 1) * 16}%` }]} />
          ))}
        </View>

        {/* Agricultural Icon using Ionicons and custom shapes */}
        <View style={styles.agroIcon}>
          {/* Milk Drop */}
          <View style={styles.milkDrop}>
            <Ionicons name="water" size={24} color="rgba(0, 217, 255, 0.8)" />
          </View>
          {/* Blockchain Nodes */}
          <View style={styles.blockchainNodes}>
            <View style={[styles.node, styles.node1]} />
            <View style={[styles.node, styles.node2]} />
            <View style={[styles.node, styles.node3]} />
            <View style={[styles.connection, styles.conn1]} />
            <View style={[styles.connection, styles.conn2]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.label}>MILKCHAIN BALANCE</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{walletData.currency}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn} disabled={loading}>
            <Ionicons name="refresh" size={18} color="#00D9FF" />
            <View style={styles.pulseRing} />
          </TouchableOpacity>
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>
            {parseFloat(walletData.balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Text>
          <View style={styles.currencyGlow}>
            <Ionicons name="flash" size={16} color="#00FF88" />
            <Text style={styles.currency}>{walletData.currency} TOKENS</Text>
            <Ionicons name="flash" size={16} color="#00FF88" />
          </View>
        </View>

        {/* Value in KES */}
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>
            ≈ {walletData.valueInKES.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} {walletData.currencySymbol}
          </Text>
          <Text style={styles.rateText}>
            Rate: 1 {walletData.currency} = {walletData.universalPrice} {walletData.currencySymbol}
          </Text>
        </View>

        {/* Network Status */}
        <View style={styles.networkStatus}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, styles.connected]} />
            <Text style={styles.statusText}>BLOCKCHAIN SYNCED</Text>
          </View>
          <View style={styles.networkInfo}>
            <Ionicons name="leaf" size={12} color="#00FF88" />
            <Text style={styles.networkText}>AGRO-NETWORK</Text>
          </View>
        </View>

        {/* Scanning Animation Line */}
        <View style={styles.scanLine} />

        {/* Corner Accents */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Floating Particles */}
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 24,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    overflow: 'hidden',
    backgroundColor: '#0A1F2E',
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8B92B2',
    marginTop: 8,
    fontSize: 14,
  },
  outerGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderRadius: 30,
    zIndex: -1,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 20,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
  },
  gridHorizontal: {
    height: 1,
    left: 0,
    right: 0,
  },
  gridVertical: {
    width: 1,
    top: 0,
    bottom: 0,
  },
  agroIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'center',
  },
  milkDrop: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  blockchainNodes: {
    position: 'relative',
    marginTop: 10,
    width: 60,
    height: 40,
  },
  node: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D9FF',
  },
  node1: { top: 0, left: 10 },
  node2: { top: 15, right: 10 },
  node3: { bottom: 0, left: 25 },
  connection: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 217, 255, 0.3)',
    height: 1,
    transform: [{ rotate: '45deg' }],
  },
  conn1: { top: 8, left: 15, width: 20 },
  conn2: { top: 23, left: 20, width: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#8B92B2',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.5)',
  },
  badgeText: {
    color: '#00D9FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    opacity: 0.5,
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balance: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 217, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  currencyGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currency: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 255, 136, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  valueContainer: {
    marginBottom: 16,
  },
  valueText: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  rateText: {
    color: '#8B92B2',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  networkStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 217, 255, 0.2)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  statusText: {
    color: '#8B92B2',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  networkText: {
    color: 'rgba(0, 217, 255, 0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 217, 255, 0.5)',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 1,
    top: '50%',
    transform: [{ translateY: -1 }],
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: 'rgba(0, 217, 255, 0.5)',
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 4,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 217, 255, 0.4)',
  },
  particle1: { top: 30, left: 30 },
  particle2: { bottom: 40, right: 40 },
  particle3: { top: 60, right: 60 },
});