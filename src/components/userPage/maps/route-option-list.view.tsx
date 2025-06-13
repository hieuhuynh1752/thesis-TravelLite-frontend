'use client';
import * as React from 'react';
import { useTravelContext } from '@/contexts/travel-context';
import { useGoogleMaps } from '@/contexts/google-maps-context';
import RouteOptionItems from './route-option-item.view';
import { Bike, BusFront, Car, Footprints, PlaneTakeoff } from 'lucide-react';

const RouteOptionList: React.FC = () => {
  const { TravelMode } = useGoogleMaps();

  const {
    responses,
    unavailableTravelModes,
    selectedTravelMode,
    setSelectedTravelMode,
    selectedFlightMode,
    setSelectedFlightMode,
  } = useTravelContext();

  React.useEffect(() => {
    if (
      TravelMode &&
      responses.length > 0 &&
      selectedTravelMode === undefined &&
      selectedFlightMode === undefined
    ) {
      setSelectedTravelMode(TravelMode.DRIVING);
    }
  }, [
    TravelMode,
    responses,
    selectedTravelMode,
    setSelectedTravelMode,
    selectedFlightMode,
  ]);

  return (
    <>
      <div className="flex items-center gap-2 justify-around pb-2 px-2 border-b border-gray-200">
        {TravelMode && (
          <>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 flex-grow justify-items-center
              ${
                selectedTravelMode === TravelMode.DRIVING
                  ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100'
                  : selectedTravelMode &&
                      !unavailableTravelModes.has(TravelMode.DRIVING)
                    ? 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
                    : selectedFlightMode === undefined
                      ? 'bg-gray-300 text-gray-50 border-none'
                      : 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
              }`}
              onClick={() => {
                setSelectedTravelMode(TravelMode.DRIVING);
                setSelectedFlightMode?.((prevState) => {
                  if (prevState !== undefined) {
                    return false;
                  } else return undefined;
                });
              }}
              disabled={
                (selectedTravelMode === undefined &&
                  selectedFlightMode === undefined) ||
                unavailableTravelModes.has(TravelMode.DRIVING)
              }
            >
              <Car size={24} />
            </button>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 flex-grow justify-items-center
              ${
                selectedTravelMode === TravelMode.TRANSIT
                  ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100'
                  : selectedTravelMode &&
                      !unavailableTravelModes.has(TravelMode.TRANSIT)
                    ? 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
                    : selectedFlightMode === undefined
                      ? 'bg-gray-300 text-gray-50 border-none'
                      : 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
              }`}
              onClick={() => {
                setSelectedTravelMode(TravelMode.TRANSIT);
                setSelectedFlightMode?.((prevState) => {
                  if (prevState !== undefined) {
                    return false;
                  } else return undefined;
                });
              }}
              disabled={
                (selectedTravelMode === undefined &&
                  selectedFlightMode === undefined) ||
                unavailableTravelModes.has(TravelMode.TRANSIT)
              }
            >
              <BusFront />
            </button>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 flex-grow justify-items-center
              ${
                selectedTravelMode === TravelMode.BICYCLING
                  ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100'
                  : selectedTravelMode &&
                      !unavailableTravelModes.has(TravelMode.BICYCLING)
                    ? 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
                    : selectedFlightMode === undefined
                      ? 'bg-gray-300 text-gray-50 border-none'
                      : 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
              }`}
              onClick={() => {
                setSelectedTravelMode(TravelMode.BICYCLING);
                setSelectedFlightMode?.((prevState) => {
                  if (prevState !== undefined) {
                    return false;
                  } else return undefined;
                });
              }}
              disabled={
                (selectedTravelMode === undefined &&
                  selectedFlightMode === undefined) ||
                unavailableTravelModes.has(TravelMode.BICYCLING)
              }
            >
              <Bike />
            </button>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 flex-grow justify-items-center
              ${
                selectedTravelMode === TravelMode.WALKING
                  ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100'
                  : selectedTravelMode &&
                      !unavailableTravelModes.has(TravelMode.WALKING)
                    ? 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
                    : selectedFlightMode === undefined
                      ? 'bg-gray-300 text-gray-50 border-none'
                      : 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
              }`}
              onClick={() => {
                setSelectedTravelMode(TravelMode.WALKING);
                setSelectedFlightMode?.((prevState) => {
                  if (prevState !== undefined) {
                    return false;
                  } else return undefined;
                });
              }}
              disabled={
                (selectedTravelMode === undefined &&
                  selectedFlightMode === undefined) ||
                unavailableTravelModes.has(TravelMode.WALKING)
              }
            >
              <Footprints />
            </button>
            <button
              className={`p-2 pb-1 w-10 rounded-sm border-b-4 flex-grow justify-items-center
              ${
                selectedFlightMode
                  ? 'border-green-700 text-green-700 bg-green-50 hover:bg-green-100'
                  : selectedTravelMode && selectedFlightMode === false
                    ? 'hover:bg-gray-100 border-white hover:border-gray-100 text-gray-600'
                    : selectedFlightMode === undefined
                      ? 'bg-gray-300 text-gray-50 border-none'
                      : ''
              }`}
              onClick={() => {
                setSelectedFlightMode?.(true);
                setSelectedTravelMode(undefined);
              }}
              disabled={selectedFlightMode === undefined}
            >
              <PlaneTakeoff />
            </button>
          </>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        <RouteOptionItems />
      </div>
    </>
  );
};
export default RouteOptionList;
