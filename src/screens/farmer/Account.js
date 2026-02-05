import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function Account({ navigation }) {
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);

  const menuItems = [
    { icon: 'person-outline', title: 'Personal Information', subtitle: 'Update your details', screen: null },
    { icon: 'shield-checkmark-outline', title: 'Security', subtitle: 'Password & 2FA', screen: null },
    { icon: 'document-text-outline', title: 'Documents', subtitle: 'Licenses & certificates', screen: null },
    { icon: 'card-outline', title: 'Payment Methods', subtitle: 'Manage bank accounts', screen: null },
    { icon: 'stats-chart-outline', title: 'Analytics', subtitle: 'View your statistics', screen: null },
    { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Get assistance', screen: null }
  ];

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>John Doe</Text>
                <Text style={styles.profileEmail}>john.doe@milkchain.com</Text>
                <View style={styles.badge}>
                  <Ionicons name="shield-checkmark" size={12} color="#00FF88" />
                  <Text style={styles.badgeText}>Verified Farmer</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={20} color="#00D9FF" />
              </TouchableOpacity>
            </View>


            {/* Settings */}
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={24} color="#00D9FF" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingSubtitle}>Receive transaction alerts</Text>
                  </View>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#2A3356', true: '#00D9FF' }}
                  thumbColor="#FFF"
                  ios_backgroundColor="#2A3356"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="finger-print-outline" size={24} color="#7B2CFF" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Biometric Login</Text>
                    <Text style={styles.settingSubtitle}>Use fingerprint/Face ID</Text>
                  </View>
                </View>
                <Switch
                  value={biometric}
                  onValueChange={setBiometric}
                  trackColor={{ false: '#2A3356', true: '#7B2CFF' }}
                  thumbColor="#FFF"
                  ios_backgroundColor="#2A3356"
                />
              </View>
            </View>

            {/* Menu Items */}
            <Text style={styles.sectionTitle}>Account Settings</Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={24} color="#00D9FF" />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4A5174" />
              </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={24} color="#FF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2749',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800'
  },
  placeholder: { width: 40 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  content: {
    padding: 24
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2749',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900'
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4
  },
  profileEmail: {
    color: '#8B92B2',
    fontSize: 14,
    marginBottom: 8
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4
  },
  statLabel: {
    color: '#8B92B2',
    fontSize: 11
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16
  },
  settingsCard: {
    backgroundColor: '#1E2749',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingText: {
    marginLeft: 16,
    flex: 1
  },
  settingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  settingSubtitle: {
    color: '#8B92B2',
    fontSize: 12
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2749',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3356'
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  menuText: {
    flex: 1
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  menuSubtitle: {
    color: '#8B92B2',
    fontSize: 12
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.2)'
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8
  },
  version: {
    textAlign: 'center',
    color: '#4A5174',
    fontSize: 12,
    marginBottom: 20
  }
});