'use client';
import React, { createContext, useContext, useState } from 'react';

type DirectionType = {
  origin: string;
  destination: string;
};

type SelectedRouteType = {
  routes?: google.maps.DirectionsResult;
  index: number;
  hashedId?: string;
};

export interface FlattenedTravelStep {
  distance: string;
  duration: string;
  instructions: string;
  transit?: {
    line: string;
    lineShortName: string;
    lineColor: string;
    vehicle: string;
    departureStop: string;
    departureTime: string;
    arrivalStop: string;
    arrivalTime: string;
    numberOfStops: number;
    co2?: number;
  };
  travelMode: google.maps.TravelMode;
  totalCo2?: number;
}

export interface FlattenedSelectedRoute {
  origin: string;
  destination: string;
  travelMode: google.maps.TravelMode;
  routeDetails: google.maps.DirectionsResult;
  travelSteps: FlattenedTravelStep[];
  totalCo2?: number;
}

type TravelContextType = {
  searchDirection?: DirectionType;
  setSearchDirection: React.Dispatch<
    React.SetStateAction<DirectionType | undefined>
  >;
  originValue: string;
  setOriginValue: React.Dispatch<React.SetStateAction<string>>;
  responses: google.maps.DirectionsResult[];
  setResponses: (responses: google.maps.DirectionsResult[]) => void;
  selectedRoute: SelectedRouteType;
  setSelectedRoute: (route: SelectedRouteType) => void;
  selectedTravelMode: google.maps.TravelMode | undefined;
  setSelectedTravelMode: (mode: google.maps.TravelMode | undefined) => void;
  unavailableTravelModes: Set<google.maps.TravelMode>;
  setUnavailableTravelModes: React.Dispatch<
    React.SetStateAction<Set<google.maps.TravelMode>>
  >;
  isEditingTravelPlan: boolean;
  setIsEditingTravelPlan: React.Dispatch<React.SetStateAction<boolean>>;
  flattenedSelectedRoute?: FlattenedSelectedRoute;
  setFlattenedSelectedRoute?: React.Dispatch<
    React.SetStateAction<FlattenedSelectedRoute | undefined>
  >;
  savedTravelPlan?: FlattenedSelectedRoute & {
    eventParticipantId: number;
  };
  setSavedTravelPlan?: React.Dispatch<
    React.SetStateAction<
      | (FlattenedSelectedRoute & {
          eventParticipantId: number;
        })
      | undefined
    >
  >;
  resetAllTravelLogs: () => void;
};

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [originValue, setOriginValue] = useState('');
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
  const [unavailableTravelModes, setUnavailableTravelModes] = React.useState<
    Set<google.maps.TravelMode>
  >(new Set<google.maps.TravelMode>());
  const [flattenedSelectedRoute, setFlattenedSelectedRoute] = React.useState<
    FlattenedSelectedRoute | undefined
  >();
  const [isEditingTravelPlan, setIsEditingTravelPlan] = React.useState(false);
  const [savedTravelPlan, setSavedTravelPlan] = React.useState<
    | (FlattenedSelectedRoute & {
        eventParticipantId: number;
      })
    | undefined
  >();

  const resetAllTravelLogs = React.useCallback(() => {
    setSelectedRoute({ index: 0 });
    setSelectedTravelMode(undefined);
    setUnavailableTravelModes(new Set<google.maps.TravelMode>());
    setFlattenedSelectedRoute(undefined);
    setIsEditingTravelPlan(false);
    setSavedTravelPlan(undefined);
    setResponses([]);
    setOriginValue('');
    setSearchDirection(undefined);
  }, []);

  return (
    <TravelContext.Provider
      value={{
        originValue,
        setOriginValue,
        searchDirection,
        setSearchDirection,
        responses,
        setResponses,
        selectedTravelMode,
        setSelectedTravelMode,
        selectedRoute,
        setSelectedRoute,
        unavailableTravelModes,
        setUnavailableTravelModes,
        flattenedSelectedRoute,
        setFlattenedSelectedRoute,
        isEditingTravelPlan,
        setIsEditingTravelPlan,
        savedTravelPlan,
        setSavedTravelPlan,
        resetAllTravelLogs,
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
