import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Btn({ title, onPress, loading, variant = 'primary', style, disabled }) {
  const colors = variant === 'primary' 
    ? ['#00D9FF', '#7B2CFF'] 
    : ['#1A1F3A', '#2A2F4A'];

  // Explicit boolean conversion - CRITICAL for React 19
  const isLoading = loading === true || loading === 'true';
  const isDisabled = disabled === true || disabled === 'true' || isLoading;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={isDisabled} 
      style={style}
      activeOpacity={0.7}
    >
      <LinearGradient 
        colors={colors} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={styles.button}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  }
});