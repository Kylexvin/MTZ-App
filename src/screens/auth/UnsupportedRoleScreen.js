// src/screens/auth/UnsupportedRoleScreen.js
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Btn from '../../components/Btn';

export default function UnsupportedRoleScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Switch to Web',
      'Please use the web version for your role. Logging out from mobile app...',
      [
        { 
          text: 'OK', 
          onPress: logout,
          style: 'default'
        }
      ]
    );
  };

  const getRoleMessage = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator accounts require the web platform for full access to system management features.';
      case 'kcc_admin':
        return 'KCC Administrator accounts require the web platform for comprehensive dairy processing management.';
      default:
        return 'Your account role is not supported in the mobile application.';
    }
  };

  return (
    <LinearGradient 
      colors={['#0A0E27', '#1A1F3A', '#0A0E27']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Web Platform Required</Text>
            <View style={styles.divider} />
          </View>

          {/* Role Info */}
          <View style={styles.roleCard}>
            <Text style={styles.roleTitle}>Account Detected</Text>
            <Text style={styles.roleName}>{user?.name}</Text>
            <Text style={styles.roleType}>{user?.role?.toUpperCase()} Role</Text>
            
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                {getRoleMessage(user?.role)}
              </Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Web Platform Features:</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Full administrative controls</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Advanced reporting and analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>User management</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>System configuration</Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            <Btn 
              title="Continue to Web Platform" 
              onPress={handleLogout}
              style={styles.logoutButton}
            />
            <Text style={styles.noteText}>
              You will be logged out from the mobile app
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Mobile app supports: Farmer, Depot Attendant, KCC Attendant
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
    justifyContent: 'space-between',
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
    textAlign: 'center',
  },
  divider: {
    width: 80,
    height: 3,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  roleCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3356',
    marginBottom: 20,
  },
  roleTitle: {
    color: '#8B92B2',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleType: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  messageBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  messageText: {
    color: '#8B92B2',
    fontSize: 14,
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3356',
    marginBottom: 20,
  },
  featuresTitle: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureBullet: {
    color: '#00D9FF',
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    color: '#8B92B2',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionSection: {
    alignItems: 'center',
  },
  logoutButton: {
    marginBottom: 12,
  },
  noteText: {
    color: '#8B92B2',
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#4A5174',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});