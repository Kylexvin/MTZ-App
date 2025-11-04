// src/screens/depot/FarmerLookup.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Btn from '../../components/Btn';

export default function FarmerLookup({ navigation }) {
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [farmer, setFarmer] = useState(null);

  // Dummy farmer data
  const dummyFarmer = {
    id: '123',
    name: 'John Kamau',
    phone: '254712345678',
    county: 'Nakuru',
    status: 'active',
    totalDeposits: 1250,
    lastDeposit: '2 days ago'
  };

  const handleSearch = () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setSearching(false);
      if (phone === '254712345678') {
        setFarmer(dummyFarmer);
      } else {
        Alert.alert('Not Found', 'No farmer found with this phone number');
        setFarmer(null);
      }
    }, 1500);
  };

  const handleReceiveMilk = () => {
    if (farmer) {
      navigation.navigate('Operations', { 
        screen: 'ReceiveMilk',
        params: { farmer }
      });
    }
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#00D9FF" />
            </TouchableOpacity>
            <Text style={styles.title}>Find Farmer</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search by Phone</Text>
            <View style={styles.searchCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="254712345678"
                  placeholderTextColor="#4A5174"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <Btn 
                title={searching ? "Searching..." : "Search Farmer"}
                onPress={handleSearch}
                loading={searching}
                style={styles.searchButton}
              />
            </View>
          </View>

          {/* Results */}
          {farmer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer Found</Text>
              <View style={styles.farmerCard}>
                
                <View style={styles.farmerHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {farmer.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.farmerInfo}>
                    <Text style={styles.farmerName}>{farmer.name}</Text>
                    <Text style={styles.farmerPhone}>{farmer.phone}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: farmer.status === 'active' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 107, 107, 0.2)' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: farmer.status === 'active' ? '#00FF88' : '#FF6B6B' }
                    ]}>
                      {farmer.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.farmerDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="#8B92B2" />
                    <Text style={styles.detailLabel}>County:</Text>
                    <Text style={styles.detailValue}>{farmer.county}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="water" size={16} color="#8B92B2" />
                    <Text style={styles.detailLabel}>Total Deposits:</Text>
                    <Text style={styles.detailValue}>{farmer.totalDeposits}L</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#8B92B2" />
                    <Text style={styles.detailLabel}>Last Deposit:</Text>
                    <Text style={styles.detailValue}>{farmer.lastDeposit}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.primaryAction}
                    onPress={handleReceiveMilk}
                  >
                    <LinearGradient
                      colors={['#00D9FF', '#0094FF']}
                      style={styles.primaryActionGradient}
                    >
                      <Ionicons name="water" size={20} color="#FFF" />
                      <Text style={styles.primaryActionText}>Receive Milk</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.secondaryAction}
                    onPress={() => {/* View history */}}
                  >
                    <Ionicons name="list" size={20} color="#00D9FF" />
                    <Text style={styles.secondaryActionText}>History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Quick Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tips</Text>
            <View style={styles.tipsCard}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                <Text style={styles.tipText}>
                  Always verify farmer phone number matches registered account
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                <Text style={styles.tipText}>
                  Check lactometer reading for quality grading
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                <Text style={styles.tipText}>
                  Record deposits immediately to maintain accurate records
                </Text>
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
  scrollView: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 24,
  },
  backButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  placeholder: { width: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  searchCard: { backgroundColor: '#1E2749', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A3356' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#8B92B2', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textInput: { backgroundColor: '#2A3356', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#3A4567' },
  searchButton: { marginTop: 8 },
  farmerCard: { backgroundColor: '#1E2749', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A3356' },
  farmerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#00D9FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  farmerInfo: { flex: 1 },
  farmerName: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  farmerPhone: { color: '#8B92B2', fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  farmerDetails: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailLabel: { color: '#8B92B2', fontSize: 14, marginLeft: 8, marginRight: 4, fontWeight: '500' },
  detailValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  primaryAction: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  primaryActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8 },
  primaryActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 217, 255, 0.1)', paddingVertical: 12, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(0, 217, 255, 0.3)' },
  secondaryActionText: { color: '#00D9FF', fontSize: 16, fontWeight: '600' },
  tipsCard: { backgroundColor: '#1E2749', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A3356' },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  tipText: { color: '#8B92B2', fontSize: 14, lineHeight: 20, marginLeft: 8, flex: 1 },
});