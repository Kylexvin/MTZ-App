// src/navigation/DepotNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import from your existing file structure
import DepotDashboard from '../screens/depot/DepotDashboard';
import ReceiveMilk from '../screens/depot/ReceiveMilk';
import QuickInventory from '../screens/depot/QuickInventory';
import SellToCustomer from '../screens/depot/SellToCustomer';

// Import our new screens
import Operations from '../screens/depot/Operations';
import Inventory from '../screens/depot/Inventory';
import Account from '../screens/depot/Account';
import FarmerLookup from '../screens/depot/FarmerLookup';
import KccPickup from '../screens/depot/KccPickup';
import KccDeliveryQR from '../screens/depot/KccDeliveryQR';
import TransactionHistory from '../screens/depot/TransactionHistory';

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
        component={DepotDashboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'business' : 'business-outline'} size={24} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Operations"
        component={Operations}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'cash' : 'cash-outline'} size={24} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={Inventory}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <LinearGradient colors={['#00D9FF', '#7B2CFF']} style={styles.iconGlow} />}
              <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
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

export default function DepotNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      
      {/* Modal/Stack Screens */}
      <Stack.Screen name="FarmerLookup" component={FarmerLookup} />
      <Stack.Screen name="KccPickup" component={KccPickup} />
      <Stack.Screen name="KccDeliveryQR" component={KccDeliveryQR} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
      
      {/* Your existing screens */}
      <Stack.Screen name="ReceiveMilk" component={ReceiveMilk} />
      <Stack.Screen name="QuickInventory" component={QuickInventory} />
      <Stack.Screen name="SellToCustomer" component={SellToCustomer} />
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