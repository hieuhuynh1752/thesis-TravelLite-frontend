'use client';

import * as React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import Directions from './direction.view';
import { useTravelContext } from '@/contexts/travel-context';
import { useUserContext } from '@/contexts/user-context';
import { MarkerWithInfoWindow } from '@/components/userPage/maps/custom-marker.view';

const MapContainer: React.FC = () => {
  const { searchDirection, savedTravelPlan } = useTravelContext();
  const { selectedEvent } = useUserContext();

  const location = React.useMemo(() => {
    if (
      !searchDirection &&
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
          disableDefaultUI
        >
          {location && !searchDirection && (
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
            />
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapContainer;
