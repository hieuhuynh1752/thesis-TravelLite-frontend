'use client';
import * as React from 'react';

export const GoogleMapsContext = React.createContext<
  typeof google.maps | undefined
>(undefined);

export const useGoogleMaps = () => {
  const context = React.useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};
