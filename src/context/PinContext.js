// context/PinContext.js
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const PinContext = createContext();

export const PinProvider = ({ children }) => {
  const [isPinRequired, setIsPinRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const verifyPin = async (enteredPin) => {
    try {
      const response = await axios.post('/auth/verify-pin', { pin: enteredPin });
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setIsPinRequired(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PIN verification error:', error);
      return false;
    }
  };

  const requirePin = () => {
    setIsPinRequired(true);
    setIsAuthenticated(false);
  };

  const clearPinAuth = () => {
    setIsAuthenticated(false);
    setIsPinRequired(false);
  };

  return (
    <PinContext.Provider value={{
      isPinRequired,
      isAuthenticated,
      requirePin,
      verifyPin,
      clearPinAuth
    }}>
      {children}
    </PinContext.Provider>
  );
};

export const usePin = () => useContext(PinContext);