'use client';

import { LocationType } from '@/contexts/travel-context';
import { MarkerWithInfoWindow } from '@/components/userPage/maps/custom-marker.view';
import { Polyline } from '@/components/userPage/maps/polyline';
import * as React from 'react';

export interface FlightRouteProps {
  origin: LocationType;
  destination: LocationType;
}

export default function FlightRoute({ origin, destination }: FlightRouteProps) {
  return (
    <>
      <MarkerWithInfoWindow
        position={{
          lat: origin.airport?.lat ?? 0,
          lng: origin.airport?.lng ?? 0,
        }}
        description={`Departure: ${origin.name} (${origin.airport?.iataCode})`}
      />
      <MarkerWithInfoWindow
        position={{
          lat: destination.airport?.lat ?? 0,
          lng: destination.airport?.lng ?? 0,
        }}
        description={`Destination: ${destination.name} (${destination.airport?.iataCode})`}
      />
      <Polyline
        pathCoordinates={[
          {
            lat: origin.airport?.lat ?? 0,
            lng: origin.airport?.lng ?? 0,
          },
          {
            lat: destination.airport?.lat ?? 0,
            lng: destination.airport?.lng ?? 0,
          },
        ]}
        strokeColor={'#b833ff'}
        strokeOpacity={1}
        strokeWeight={4}
        geodesic={true}
      />
    </>
  );
}
