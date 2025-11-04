import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Btn from '../../components/Btn';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api'; // Add this import

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    pin: '',
    county: '',
    role: 'farmer'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.pin) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!/^\d{4,6}$/.test(formData.pin)) {
      Alert.alert('Error', 'PIN must be 4-6 digits');
      return;
    }

    // Format phone to 254 format
    let formattedPhone = formData.phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    setLoading(true);
    try {
      // Use API service instead of hardcoded fetch
      const data = await api.register({
        name: formData.name,
        phone: formattedPhone,
        email: formData.email,
        password: formData.password,
        pin: formData.pin,
        role: 'farmer',
        county: formData.county
      });

      if (data.success) {
        if (data.data.paymentRequired) {
          // Redirect to payment verification
          Alert.alert('Registration Successful', data.message, [
            { 
              text: 'Complete Payment', 
              onPress: () => navigation.navigate('PaymentVerification', { 
                user: data.data.user,
                onboardingFee: data.data.onboardingFee 
              }) 
            }
          ]);
        } else {
          // No payment required
          Alert.alert('Registration Successful', data.message, [
            { text: 'Login', onPress: () => navigation.navigate('Login') }
          ]);
        }
      } else {
        Alert.alert('Registration Failed', data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openWebRegistration = () => {
    Linking.openURL('https://your-milkchain-website.com/register-depot');
  };

  return (
    <LinearGradient 
      colors={['#0A0E27', '#1A1F3A', '#0A0E27']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="chevron-back" size={24} color="#8B92B2" />
              </TouchableOpacity>

              {/* MTZ Token Logo */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#00D9FF', '#094d58ff', '#00D9FF']}
                  style={styles.coinGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.coinText}>MTZ</Text>
                </LinearGradient>
                <View style={styles.coinShadow} />
              </View>

              <View style={styles.placeholder} />
            </View>

            {/* Brand Title */}
            <View style={styles.brandSection}>
              <Text style={styles.brandTitle}>
                MILK<Text style={styles.brandAccent}>CHAIN</Text>
              </Text>
              <Text style={styles.tagline}>Token-Powered Dairy Network</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.subtitle}>Create your account</Text>

            <View style={styles.form}>
              {/* Personal Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#4A5174"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="254712345678"
                    placeholderTextColor="#4A5174"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="your@email.com"
                    placeholderTextColor="#4A5174"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>County</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Kiambu, Nakuru"
                    placeholderTextColor="#4A5174"
                    value={formData.county}
                    onChangeText={(value) => handleInputChange('county', value)}
                  />
                </View>
              </View>

              {/* Account Type */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Type</Text>
                
                <View style={styles.accountTypeCard}>
                  <View style={styles.accountTypeHeader}>
                    <Ionicons name="person-outline" size={24} color="#00D9FF" />
                    <Text style={styles.accountTypeTitle}>Farmer/User Account</Text>
                  </View>
                  <Text style={styles.accountTypeDescription}>
                    Register as a dairy farmer to sell milk, earn MTZ tokens, and track your production.
                  </Text>
                  <View style={styles.feeBadge}>
                    <Text style={styles.feeText}>Onboarding Fee: KSH 100</Text>
                  </View>
                </View>

                {/* Depot Attendant Link */}
                <TouchableOpacity 
                  style={styles.depotLink}
                  onPress={openWebRegistration}
                >
                  <Ionicons name="globe-outline" size={20} color="#00D9FF" />
                  <Text style={styles.depotLinkText}>
                    Are you a depot attendant? Register on our web portal
                  </Text>
                  <Ionicons name="open-outline" size={16} color="#00D9FF" />
                </TouchableOpacity>
              </View>

              {/* Security */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#4A5174"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#4A5174"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Transaction PIN *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="4-6 digits"
                    placeholderTextColor="#4A5174"
                    value={formData.pin}
                    onChangeText={(value) => handleInputChange('pin', value)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <Text style={styles.helperText}>This PIN will be used for secure transactions</Text>
                </View>
              </View>

              <Btn 
                title="Create Farmer Account" 
                onPress={handleRegister} 
                loading={loading}
                style={styles.btn}
              />

              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Section */}
            <View style={styles.footer}>
              <View style={styles.securityBadge}>
                <View style={styles.securityIcon} />
                <Text style={styles.securityText}>
                  powered by KxByte
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00D9FF',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  coinText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f3f4f7ff',
    letterSpacing: 1,
  },
  coinShadow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 225, 255, 0.3)',
    transform: [{ scale: 1.2 }],
  },
  placeholder: {
    width: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  brandAccent: {
    color: '#00D9FF',
  },
  tagline: {
    color: '#8B92B2',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: '#00D9FF',
    borderRadius: 2,
  },
  subtitle: { 
    color: '#8B92B2', 
    fontSize: 14, 
    textAlign: 'center',
    marginBottom: 30 
  },

  // Form Styles
  form: { marginBottom: 40 },
  section: { 
    backgroundColor: '#1E2749', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginBottom: 16 
  },
  inputContainer: { marginBottom: 16 },
  label: { color: '#8B92B2', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  textInput: {
    backgroundColor: '#2A3356',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A4567'
  },
  helperText: {
    color: '#4A5174',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic'
  },

  // Account Type Styles
  accountTypeCard: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  accountTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountTypeTitle: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  accountTypeDescription: {
    color: '#8B92B2',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  feeBadge: {
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  feeText: {
    color: '#00D9FF',
    fontSize: 12,
    fontWeight: '600',
  },
  depotLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A3356',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3A4567',
  },
  depotLinkText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 8,
    textAlign: 'center',
    flex: 1,
  },
  btn: { marginTop: 8 },
  loginLink: {
    alignItems: 'center',
    marginTop: 24
  },
  loginText: {
    color: '#8B92B2',
    fontSize: 14
  },
  loginLinkText: {
    color: '#00D9FF',
    fontWeight: '600'
  },

  // Footer Styles
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 136, 0, 0.23)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 174, 0, 0.2)',
  },
  securityIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff7300ff',
    marginRight: 8,
  },
  securityText: {
    color: '#8B92B2',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});