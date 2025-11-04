import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Btn from '../../components/Btn';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentVerificationScreen({ route, navigation }) {
  console.log('🔄 PaymentVerificationScreen mounted!');
  
  const { user, onboardingFee } = route?.params || {};
  
  if (!user) {
    return (
      <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Unable to Load</Text>
            <Text style={styles.errorText}>Please return to login and try again</Text>
            <Btn 
              title="Back to Login" 
              onPress={() => navigation.navigate('Login')}
              variant="secondary"
              style={styles.backBtn}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleVerifyPayment = async () => {
    if (!mpesaCode) {
      Alert.alert('Required', 'Please enter your M-Pesa transaction code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.100.6:5000/api/auth/verify-payment-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: user.phone,
          mpesaCode: mpesaCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear pending user flag
        await AsyncStorage.removeItem('pendingUser');
        
        Alert.alert('Success', 'Payment verified! Your account is now active.', [
          { text: 'Continue', onPress: () => navigation.replace('Main') }
        ]);
      } else {
        Alert.alert('Verification Failed', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="chevron-back" size={24} color="#8B92B2" />
            </TouchableOpacity>
            <Text style={styles.title}>Complete Payment</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            
            {/* Amount Card */}
            <View style={styles.amountCard}>
              <Ionicons name="card-outline" size={32} color="#00D9FF" />
              <Text style={styles.amountLabel}>Onboarding Fee</Text>
              <Text style={styles.amount}>KSH {onboardingFee}</Text>
            </View>

            {/* Instructions Section */}
            <View style={styles.instructionsSection}>
              <View style={styles.instructionsHeader}>
                <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                <TouchableOpacity 
                  onPress={() => setShowInstructions(!showInstructions)}
                  style={styles.toggleButton}
                >
                  <Ionicons 
                    name={showInstructions ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#00D9FF" 
                  />
                </TouchableOpacity>
              </View>

              {showInstructions && (
                <View style={styles.instructions}>
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>1</Text>
                    </View>
                    <Text style={styles.instructionText}>Go to M-Pesa</Text>
                  </View>
                  
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>2</Text>
                    </View>
                    <Text style={styles.instructionText}>Select "Lipa Na M-Pesa"</Text>
                  </View>
                  
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>3</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      Paybill: <Text style={styles.highlight}>247247</Text>
                    </Text>
                  </View>
                  
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>4</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      Account: <Text style={styles.highlight}>{user.phone}</Text>
                    </Text>
                  </View>
                  
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>5</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      Amount: <Text style={styles.highlight}>KSH {onboardingFee}</Text>
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>M-Pesa Transaction Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter code from SMS"
                placeholderTextColor="#4A5174"
                value={mpesaCode}
                onChangeText={setMpesaCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Action Button */}
            <Btn 
              title="Verify Payment" 
              onPress={handleVerifyPayment} 
              loading={loading}
              style={styles.verifyBtn}
            />

            {/* Help Text */}
            <Text style={styles.helpText}>
              Enter the transaction code from your M-Pesa confirmation SMS
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  safe: { 
    flex: 1 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#8B92B2',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  mainContent: {
    flex: 1,
  },
  amountCard: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    marginBottom: 24,
  },
  amountLabel: {
    color: '#8B92B2',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00D9FF',
  },
  instructionsSection: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1A223F',
  },
  instructionsTitle: {
    color: '#00D9FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 4,
  },
  instructions: {
    padding: 20,
    paddingTop: 0,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructionNumberText: {
    color: '#0A0E27',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    color: '#8B92B2',
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  highlight: {
    color: '#FFF',
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E2749',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A3356',
  },
  verifyBtn: {
    marginBottom: 16,
  },
  helpText: {
    color: '#4A5174',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  backBtn: {
    marginTop: 16,
  },
});