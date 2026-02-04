import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import FarmerDashboard from '../screens/farmer/FarmerDashboard';
import Wallet from '../screens/farmer/Wallet';
import WithdrawMilk from '../screens/farmer/WithdrawMilk'; // Add this import
import DepositMilk from '../screens/farmer/DepositMilk'; // Add this import
import Account from '../screens/farmer/Account';
import Scanner from '../screens/common/Scanner';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1F3A',
          borderTopWidth: 1,
          borderTopColor: '#2A3356',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10
        },
        tabBarActiveTintColor: '#00D9FF',
        tabBarInactiveTintColor: '#4A5174',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={FarmerDashboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function FarmerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen 
        name="Scanner" 
        component={Scanner}
        options={{
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="WithdrawMilk" 
        component={WithdrawMilk}
        options={{
          presentation: 'card',
          gestureEnabled: true,
          cardStyle: { backgroundColor: '#0A0E27' }
        }}
      />
      <Stack.Screen 
        name="DepositMilk" 
        component={DepositMilk}
        options={{
          presentation: 'card',
          gestureEnabled: true,
          cardStyle: { backgroundColor: '#0A0E27' }
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25
  },
  iconContainerActive: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)'
  },
  iconGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.2
  }
});