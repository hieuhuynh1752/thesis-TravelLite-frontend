'use client';

import * as React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import Directions from './direction.view';
import { useTravelContext } from '@/contexts/travel-context';
import { useUserContext } from '@/contexts/user-context';
import { MarkerWithInfoWindow } from '@/components/userPage/maps/custom-marker.view';
import Route from '@/components/userPage/maps/route';
import { RoutesApi } from '@/components/userPage/maps/routes-api';

const MapContainer: React.FC = () => {
  const { searchDirection, savedTravelPlan, directionsCollection } =
    useTravelContext();
  const { selectedEvent } = useUserContext();
  const apiClient = new RoutesApi(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  );
  const appearance = {
    walkingPolylineColor: '#D8EAD9',
    bicyclingPolylineColor: '#81C784',
    transitFallbackPolylineColor: '#2E7D32',
    defaultPolylineColor: '#9a1e45',
    stepMarkerFillColor: '#fff',
    stepMarkerBorderColor: '#000000',
  };

  console.log(directionsCollection);

  const location = React.useMemo(() => {
    if (
      (!searchDirection ||
        (!searchDirection.arrivalTime && !searchDirection.departureTime)) &&
      selectedEvent &&
      selectedEvent.location &&
      !savedTravelPlan
    ) {
      return {
        lat: selectedEvent?.location.latitude,
        lng: selectedEvent?.location.longtitude,
      };
    }
  }, [selectedEvent, searchDirection, savedTravelPlan]);

  return (
    <div className="flex flex-col items-center">
      {/* Input fields for origin and destination */}
      <div style={{ width: '100%', height: '40vh' }}>
        <Map
          defaultCenter={{
            lat: location?.lat ?? 52.377956,
            lng: location?.lng ?? 4.89707,
          }}
          defaultZoom={12}
          gestureHandling={'greedy'}
          mapId={'bf51a910020fa25a'}
        >
          {location && (
            <>
              <MarkerWithInfoWindow
                position={location}
                description={selectedEvent?.location.name}
              />
            </>
          )}
          {searchDirection && (
            <Directions
              origin={searchDirection.origin}
              destination={searchDirection.destination}
              arrivalTime={searchDirection.arrivalTime}
              departureTime={searchDirection.departureTime}
            />
          )}
          {(!searchDirection ||
            (!searchDirection.arrivalTime && !searchDirection.departureTime)) &&
            directionsCollection &&
            directionsCollection.map((direction, index) => {
              return (
                <Route
                  key={index}
                  // origin={direction.origin}
                  // destination={direction.destination}
                  // travelMode={direction.travelMode}
                  // plainRoute={direction.selectedRoute}
                  apiClient={apiClient}
                  origin={
                    direction.selectedRoute?.routes?.routes[0].legs[0]
                      .start_location
                  }
                  destination={
                    direction.selectedRoute?.routes?.routes[0].legs[0]
                      .end_location
                  }
                  routeOptions={{
                    travelMode:
                      direction.travelMode === google.maps.TravelMode.DRIVING
                        ? 'DRIVE'
                        : direction.travelMode ===
                            google.maps.TravelMode.WALKING
                          ? 'WALK'
                          : direction.travelMode ===
                              google.maps.TravelMode.BICYCLING
                            ? 'BICYCLE'
                            : 'DRIVE',
                    computeAlternativeRoutes: false,
                  }}
                  appearance={appearance}
                />
              );
            })}
        </Map>
      </div>
    </div>
  );
};

export default MapContainer;
