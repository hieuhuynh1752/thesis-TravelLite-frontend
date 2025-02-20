'use client';

import * as React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import Directions from './direction.view';
import { useTravelContext } from '@/contexts/travel-context';

const MapContainer: React.FC = () => {
  const { searchDirection } = useTravelContext();

  return (
    <div className="flex flex-col items-center">
      {/* Input fields for origin and destination */}
      <div style={{ width: '100%', height: 'calc(100vh - 90px)' }}>
        <Map
          defaultCenter={{ lat: 52.377956, lng: 4.89707 }}
          defaultZoom={10}
          gestureHandling={'greedy'}
        >
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

export default React.memo(MapContainer);
