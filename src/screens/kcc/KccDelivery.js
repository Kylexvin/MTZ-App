// src/screens/kcc/KccDelivery.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Btn from '../../components/Btn';

export default function KccDelivery({ navigation }) {
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScanQR = () => {
    setScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setScanning(false);
      setQrCode('DEL-123456789');
      Alert.alert('QR Scanned', 'Delivery request found. Ready to confirm delivery.');
    }, 1500);
  };

  const handleConfirmDelivery = () => {
    if (!qrCode) {
      Alert.alert('No QR Code', 'Please scan a delivery QR code first');
      return;
    }
    Alert.alert('Delivery Confirmed', 'Pasteurized milk delivered successfully!');
    setQrCode('');
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Deliver Milk</Text>
            <Text style={styles.subtitle}>Deliver pasteurized milk to depots</Text>
          </View>

          {/* QR Scanner */}
          <View style={styles.scannerSection}>
            <Text style={styles.sectionTitle}>Scan Delivery QR</Text>
            <View style={styles.scannerCard}>
              {qrCode ? (
                <View style={styles.qrScanned}>
                  <Ionicons name="checkmark-circle" size={48} color="#00FF88" />
                  <Text style={styles.qrScannedText}>QR Code Scanned</Text>
                  <Text style={styles.qrCodeValue}>{qrCode}</Text>
                  <Text style={styles.qrInstructions}>
                    Ready to confirm delivery of pasteurized milk
                  </Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.scanButton}
                  onPress={handleScanQR}
                  disabled={scanning}
                >
                  <LinearGradient
                    colors={['#00D9FF', '#0094FF']}
                    style={styles.scanButtonGradient}
                  >
                    {scanning ? (
                      <Text style={styles.scanButtonText}>Scanning...</Text>
                    ) : (
                      <>
                        <Ionicons name="qr-code" size={48} color="#FFFFFF" />
                        <Text style={styles.scanButtonText}>Tap to Scan QR Code</Text>
                        <Text style={styles.scanSubtext}>From depot attendant</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {qrCode && (
              <Btn 
                title="Confirm Delivery"
                onPress={handleConfirmDelivery}
                style={styles.confirmButton}
              />
            )}
          </View>

          {/* Pending Deliveries */}
          <View style={styles.pendingSection}>
            <Text style={styles.sectionTitle}>Pending Deliveries</Text>
            <View style={styles.pendingCard}>
              <View style={styles.deliveryItem}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.depotName}>Nakuru Central Depot</Text>
                  <Text style={styles.deliveryDetails}>150L • Expires in 25 min</Text>
                </View>
                <Text style={styles.deliveryCode}>QR: DEL-987654321</Text>
              </View>
            </View>
          </View>

          {/* Process Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Delivery Process</Text>
            <View style={styles.infoCard}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Depot attendant generates delivery QR code
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Scan QR code when delivering pasteurized milk
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Tokens are automatically transferred from depot
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
  scannerSection: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  scannerCard: { 
    backgroundColor: '#1E2749', 
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356',
    alignItems: 'center',
    marginBottom: 16
  },
  scanButton: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  scanButtonGradient: { 
    padding: 40, 
    alignItems: 'center',
    borderRadius: 16
  },
  scanButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 12,
    textAlign: 'center'
  },
  scanSubtext: { 
    color: 'rgba(255, 255, 255, 0.8)', 
    fontSize: 14, 
    marginTop: 4,
    textAlign: 'center'
  },
  qrScanned: { alignItems: 'center' },
  qrScannedText: { 
    color: '#00FF88', 
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 12,
    marginBottom: 8
  },
  qrCodeValue: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontFamily: 'monospace',
    marginBottom: 12
  },
  qrInstructions: { 
    color: '#8B92B2', 
    fontSize: 14, 
    textAlign: 'center'
  },
  confirmButton: { marginTop: 8 },
  pendingSection: { marginBottom: 24, paddingHorizontal: 20 },
  pendingCard: { 
    backgroundColor: '#1E2749', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3356' 
  },
  deliveryItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  deliveryInfo: { flex: 1 },
  depotName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  deliveryDetails: { color: '#8B92B2', fontSize: 14 },
  deliveryCode: { color: '#00D9FF', fontSize: 12, fontFamily: 'monospace' },
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