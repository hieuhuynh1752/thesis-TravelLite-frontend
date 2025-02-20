'use client';
import React, { createContext, useContext, useState } from 'react';

type DirectionType = {
  origin: string;
  destination: string;
};

type SelectedRouteType = {
  routes?: google.maps.DirectionsResult;
  index: number;
};

type TravelContextType = {
  searchDirection?: DirectionType;
  setSearchDirection: (direction: DirectionType) => void;
  responses: google.maps.DirectionsResult[];
  setResponses: (responses: google.maps.DirectionsResult[]) => void;
  selectedRoute: SelectedRouteType;
  setSelectedRoute: (route: SelectedRouteType) => void;
  selectedTravelMode: google.maps.TravelMode | undefined;
  setSelectedTravelMode: (mode: google.maps.TravelMode | undefined) => void;
};

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchDirection, setSearchDirection] = useState<
    DirectionType | undefined
  >(undefined);
  const [responses, setResponses] = React.useState<
    google.maps.DirectionsResult[]
  >([]);
  const [selectedRoute, setSelectedRoute] = useState<SelectedRouteType>({
    index: 0,
  });
  const [selectedTravelMode, setSelectedTravelMode] = React.useState<
    google.maps.TravelMode | undefined
  >(undefined);
  return (
    <TravelContext.Provider
      value={{
        searchDirection,
        setSearchDirection,
        responses,
        setResponses,
        selectedTravelMode,
        setSelectedTravelMode,
        selectedRoute,
        setSelectedRoute,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

export const useTravelContext = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravelContext must be used within a TravelProvider');
  }
  return context;
};
