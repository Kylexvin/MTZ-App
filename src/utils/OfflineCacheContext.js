import React, { createContext, useContext } from 'react';

const OfflineCacheContext = createContext();

export const OfflineCacheProvider = ({ children }) => {
  return (
    <OfflineCacheContext.Provider value={{}}>
      {children}
    </OfflineCacheContext.Provider>
  );
};

export const useOfflineCache = () => useContext(OfflineCacheContext);