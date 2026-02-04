import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useTokens = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/wallet/balance');
      if (response.data.success) {
        setBalance(response.data.data.balance); // Real balance from API
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance');
      console.error('Balance fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refreshBalance = useCallback(() => {
    return fetchBalance();
  }, [fetchBalance]);

  return {
    balance,    
    loading,
    error,
    refreshBalance
  };
};