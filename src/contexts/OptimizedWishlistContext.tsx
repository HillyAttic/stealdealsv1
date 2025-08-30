// Mock implementation for testing
import React, { createContext, useContext } from 'react';

const OptimizedWishlistContext = createContext({});

export const OptimizedWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <OptimizedWishlistContext.Provider value={{}}>
      {children}
    </OptimizedWishlistContext.Provider>
  );
};

export const useOptimizedWishlistContext = () => useContext(OptimizedWishlistContext);