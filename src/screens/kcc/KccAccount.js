// src/screens/kcc/KccAccount.js
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Btn from '../../components/Btn';

export default function KccAccount({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Account</Text>
            <View style={styles.divider} />
          </View>

          {/* User Info */}
          <View style={styles.infoCard}>
            <View style={styles.avatar}>
              <Ionicons name="business" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>KCC Attendant</Text>
            
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Ionicons name="mail" size={16} color="#8B92B2" />
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="call" size={16} color="#8B92B2" />
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{user?.phone || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={16} color="#8B92B2" />
                <Text style={styles.detailLabel}>County:</Text>
                <Text style={styles.detailValue}>{user?.county || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, styles.statusActive]}>
                  {user?.status || 'Active'}
                </Text>
              </View>
            </View>
          </View>

          {/* KCC Branch Info */}
          <View style={styles.branchCard}>
            <Text style={styles.cardTitle}>Assigned KCC Branch</Text>
            <Text style={styles.branchInfo}>
              Branch ID: {user?.assignedKcc || 'Not assigned'}
            </Text>
            <Text style={styles.note}>
              Branch details will be loaded from API
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Btn 
              title="Logout" 
              onPress={handleLogout}
              style={styles.logoutButton}
              variant="danger"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.version}>MilkChain KCC v1.0.0</Text>
            <Text style={styles.copyright}>© 2024 KxByte Technologies</Text>
          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#00D9FF',
    borderRadius: 2,
  },
  infoCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#00D9FF',
    fontWeight: '600',
    marginBottom: 20,
  },
  details: {
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3356',
  },
  detailLabel: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 4,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusActive: {
    color: '#00FF88',
  },
  branchCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3356',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#00D9FF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  branchInfo: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  note: {
    color: '#8B92B2',
    fontSize: 12,
    fontStyle: 'italic',
  },
  actions: {
    marginBottom: 20,
  },
  logoutButton: {
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  version: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 4,    
  },
  copyright: {
    color: '#4A5174',
    fontSize: 12,
  },
});