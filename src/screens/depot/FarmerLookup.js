// src/screens/depot/FarmerLookup.js
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
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function FarmerLookup({ navigation }) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [farmer, setFarmer] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter farmer phone number');
      return;
    }

    // Validate phone format
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Invalid Format', 'Phone must be 254XXXXXXXXX (12 digits)');
      return;
    }

    try {
      setSearching(true);
      setError('');
      Keyboard.dismiss();

      const response = await axios.get(`/depots/farmer/lookup?phone=${phone}`);

      if (response.data.success) {
        setFarmer(response.data.data.farmer);
      } else {
        setError('Farmer not found');
        setFarmer(null);
      }
    } catch (error) {
      console.error('Farmer lookup error:', error);
      setError(error.response?.data?.message || 'Failed to find farmer');
      setFarmer(null);
    } finally {
      setSearching(false);
    }
  };

  const handleContinue = () => {
    if (!farmer) {
      Alert.alert('Error', 'Please find a farmer first');
      return;
    }

    if (farmer.status !== 'active') {
      Alert.alert('Account Issue', `Farmer account is ${farmer.status}. Please contact support.`);
      return;
    }

    // Navigate to ReceiveMilk screen with farmer details
    navigation.navigate('ReceiveMilk', {
      farmer: {
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        county: farmer.county,
      }
    });
  };

  const handleClear = () => {
    setPhone('');
    setFarmer(null);
    setError('');
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#00D9FF" />
            </TouchableOpacity>
            <Text style={styles.title}>Find Farmer</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.subtitle}>Look up farmer by phone number to start milk deposit</Text>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>Enter Phone Number</Text>
            
            <View style={styles.searchCard}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="call" size={20} color="#00D9FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="254712345678"
                  placeholderTextColor="#4A5174"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoFocus={true}
                  maxLength={12}
                  editable={!searching}
                />
                {phone.length > 0 && (
                  <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color="#8B92B2" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity 
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={searching}
              >
                <LinearGradient
                  colors={['#00D9FF', '#0094FF']}
                  style={styles.searchButtonGradient}
                >
                  {searching ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="search" size={20} color="#FFF" />
                      <Text style={styles.searchButtonText}>Search Farmer</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.phoneFormat}>Format: 254XXXXXXXXX (12 digits)</Text>
          </View>

          {/* Results Section */}
          {searching ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#00D9FF" />
              <Text style={styles.loadingText}>Searching for farmer...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorTitle}>Farmer Not Found</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorHelp}>
                Please check the phone number and try again
              </Text>
            </View>
          ) : farmer ? (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Farmer Found</Text>
              
              <View style={styles.farmerCard}>
                <View style={styles.farmerHeader}>
                  <View style={styles.farmerAvatar}>
                    <Ionicons name="person" size={24} color="#00D9FF" />
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
                      {farmer.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.farmerDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="location" size={16} color="#8B92B2" />
                    <Text style={styles.detailLabel}>County:</Text>
                    <Text style={styles.detailValue}>{farmer.county || 'Not specified'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#8B92B2" />
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[styles.detailValue, styles.statusActive]}>
                      {farmer.status === 'active' ? 'Active Account' : 'Account Inactive'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={handleContinue}
                  disabled={farmer.status !== 'active'}
                >
                  <LinearGradient
                    colors={farmer.status === 'active' ? ['#00FF88', '#00CC6A'] : ['#8B92B2', '#4A5174']}
                    style={styles.continueButtonGradient}
                  >
                    <Ionicons name="water" size={20} color="#FFF" />
                    <Text style={styles.continueButtonText}>
                      {farmer.status === 'active' ? 'Continue to Milk Deposit' : 'Account Not Active'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {farmer.status !== 'active' && (
                  <Text style={styles.inactiveWarning}>
                    This farmer's account is not active. Please contact support.
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.placeholderCard}>
              <Ionicons name="people" size={64} color="#2A3356" />
              <Text style={styles.placeholderTitle}>Find Farmer</Text>
              <Text style={styles.placeholderText}>
                Enter a phone number to look up farmer details and start milk deposit process
              </Text>
            </View>
          )}

          {/* Quick Help */}
          <View style={styles.helpSection}>
            <Ionicons name="help-circle" size={16} color="#00D9FF" />
            <Text style={styles.helpText}>
              Need help? Ensure the phone number is registered in the MilkChain system
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
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B92B2',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchCard: {
    backgroundColor: '#1E2749',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A3356',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  inputIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneFormat: {
    color: '#8B92B2',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingCard: {
    backgroundColor: '#1E2749',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: '#00D9FF',
    fontSize: 16,
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: '#1E2749',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#8B92B2',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHelp: {
    color: '#8B92B2',
    fontSize: 12,
    textAlign: 'center',
  },
  resultsSection: {
    marginBottom: 24,
  },
  farmerCard: {
    backgroundColor: '#1E2749',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  farmerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 4,
  },
  farmerPhone: {
    color: '#8B92B2',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A3356',
    marginVertical: 16,
  },
  farmerDetails: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 4,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusActive: {
    color: '#00FF88',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  continueButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  inactiveWarning: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  placeholderCard: {
    backgroundColor: '#1E2749',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderTitle: {
    color: '#8B92B2',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#8B92B2',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    marginBottom: 40,
  },
  helpText: {
    color: '#8B92B2',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});