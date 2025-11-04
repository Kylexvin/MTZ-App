// src/screens/common/PlaceholderScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlaceholderScreen({ route }) {
  const { title = 'Coming Soon', message = 'This screen is under development' } = route.params || {};

  return (
    <LinearGradient 
      colors={['#0A0E27', '#1A1F3A', '#0A0E27']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚧</Text>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureTitle}>Planned Features:</Text>
            <Text style={styles.featureItem}>• Screen functionality development</Text>
            <Text style={styles.featureItem}>• API integration</Text>
            <Text style={styles.featureItem}>• User interface design</Text>
            <Text style={styles.featureItem}>• Testing and validation</Text>
          </View>
          
          <View style={styles.note}>
            <Text style={styles.noteText}>
              Check back soon for updates!
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#8B92B2',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  featureList: {
    backgroundColor: '#1E2749',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3356',
    marginBottom: 24,
    width: '100%',
  },
  featureTitle: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  note: {
    padding: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  noteText: {
    color: '#FFC107',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});