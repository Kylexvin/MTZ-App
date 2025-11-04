import { useState, useEffect } from 'react';

export const useTokens = () => {
  const [balance, setBalance] = useState(15420);
  const [loading, setLoading] = useState(false);

  const refreshBalance = () => {
    setLoading(true);
    setTimeout(() => {
      setBalance(prev => prev + Math.floor(Math.random() * 100));
      setLoading(false);
    }, 1000);
  };

  return { balance, loading, refreshBalance };
};