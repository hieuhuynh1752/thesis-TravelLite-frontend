'use client';
import React, { createContext, useContext, useState } from 'react';
import { AirportDetails, FlightDetails } from '../../services/api/type.api';

export type SelectedRouteType = {
  routes?: google.maps.DirectionsResult;
  index: number;
  hashedId?: string;
};

export type LocationType = {
  id: string;
  name?: string;
  airport?: AirportDetails;
};

export type DirectionType = {
  origin?: LocationType;
  destination?: LocationType;
  arrivalTime?: Date;
  departureTime?: Date;
  travelMode?: google.maps.TravelMode;
  selectedRoute?: SelectedRouteType;
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
  plannedAt: Date;
  routeDetails: google.maps.DirectionsResult;
  travelSteps: FlattenedTravelStep[];
  totalCo2?: number;
  id?: number;
}

export interface FlattenedSelectedFlight {
  origin: string;
  destination: string;
  travelMode: string;
  plannedAt: Date;
  routeDetails: SelectedFlight;
  travelSteps: [];
  totalCo2?: number;
  id?: number;
}

export type SavedTravelPlanType =
  | (FlattenedSelectedRoute & {
      eventParticipantId: number;
    })
  | (FlattenedSelectedFlight & { eventParticipantId: number });

export function isFlight(
  savedPlan: SavedTravelPlanType,
): savedPlan is FlattenedSelectedFlight & { eventParticipantId: number } {
  return !!(savedPlan as FlattenedSelectedFlight).routeDetails.details;
}

export interface SelectedFlight {
  origin: LocationType;
  destination: LocationType;
  departureTime: Date;
  arrivalTime: Date;
  details: FlightDetails;
}

type TravelContextType = {
  searchDirection?: DirectionType;
  setSearchDirection: React.Dispatch<
    React.SetStateAction<DirectionType | undefined>
  >;
  directionsCollection?: DirectionType[];
  setDirectionsCollection?: React.Dispatch<
    React.SetStateAction<DirectionType[] | undefined>
  >;
  originValue: string;
  setOriginValue: React.Dispatch<React.SetStateAction<string>>;
  destinationValue: string;
  setDestinationValue: React.Dispatch<React.SetStateAction<string>>;
  responses: google.maps.DirectionsResult[];
  setResponses: (responses: google.maps.DirectionsResult[]) => void;
  flightsResponses?: FlightDetails[];
  setFlightsResponses?: React.Dispatch<React.SetStateAction<FlightDetails[]>>;
  selectedRoute: SelectedRouteType;
  setSelectedRoute: React.Dispatch<React.SetStateAction<SelectedRouteType>>;
  selectedFlight?: SelectedFlight;
  setSelectedFlight?: React.Dispatch<
    React.SetStateAction<SelectedFlight | undefined>
  >;
  selectedTravelMode: google.maps.TravelMode | undefined;
  setSelectedTravelMode: React.Dispatch<
    React.SetStateAction<google.maps.TravelMode | undefined>
  >;
  selectedFlightMode?: boolean;
  setSelectedFlightMode?: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
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
  savedTravelPlan?: SavedTravelPlanType;
  setSavedTravelPlan?: React.Dispatch<
    React.SetStateAction<SavedTravelPlanType | undefined>
  >;
  resetAllTravelLogs: () => void;
};

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [originValue, setOriginValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const [searchDirection, setSearchDirection] = useState<
    DirectionType | undefined
  >(undefined);
  const [directionsCollection, setDirectionsCollection] = useState<
    DirectionType[] | undefined
  >(undefined);
  const [responses, setResponses] = React.useState<
    google.maps.DirectionsResult[]
  >([]);
  const [flightsResponses, setFlightsResponses] = React.useState<
    FlightDetails[]
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
  const [selectedFlightMode, setSelectedFlightMode] = React.useState<
    boolean | undefined
  >(undefined);
  const [selectedFlight, setSelectedFlight] = React.useState<
    SelectedFlight | undefined
  >(undefined);
  const [flattenedSelectedRoute, setFlattenedSelectedRoute] = React.useState<
    FlattenedSelectedRoute | undefined
  >();
  const [isEditingTravelPlan, setIsEditingTravelPlan] = React.useState(false);
  const [savedTravelPlan, setSavedTravelPlan] = React.useState<
    SavedTravelPlanType | undefined
  >();

  const resetAllTravelLogs = React.useCallback(() => {
    setSelectedRoute({ index: 0 });
    setSelectedTravelMode(undefined);
    setSelectedFlightMode(undefined);
    setUnavailableTravelModes(new Set<google.maps.TravelMode>());
    setFlattenedSelectedRoute(undefined);
    setIsEditingTravelPlan(false);
    setSavedTravelPlan(undefined);
    setResponses([]);
    setFlightsResponses([]);
    setOriginValue('');
    setDestinationValue('');
    setSearchDirection(undefined);
    setDirectionsCollection(undefined);
    setSelectedFlight(undefined);
  }, []);

  return (
    <TravelContext.Provider
      value={{
        originValue,
        setOriginValue,
        destinationValue,
        setDestinationValue,
        searchDirection,
        setSearchDirection,
        directionsCollection,
        setDirectionsCollection,
        responses,
        setResponses,
        flightsResponses,
        setFlightsResponses,
        selectedTravelMode,
        setSelectedTravelMode,
        selectedFlightMode,
        setSelectedFlightMode,
        selectedRoute,
        setSelectedRoute,
        selectedFlight,
        setSelectedFlight,
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
