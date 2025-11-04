// src/screens/depot/KccDeliveryQR.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../context/AuthContext';
import Btn from '../../components/Btn';

// QR Code Display component
const QRCodeDisplay = ({ value, size = 220 }) => {
  return (
    <View style={[styles.qrCodeContainer, { width: size, height: size }]}>
      <View style={styles.qrCodeGrid}>
        {/* QR code corners */}
        <View style={[styles.qrCorner, styles.qrCornerTL]} />
        <View style={[styles.qrCorner, styles.qrCornerTR]} />
        <View style={[styles.qrCorner, styles.qrCornerBL]} />
        
        {/* QR content */}
        <View style={styles.qrContent}>
          <Text style={styles.qrTitle}>QR CODE</Text>
          <Text style={styles.qrSubtitle}>KCC Delivery</Text>
          <Text style={styles.qrValue}>
            {value.substring(0, 8)}...
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function KccDeliveryQR({ navigation, route }) {
  const { user } = useAuth();
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState('');

  // Generate QR data for KCC delivery
  const generateDeliveryQR = async () => {
    try {
      setLoading(true);
      
      const qrData = {
        type: 'kcc_delivery_request',
        depotId: user.assignedDepot,
        depotName: user.name,
        attendantId: user.id,
        timestamp: new Date().toISOString(),
        requestId: `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      const qrString = JSON.stringify(qrData);
      setQrValue(qrString);
      setDeliveryData(qrData);

    } catch (error) {
      console.error('QR generation error:', error);
      Alert.alert('Error', 'Failed to generate delivery QR code');
    } finally {
      setLoading(false);
    }
  };

  // Share delivery request
  const shareDeliveryRequest = async () => {
    try {
      const shareData = {
        message: `MilkChain Depot Delivery Request\n\nDepot: ${user.name}\nRequest ID: ${deliveryData.requestId}\nTime: ${new Date().toLocaleString()}\n\nPlease use this code when delivering pasteurized milk.`,
        title: 'KCC Delivery Request'
      };

      const result = await Share.share(shareData);
      
      if (result.action === Share.sharedAction) {
        console.log('Delivery request shared successfully');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Copy delivery code to clipboard
  const copyDeliveryCode = async () => {
    try {
      await Clipboard.setStringAsync(deliveryData.requestId);
      Alert.alert('Copied!', 'Delivery code copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  useEffect(() => {
    generateDeliveryQR();
  }, []);

  return (
    <LinearGradient
      colors={['#0A0E27', '#1A1F3A', '#0A0E27']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#00D9FF" />
            </TouchableOpacity>
            <Text style={styles.title}>KCC Delivery QR</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={24} color="#00D9FF" />
            <Text style={styles.instructionsTitle}>How to Use</Text>
            <Text style={styles.instructionsText}>
              Present this QR code to the KCC attendant when they deliver pasteurized milk. 
              They will scan it to initiate the delivery process.
            </Text>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Delivery QR Code</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="qr-code" size={48} color="#8B92B2" />
                <Text style={styles.loadingText}>Generating QR Code...</Text>
              </View>
            ) : qrValue ? (
              <View style={styles.qrContainer}>
                <View style={styles.qrCard}>
                  <QRCodeDisplay value={qrValue} size={220} />
                  
                  {/* QR Details */}
                  <View style={styles.qrDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="business" size={16} color="#8B92B2" />
                      <Text style={styles.detailLabel}>Depot:</Text>
                      <Text style={styles.detailValue}>{user.name}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="key" size={16} color="#8B92B2" />
                      <Text style={styles.detailLabel}>Delivery Code:</Text>
                      <Text style={styles.detailValue}>
                        {deliveryData?.requestId}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color="#8B92B2" />
                      <Text style={styles.detailLabel}>Generated:</Text>
                      <Text style={styles.detailValue}>
                        {new Date().toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Validity Indicator */}
                <View style={styles.validityIndicator}>
                  <View style={[styles.statusDot, styles.statusActive]} />
                  <Text style={styles.validityText}>Valid for 1 hour</Text>
                </View>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={48} color="#FF6B6B" />
                <Text style={styles.errorText}>Failed to generate QR code</Text>
                <Btn 
                  title="Try Again" 
                  onPress={generateDeliveryQR}
                  style={styles.retryButton}
                />
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {qrValue && (
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Actions</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={shareDeliveryRequest}
                >
                  <LinearGradient
                    colors={['#00D9FF', '#0094FF']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="share-social" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Share Request</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={copyDeliveryCode}
                >
                  <LinearGradient
                    colors={['#4ECDC4', '#00B894']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="copy" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Copy Code</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={generateDeliveryQR}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF4757']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Regenerate</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Delivery Process Info */}
          <View style={styles.processSection}>
            <Text style={styles.sectionTitle}>Delivery Process</Text>
            
            <View style={styles.processSteps}>
              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Generate and present QR code to KCC attendant
                </Text>
              </View>

              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  KCC attendant scans QR code with their app
                </Text>
              </View>

              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Enter delivery details and confirm transaction
                </Text>
              </View>

              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>
                  Tokens are transferred and milk is received
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Deliveries (Placeholder) */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Deliveries</Text>
            <View style={styles.placeholderCard}>
              <Ionicons name="time-outline" size={32} color="#8B92B2" />
              <Text style={styles.placeholderText}>
                No recent deliveries found
              </Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A0E27',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  instructionsCard: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00D9FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionsTitle: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    marginBottom: 4,
  },
  instructionsText: {
    color: '#8B92B2',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  qrSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#8B92B2',
    marginTop: 12,
    fontSize: 16,
  },
  qrContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrCard: {
    backgroundColor: '#1E2749',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A3356',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  // QR Code Display Styles
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeGrid: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#000000',
  },
  qrCornerTL: {
    top: 8,
    left: 8,
    borderTopLeftRadius: 4,
  },
  qrCornerTR: {
    top: 8,
    right: 8,
    borderTopRightRadius: 4,
  },
  qrCornerBL: {
    bottom: 8,
    left: 8,
    borderBottomLeftRadius: 4,
  },
  qrContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  qrValue: {
    fontSize: 10,
    color: '#000000',
    fontFamily: 'monospace',
  },
  qrDetails: {
    marginTop: 20,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '500',
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  validityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#00FF88',
  },
  validityText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  processSection: {
    marginBottom: 24,
  },
  processSteps: {
    paddingHorizontal: 20,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    color: '#8B92B2',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  recentSection: {
    marginBottom: 24,
  },
  placeholderCard: {
    backgroundColor: '#1E2749',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  placeholderText: {
    color: '#8B92B2',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});