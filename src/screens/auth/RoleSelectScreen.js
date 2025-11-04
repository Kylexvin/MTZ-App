import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function RoleSelectScreen({ navigation }) {
  const { login } = useAuth();

  const roles = [
    { id: 'farmer', title: 'Farmer', icon: 'leaf', desc: 'Produce & sell milk', color: ['#00D9FF', '#0094FF'] },
    { id: 'depot', title: 'Depot', icon: 'business', desc: 'Receive & distribute', color: ['#7B2CFF', '#A855F7'] },
    { id: 'kcc', title: 'KCC', icon: 'shield-checkmark', desc: 'Collect & pasteurize', color: ['#FF6B00', '#FF9500'] }
  ];

  const selectRole = async (role) => {
    await login('demo@email.com', 'password', role);
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose how you'll participate in the network</Text>

        <View style={styles.rolesContainer}>
          {roles.map(role => (
            <TouchableOpacity key={role.id} onPress={() => selectRole(role.id)} activeOpacity={0.7}>
              <LinearGradient colors={role.color} style={styles.roleCard}>
                <Ionicons name={role.icon} size={40} color="#FFF" />
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDesc}>{role.desc}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFF', marginTop: 40, textAlign: 'center' },
  subtitle: { color: '#8B92B2', textAlign: 'center', marginTop: 8, marginBottom: 40 },
  rolesContainer: { flex: 1, justifyContent: 'center', gap: 16 },
  roleCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16
  },
  roleTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: 16 },
  roleDesc: { color: '#E0E0FF', fontSize: 14, marginTop: 8 }
});