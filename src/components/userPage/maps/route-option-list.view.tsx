'use client';
import * as React from 'react';
import { useTravelContext } from '@/contexts/travel-context';
import { useGoogleMaps } from '@/contexts/google-maps-context';
import RouteOptionItem from './route-option-item.view';

const RouteOptionList: React.FC = () => {
  const { responses } = useTravelContext();
  const { TravelMode } = useGoogleMaps();

  const [travelMode, setTravelMode] = React.useState<google.maps.TravelMode>(
    TravelMode.DRIVING,
  );

  if (!responses.length) {
    return null;
  }
  return (
    <>
      <div className="flex items-center justify-evenly p-4 border-b">
        <button
          className={`p-2 hover:bg-gray-100 w-10 rounded ${travelMode === TravelMode.DRIVING ? 'bg-green-500 text-white hover:bg-green-700' : 'bg-white'}`}
          onClick={() => setTravelMode(TravelMode.DRIVING)}
        >
          <i className="fas fa-car"></i>
        </button>
        <button
          className={`p-2 hover:bg-gray-100 w-10 rounded ${travelMode === TravelMode.TRANSIT ? 'bg-green-500 text-white hover:bg-green-700' : 'bg-white'}`}
          onClick={() => setTravelMode(TravelMode.TRANSIT)}
        >
          <i className="fas fa-bus"></i>
        </button>
        <button
          className={`p-2 hover:bg-gray-100 w-10 rounded ${travelMode === TravelMode.BICYCLING ? 'bg-green-500 text-white hover:bg-green-700' : 'bg-white'}`}
          onClick={() => setTravelMode(TravelMode.BICYCLING)}
        >
          <i className="fas fa-bicycle"></i>
        </button>
        <button
          className={`p-2 hover:bg-gray-100 w-10 rounded ${travelMode === TravelMode.WALKING ? 'bg-green-500 text-white hover:bg-green-700' : 'bg-white'}`}
          onClick={() => setTravelMode(TravelMode.WALKING)}
        >
          <i className="fas fa-walking"></i>
        </button>
        <button
          className={`p-2 hover:bg-gray-100 w-10 rounded `}
          onClick={() => {}}
        >
          <i className="fas fa-plane"></i>
        </button>
      </div>
      <div className="overflow-auto min-h-[70vh]">
        <RouteOptionItem travelMode={travelMode} />
      </div>
    </>
  );
};
export default RouteOptionList;
