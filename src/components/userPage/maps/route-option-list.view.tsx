'use client';
import * as React from 'react';
import { useTravelContext } from '@/contexts/travel-context';
import { useGoogleMaps } from '@/contexts/google-maps-context';
import RouteOptionItem from './route-option-item.view';
import { Bike, BusFront, Car, Footprints, PlaneTakeoff } from 'lucide-react';

const RouteOptionList: React.FC = () => {
  const { TravelMode } = useGoogleMaps();

  const {
    responses,
    unavailableTravelModes,
    selectedTravelMode,
    setSelectedTravelMode,
  } = useTravelContext();

  React.useEffect(() => {
    if (
      TravelMode &&
      responses.length > 0 &&
      selectedTravelMode === undefined
    ) {
      setSelectedTravelMode(TravelMode.DRIVING);
    }
  }, [TravelMode, responses, selectedTravelMode, setSelectedTravelMode]);

  return (
    <>
      <div className="flex items-center justify-around">
        {TravelMode && (
          <>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 ${selectedTravelMode === TravelMode.DRIVING ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100' : selectedTravelMode && !unavailableTravelModes.has(TravelMode.DRIVING) ? 'hover:bg-gray-100 border-white text-gray-600' : 'bg-gray-300 text-gray-50 border-none'}`}
              onClick={() => setSelectedTravelMode(TravelMode.DRIVING)}
              disabled={
                selectedTravelMode === undefined ||
                unavailableTravelModes.has(TravelMode.DRIVING)
              }
            >
              <Car size={24} />
            </button>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 ${selectedTravelMode === TravelMode.TRANSIT ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100' : selectedTravelMode && !unavailableTravelModes.has(TravelMode.TRANSIT) ? 'hover:bg-gray-100 border-white text-gray-600' : 'bg-gray-300 text-gray-50 border-none'}`}
              onClick={() => setSelectedTravelMode(TravelMode.TRANSIT)}
              disabled={
                selectedTravelMode === undefined ||
                unavailableTravelModes.has(TravelMode.TRANSIT)
              }
            >
              <BusFront />
            </button>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 ${selectedTravelMode === TravelMode.BICYCLING ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100' : selectedTravelMode && !unavailableTravelModes.has(TravelMode.BICYCLING) ? 'hover:bg-gray-100 border-white text-gray-600' : 'bg-gray-300 text-gray-50 border-none'}`}
              onClick={() => setSelectedTravelMode(TravelMode.BICYCLING)}
              disabled={
                selectedTravelMode === undefined ||
                unavailableTravelModes.has(TravelMode.BICYCLING)
              }
            >
              <Bike />
            </button>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 ${selectedTravelMode === TravelMode.WALKING ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100' : selectedTravelMode && !unavailableTravelModes.has(TravelMode.WALKING) ? 'hover:bg-gray-100 border-white text-gray-600' : 'bg-gray-300 text-gray-50 border-none'}`}
              onClick={() => setSelectedTravelMode(TravelMode.WALKING)}
              disabled={
                selectedTravelMode === undefined ||
                unavailableTravelModes.has(TravelMode.WALKING)
              }
            >
              <Footprints />
            </button>
            <button
              className={`p-2 bg-gray-300 text-gray-50 w-10 rounded `}
              onClick={() => {}}
              disabled
            >
              <PlaneTakeoff />
            </button>
          </>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto bg-muted">
        <RouteOptionItem travelMode={selectedTravelMode} />
      </div>
    </>
  );
};
export default RouteOptionList;
