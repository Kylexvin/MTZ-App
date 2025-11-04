import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to update Axios headers with token
  const updateAxiosHeaders = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Axios headers updated with auth token');
      } else {
        delete axios.defaults.headers.common['Authorization'];
        console.log('❌ Axios auth headers removed');
      }
    } catch (error) {
      console.error('Error updating axios headers:', error);
    }
  };

  const login = async (identifier, password, method = 'email') => {
    setLoading(true);
    try {
      let response;
      
      // Use global Axios instance
      if (method === 'email') {
        response = await axios.post('/auth/login', { email: identifier, password });
      } else {
        response = await axios.post('/auth/login-phone', { phone: identifier, password });
      }

      if (response.data.success && response.data.data) {
        const userData = response.data.data.user;
        const userRole = userData.role;
        
        console.log(`🔐 Login successful - Role: ${userRole}, Name: ${userData.name}`);

        // Check if this is a pending user that requires payment
        if (response.data.data.requiresPayment) {
          console.log('⏳ Pending user detected - requires payment verification');
          await AsyncStorage.setItem('pendingUser', JSON.stringify(userData));
          
          return {
            success: false,
            error: response.data.message,
            isPending: true,
            user: userData
          };
        }
        
        // Validate that user role is supported in mobile app
        const supportedRoles = ['farmer', 'attendant', 'kcc_attendant'];
        if (!supportedRoles.includes(userRole)) {
          console.log(`🚫 Role not supported in mobile app: ${userRole}`);
          throw new Error(`Your role (${userRole}) is not supported in the mobile app. Please use the web platform.`);
        }
        
        // Active user with supported role - store token and user data
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await updateAxiosHeaders(); // Update headers after login
        
        setUser(userData);
        
        return { 
          success: true, 
          user: userData,
          role: userRole
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out user:', user?.name);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('pendingUser');
    await updateAxiosHeaders(); // Remove auth header
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        const userRole = parsedUser.role;
        
        // Check if stored user role is supported
        const supportedRoles = ['farmer', 'attendant', 'kcc_attendant'];
        if (!supportedRoles.includes(userRole)) {
          console.log(`🚫 Stored user role not supported: ${userRole}`);
          await logout(); // Clear invalid user data
          return false;
        }
        
        setUser(parsedUser);
        await updateAxiosHeaders(); // Set headers on app start
        console.log(`✅ Auto-login successful - Role: ${userRole}, Name: ${parsedUser.name}`);
        return true;
      }
      console.log('❌ No stored auth data found');
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Helper function to check if user role is supported in mobile app
  const isSupportedRole = () => {
    const supportedRoles = ['farmer', 'attendant', 'kcc_attendant'];
    return supportedRoles.includes(user?.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      checkAuth,
      hasRole,
      isSupportedRole,
      isAuthenticated: !!user,
      userRole: user?.role
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);