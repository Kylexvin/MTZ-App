// src/navigation/KccNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// KCC Screens
import KccDashboard from '../screens/kcc/KccDashboard';
import KccPickup from '../screens/kcc/KccPickup';
import KccDelivery from '../screens/kcc/KccDelivery';
import KccAccount from '../screens/kcc/KccAccount';

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
        component={KccDashboard}
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
        name="Pickup"
        component={KccPickup}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'arrow-up' : 'arrow-up-outline'} size={24} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Delivery"
        component={KccDelivery}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'arrow-down' : 'arrow-down-outline'} size={24} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Account"
        component={KccAccount}
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

export default function KccNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
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