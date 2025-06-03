'use client';

import * as React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import Directions from './direction.view';
import { isFlight, useTravelContext } from '@/contexts/travel-context';
import { useUserContext } from '@/contexts/user-context';
import { MarkerWithInfoWindow } from '@/components/userPage/maps/custom-marker.view';
import Route from '@/components/userPage/maps/route';
import FlightRoute from '@/components/userPage/maps/flight-route';

const MapContainer: React.FC = () => {
  const {
    searchDirection,
    savedTravelPlan,
    directionsCollection,
    selectedFlightMode,
  } = useTravelContext();
  const { selectedEvent } = useUserContext();

  const appearance = {
    walkingPolylineColor: '#D8EAD9',
    bicyclingPolylineColor: '#81C784',
    transitFallbackPolylineColor: '#2E7D32',
    defaultPolylineColor: '#9a1e45',
    stepMarkerFillColor: '#fff',
    stepMarkerBorderColor: '#000000',
  };

  console.log(searchDirection);

  const location = React.useMemo(() => {
    if (
      (!searchDirection ||
        (!searchDirection.origin && !searchDirection.destination)) &&
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
            (!searchDirection.origin && !searchDirection.destination)) &&
            directionsCollection &&
            directionsCollection.map((direction, index) => {
              if (!direction.selectedRoute?.routes?.routes) {
                return direction.origin && direction.destination ? (
                  <FlightRoute
                    key={index}
                    origin={direction.origin}
                    destination={direction.destination}
                  />
                ) : null;
              }
              return (
                <Route
                  key={index}
                  route={direction.selectedRoute?.routes?.routes[0]}
                  origin={
                    direction.selectedRoute?.routes?.routes[0].legs[0]
                      .start_location
                  }
                  destination={
                    direction.selectedRoute?.routes?.routes[0].legs[0]
                      .end_location
                  }
                  routeOptions={{
                    travelMode: direction.travelMode,
                    computeAlternativeRoutes: false,
                  }}
                  appearance={appearance}
                />
              );
            })}
          {selectedFlightMode &&
            searchDirection?.origin &&
            searchDirection.destination && (
              <FlightRoute
                origin={searchDirection.origin}
                destination={searchDirection.destination}
              />
            )}
          {!searchDirection && savedTravelPlan && isFlight(savedTravelPlan) && (
            <FlightRoute
              origin={savedTravelPlan.routeDetails.origin}
              destination={savedTravelPlan.routeDetails.destination}
            />
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapContainer;
