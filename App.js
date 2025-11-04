import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, View, StyleSheet, Platform, AppState, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PinProvider, usePin } from './src/context/PinContext';
import PinScreen from './src/components/PinScreen';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent = () => {
  const { isAuthenticated, user, checkAuth } = useAuth();
  const { isPinRequired, verifyPin, requirePin } = usePin();
  const [appReady, setAppReady] = useState(false);
  const appState = useRef(AppState.currentState);

  // Check auth status on app start
  useEffect(() => {
    const initializeApp = async () => {
      await checkAuth();
      setAppReady(true);
    };

    initializeApp();
  }, []);

  // Require PIN for authenticated users
  useEffect(() => {
    if (appReady && isAuthenticated) {
      requirePin();
    }
  }, [appReady, isAuthenticated]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isAuthenticated
      ) {
        requirePin();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  // Show loading only while checking initial auth
  if (!appReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show PIN screen for authenticated users
  if (isAuthenticated && isPinRequired) {
    return (
      <PinScreen 
        onPinSuccess={verifyPin}
        title="Welcome Back"
        pinLength={4}
      />
    );
  }

  return <AppNavigator />;
};

export default function App() {
  const baseURL = Platform.OS === 'ios'
    ? 'http://localhost:5000'
    : 'http://192.168.100.6:5000';

  axios.defaults.baseURL = baseURL + '/api';
  axios.defaults.timeout = 10000;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          translucent
          backgroundColor="#0A0E27"
        />
        <AuthProvider>
          <PinProvider>
            <AppContent />
          </PinProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
  loadingText: {
    color: '#8B92B2',
    marginTop: 16,
    fontSize: 16,
  },
});  