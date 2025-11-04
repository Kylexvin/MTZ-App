import React, { createContext, useState, useContext } from 'react';

const OfflineCacheContext = createContext();

export const OfflineCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const [isOnline, setIsOnline] = useState(true);

  const cacheData = (key, data) => {
    setCache(prev => ({ ...prev, [key]: data }));
  };

  return (
    <OfflineCacheContext.Provider value={{ cache, cacheData, isOnline }}>
      {children}
    </OfflineCacheContext.Provider>
  );
};

export const useOfflineCache = () => useContext(OfflineCacheContext);