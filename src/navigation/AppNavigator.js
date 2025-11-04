import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import FarmerNavigator from './FarmerNavigator';
import DepotNavigator from './DepotNavigator';
import KccNavigator from './KccNavigator';
import UnsupportedRoleScreen from '../screens/auth/UnsupportedRoleScreen';
import Loader from '../components/Loader';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, checkAuth, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasPendingUser, setHasPendingUser] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    await checkAuth();
    
    // Check for pending users
    const pendingUser = await AsyncStorage.getItem('pendingUser');
    setHasPendingUser(!!pendingUser);
    
    setLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  console.log('🔍 AppNavigator - Auth Status:', { 
    isAuthenticated, 
    userRole: user?.role,
    userName: user?.name,
    hasPendingUser 
  });

  // Get the appropriate navigator based on user role
  const getRoleNavigator = () => {
    if (!user?.role) return null;

    switch (user.role) {
      case 'farmer':
        console.log('🚜 Redirecting to FarmerNavigator');
        return FarmerNavigator;
      case 'attendant':
        console.log('🏭 Redirecting to DepotNavigator');
        return DepotNavigator;
      case 'kcc_attendant':
        console.log('🏢 Redirecting to KccNavigator');
        return KccNavigator;
      default:
        console.log('❌ Unsupported role detected:', user.role);
        return 'unsupported';
    }
  };

  const RoleNavigator = getRoleNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={
          isAuthenticated && RoleNavigator === 'unsupported' ? "UnsupportedRole" :
          isAuthenticated && RoleNavigator ? "MainApp" :
          hasPendingUser ? "Auth" :
          "Auth"
        }
      >
        {isAuthenticated && RoleNavigator && RoleNavigator !== 'unsupported' ? (
          // Authenticated user with supported role - show role-specific app
          <Stack.Screen 
            name="MainApp" 
            component={RoleNavigator}
            options={{ gestureEnabled: false }}
          />
        ) : isAuthenticated && RoleNavigator === 'unsupported' ? (
          // Authenticated but unsupported role (admin, kcc_admin, etc.)
          <Stack.Screen 
            name="UnsupportedRole" 
            component={UnsupportedRoleScreen}
          />
        ) : hasPendingUser ? (
          // Pending user - show auth flow (will handle payment verification)
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // No user - show auth flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}