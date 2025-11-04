import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import PaymentVerificationScreen from '../screens/auth/PaymentVerificationScreen';
import RegisterScreen from '../screens/auth/RegisterScreen'; 

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PaymentVerification" component={PaymentVerificationScreen} />
    </Stack.Navigator>
  );
}