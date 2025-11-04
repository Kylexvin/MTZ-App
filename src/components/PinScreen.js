// components/PinScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PinScreen = ({ 
  onPinSuccess,
  onPinFail,
  title = "Enter PIN",
  subtitle = "Enter your PIN to continue",
  pinLength = 4
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const startShake = () => {
    Vibration.vibrate(500);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handlePinSubmit = async (enteredPin) => {
    setLoading(true);
    try {
      const success = await onPinSuccess(enteredPin);
      if (!success) {
        setError('Invalid PIN');
        startShake();
        setPin('');
        onPinFail?.();
      }
    } catch (error) {
      setError('Verification failed');
      startShake();
      setPin('');
      onPinFail?.();
    } finally {
      setLoading(false);
    }
  };

  const handleNumberPress = (number) => {
    if (pin.length < pinLength && !loading) {
      const newPin = pin + number;
      setPin(newPin);
      setError('');

      if (newPin.length === pinLength) {
        handlePinSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !loading) {
      setPin(pin.slice(0, -1));
      setError('');
    }
  };

  const handleClear = () => {
    if (!loading) {
      setPin('');
      setError('');
    }
  };

  const renderDots = () => {
    return (
      <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        {Array.from({ length: pinLength }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < pin.length ? styles.dotFilled : styles.dotEmpty,
              loading && styles.dotDisabled
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={32} color="#00D9FF" />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {renderDots()}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading && (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={20} color="#00D9FF" />
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
        )}

        <View style={styles.numberPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <TouchableOpacity
              key={number}
              style={[styles.numberButton, loading && styles.buttonDisabled]}
              onPress={() => handleNumberPress(number.toString())}
              disabled={loading}
            >
              <Text style={[styles.numberText, loading && styles.textDisabled]}>{number}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={[styles.numberButton, loading && styles.buttonDisabled]}
            onPress={handleClear}
            disabled={loading}
          >
            <Text style={[styles.numberText, loading && styles.textDisabled]}>Clear</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.numberButton, loading && styles.buttonDisabled]}
            onPress={() => handleNumberPress('0')}
            disabled={loading}
          >
            <Text style={[styles.numberText, loading && styles.textDisabled]}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.numberButton, loading && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="backspace-outline" size={24} color={loading ? '#4A5174' : '#8B92B2'} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#8B92B2', textAlign: 'center' },
  dotsContainer: { flexDirection: 'row', marginBottom: 30 },
  dot: { width: 20, height: 20, borderRadius: 10, marginHorizontal: 8 },
  dotEmpty: { backgroundColor: '#2A3356', borderWidth: 2, borderColor: '#00D9FF' },
  dotFilled: { backgroundColor: '#00D9FF' },
  dotDisabled: { opacity: 0.5 },
  errorText: { color: '#FF6B6B', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  loadingText: { color: '#00D9FF', fontSize: 14, marginLeft: 8 },
  numberPad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 300 },
  numberButton: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', margin: 8, backgroundColor: 'rgba(30, 39, 73, 0.8)', borderWidth: 1, borderColor: '#2A3356' },
  buttonDisabled: { opacity: 0.5 },
  numberText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  textDisabled: { color: '#4A5174' },
});

export default PinScreen;