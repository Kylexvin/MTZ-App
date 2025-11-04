// src/screens/kcc/KccPickup.js
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
  const [depotId, setDepotId] = useState('');
  const [liters, setLiters] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePickup = async () => {
    if (!depotId || !liters) {
      Alert.alert('Missing Info', 'Please enter depot ID and liters');
      return;
    }

    setProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        'Pickup Recorded', 
        `Collected ${liters}L from depot ${depotId}. Please process payment.`,
        [{ text: 'OK' }]
      );
      setDepotId('');
      setLiters('');
    }, 2000);
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Collect Raw Milk</Text>
            <Text style={styles.subtitle}>Record milk collection from depots</Text>
          </View>

          {/* Pickup Form */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Depot ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter depot identification"
                  placeholderTextColor="#4A5174"
                  value={depotId}
                  onChangeText={setDepotId}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Liters Collected</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  placeholderTextColor="#4A5174"
                  value={liters}
                  onChangeText={setLiters}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHelp}>
                  Cost: {liters || 0} MTZ (1L = 1 MTZ)
                </Text>
              </View>

              <Btn 
                title={`Collect ${liters || 0}L Milk`}
                onPress={handlePickup}
                loading={processing}
                style={styles.actionButton}
              />
            </View>
          </View>

          {/* Pending Pickups */}
          <View style={styles.pendingSection}>
            <Text style={styles.sectionTitle}>Pending Payments</Text>
            <View style={styles.pendingCard}>
              <View style={styles.pendingItem}>
                <Ionicons name="time" size={20} color="#FFD700" />
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingTitle}>Depot KMB001</Text>
                  <Text style={styles.pendingDetails}>25L • 2 hours ago</Text>
                </View>
                <TouchableOpacity style={styles.payButton}>
                  <Text style={styles.payButtonText}>Pay 25 MTZ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.infoCard}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Collect raw milk from depot and record the amount
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Pay tokens to depot attendant (1 MTZ per liter)
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Milk is transferred to KCC for pasteurization
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
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#8B92B2' },
  formSection: { marginBottom: 24, paddingHorizontal: 20 },
  formCard: { 
    backgroundColor: '#1E2749', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356' 
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#8B92B2', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textInput: { 
    backgroundColor: '#2A3356', 
    borderRadius: 12, 
    padding: 16, 
    color: '#FFFFFF', 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#3A4567' 
  },
  inputHelp: { color: '#8B92B2', fontSize: 12, marginTop: 8 },
  actionButton: { marginTop: 8 },
  pendingSection: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  pendingCard: { 
    backgroundColor: '#1E2749', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356' 
  },
  pendingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  pendingInfo: { flex: 1, marginLeft: 12 },
  pendingTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pendingDetails: { color: '#8B92B2', fontSize: 14 },
  payButton: { 
    backgroundColor: '#00FF88', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  payButtonText: { color: '#0A0E27', fontSize: 12, fontWeight: '600' },
  infoSection: { marginBottom: 24, paddingHorizontal: 20 },
  infoCard: { 
    backgroundColor: '#1E2749', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356' 
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepNumber: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: '#00D9FF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12, 
    marginTop: 2 
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepText: { color: '#8B92B2', fontSize: 14, lineHeight: 20, flex: 1 },
});