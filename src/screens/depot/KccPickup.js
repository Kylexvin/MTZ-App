// src/screens/depot/KccPickup.js
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

export default function KccPickup({ navigation }) {
  const [liters, setLiters] = useState('');
  const [kccAttendant, setKccAttendant] = useState('');

  const handleRequestPickup = () => {
    if (!liters || !kccAttendant) {
      Alert.alert('Missing Info', 'Please fill all fields');
      return;
    }

    Alert.alert(
      'Pickup Requested',
      `Requested pickup of ${liters}L raw milk. Tokens will be replenished upon collection.`,
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
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
            <Text style={styles.title}>KCC Pickup</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Current Stock */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Raw Milk Stock</Text>
            <View style={styles.stockCard}>
              <Text style={styles.stockValue}>125L</Text>
              <Text style={styles.stockLabel}>Available for pickup</Text>
              <View style={styles.capacityBar}>
                <View style={[styles.capacityFill, { width: '25%' }]} />
              </View>
              <Text style={styles.capacityText}>125L / 500L capacity</Text>
            </View>
          </View>

          {/* Pickup Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Pickup</Text>
            <View style={styles.formCard}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Liters to Pickup</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  placeholderTextColor="#4A5174"
                  value={liters}
                  onChangeText={setLiters}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHelp}>
                  Available: 125L • You'll receive {liters || 0} MTZ tokens
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>KCC Attendant ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="KCC attendant identification"
                  placeholderTextColor="#4A5174"
                  value={kccAttendant}
                  onChangeText={setKccAttendant}
                />
              </View>

              <View style={styles.pickupInfo}>
                <Ionicons name="information-circle" size={20} color="#00D9FF" />
                <Text style={styles.pickupInfoText}>
                  Tokens will be replenished to your wallet immediately after KCC collects the milk
                </Text>
              </View>

              <Btn 
                title={`Request Pickup of ${liters || 0}L`}
                onPress={handleRequestPickup}
                style={styles.actionButton}
              />
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsCard}>
              <View style={styles.benefitItem}>
                <Ionicons name="refresh" size={24} color="#00D9FF" />
                <Text style={styles.benefitTitle}>Token Replenishment</Text>
                <Text style={styles.benefitText}>
                  Get 1 MTZ token per liter picked up
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={24} color="#00FF88" />
                <Text style={styles.benefitTitle}>Quality Assurance</Text>
                <Text style={styles.benefitText}>
                  KCC ensures proper pasteurization
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="rocket" size={24} color="#A78BFA" />
                <Text style={styles.benefitTitle}>Efficient Process</Text>
                <Text style={styles.benefitText}>
                  Quick pickup and token transfer
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
  stockCard: { 
    backgroundColor: '#1E2749', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356',
    alignItems: 'center'
  },
  stockValue: { color: '#00D9FF', fontSize: 32, fontWeight: '700', marginBottom: 8 },
  stockLabel: { color: '#8B92B2', fontSize: 16, marginBottom: 12 },
  capacityBar: { width: '100%', height: 6, backgroundColor: '#2A3356', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  capacityFill: { height: '100%', backgroundColor: '#00D9FF', borderRadius: 3 },
  capacityText: { color: '#8B92B2', fontSize: 14 },
  formCard: { backgroundColor: '#1E2749', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A3356' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#8B92B2', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textInput: { backgroundColor: '#2A3356', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#3A4567' },
  inputHelp: { color: '#8B92B2', fontSize: 12, marginTop: 8 },
  pickupInfo: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: 'rgba(0, 217, 255, 0.1)', 
    padding: 16, 
    borderRadius: 12, 
    borderLeftWidth: 4, 
    borderLeftColor: '#00D9FF',
    marginBottom: 20
  },
  pickupInfoText: { color: '#8B92B2', fontSize: 14, lineHeight: 20, marginLeft: 12, flex: 1 },
  actionButton: { marginTop: 8 },
  benefitsCard: { backgroundColor: '#1E2749', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A3356' },
  benefitItem: { alignItems: 'center', marginBottom: 24 },
  benefitTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  benefitText: { color: '#8B92B2', fontSize: 14, textAlign: 'center' },
});