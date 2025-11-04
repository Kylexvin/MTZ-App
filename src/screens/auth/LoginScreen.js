import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import Btn from '../../components/Btn';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState('email');
  const { login, loading } = useAuth();

  useEffect(() => {
    console.log('LoginScreen mounted, navigation object:', !!navigation);
  }, []);


const handleLogin = async () => {
    // Validate inputs
    if (!identifier.trim() || !password.trim()) {
      Alert.alert(
        'Missing Information', 
        `Please enter your ${loginMethod === 'email' ? 'email' : 'phone number'} and password`
      );
      return;
    }

    console.log('🔐 Login attempt:', { identifier, method: loginMethod });

    try {
      // Use AuthContext login function (which now uses Axios internally)
      const result = await login(identifier, password, loginMethod);

      console.log('📡 Login response:', result);

      // Handle pending users
      if (result.isPending) {
        console.log('⏳ Pending user detected - navigating to payment verification');
        
        setTimeout(() => {
          try {
            navigation.navigate('PaymentVerification', {
              user: result.user,
              onboardingFee: result.user.onboardingFee || 100
            });
            console.log('✅ Navigation command sent');
          } catch (navError) {
            console.error('Navigation error:', navError);
            Alert.alert('Navigation Error', 'Please try again');
          }
        }, 100);
        
        return;
      }

      // Handle successful login
      if (result.success) {
        console.log('✅ Login successful - user verified');
        // Navigation handled by AppNavigator based on auth state
        return;
      }

      // Handle login failure
      console.log('❌ Login failed:', result.error);
      Alert.alert(
        'Login Failed', 
        result.error || 'Invalid credentials. Please try again.'
      );

    } catch (error) {
      console.error('💥 Login error:', error);
      Alert.alert(
        'Error', 
        error.message || 'An unexpected error occurred. Please try again.'
      );
    }
  };

  const switchLoginMethod = () => {
    const newMethod = loginMethod === 'email' ? 'phone' : 'email';
    setLoginMethod(newMethod);
    setIdentifier('');
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

              {/* Brand Title */}
              <Text style={styles.brandTitle}>
                MILK<Text style={styles.brandAccent}>CHAIN</Text>
              </Text>
              <Text style={styles.tagline}>Token-Powered Dairy Network</Text>
              <View style={styles.divider} />
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.instructionText}>Sign in to continue</Text>

              {/* Login Method Toggle */}
              <View style={styles.methodToggle}>
                <TouchableOpacity 
                  style={[
                    styles.methodButton, 
                    loginMethod === 'email' && styles.methodButtonActive
                  ]}
                  onPress={() => setLoginMethod('email')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.methodText,
                    loginMethod === 'email' && styles.methodTextActive
                  ]}>
                    Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.methodButton, 
                    loginMethod === 'phone' && styles.methodButtonActive
                  ]}
                  onPress={() => setLoginMethod('phone')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.methodText,
                    loginMethod === 'phone' && styles.methodTextActive
                  ]}>
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Identifier Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    loginMethod === 'email' 
                      ? 'your.email@example.com' 
                      : '254712345678'
                  }
                  placeholderTextColor="#4A5174"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#4A5174"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Login Button */}
              <Btn 
                title="Sign In" 
                onPress={handleLogin} 
                loading={loading} 
                style={styles.loginButton} 
              />

              {/* Switch Method Link */}
              <TouchableOpacity 
                onPress={switchLoginMethod} 
                style={styles.switchLink}
                activeOpacity={0.7}
              >
                <Text style={styles.switchLinkText}>
                  {loginMethod === 'email' 
                    ? 'Login with phone number instead' 
                    : 'Login with email instead'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Section */}
            <View style={styles.footer}>
              <View style={styles.signupPrompt}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Register')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

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
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  coinGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#00D9FF',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  coinText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f3f4f7ff',
    letterSpacing: 1,
  },
  coinShadow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(0, 225, 255, 0.3)',
    transform: [{ scale: 1.3 }],
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  brandAccent: {
    color: '#00D9FF',
  },
  tagline: {
    color: '#8B92B2',
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#00D9FF',
    marginTop: 20,
    borderRadius: 2,
  },

  // Form Styles
  formContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 15,
    color: '#8B92B2',
    marginBottom: 30,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E2749',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  methodButtonActive: {
    backgroundColor: '#00D9FF',
  },
  methodText: {
    color: '#8B92B2',
    fontWeight: '600',
    fontSize: 15,
  },
  methodTextActive: {
    color: '#0A0E27',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#1E2749',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#2A3356',
  },
  loginButton: {
    marginTop: 16,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchLinkText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Footer Styles
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: '#8B92B2',
    fontSize: 15,
  },
  signupLink: {
    color: '#00D9FF',
    fontSize: 15,
    fontWeight: '700',
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