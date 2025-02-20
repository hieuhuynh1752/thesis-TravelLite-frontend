'use client';

import React from 'react';
import { useTravelContext } from '@/contexts/travel-context';
import RouteOptionList from './route-option-list.view';
import { Circle, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const RoutesPanel: React.FC = () => {
  const { setSearchDirection, responses } = useTravelContext();
  const [origin, setOrigin] = React.useState<string>('');
  const [destination, setDestination] = React.useState<string>('');

  console.log(responses);
  return (
    <div className="">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col space-y-2 grow">
          {/* Starting Point Input */}
          <div className="flex items-center border rounded-lg shadow-sm p-2">
            <div className="text-gray-500 text-center px-2">
              <Circle size={16} />
            </div>
            <input
              type="text"
              placeholder="Choose starting point, or click on the map"
              className="flex-1 outline-none border-none placeholder-gray-500"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>

          {/* Destination Input */}
          <div className="flex items-center border rounded-lg shadow-sm p-2 gap-1">
            <div className="text-gray-500 px-2 text-center">
              <MapPin size={16} />
            </div>
            <input
              type="text"
              placeholder="Choose destination..."
              className="flex-1 outline-none border-none placeholder-gray-500"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            className=" w-8 h-8 self-center rounded justify-items-center"
            onClick={() => {
              if (!origin || !destination) {
                alert('Please enter both origin and destination.');
                return;
              } else {
                setSearchDirection({ origin, destination });
              }
            }}
          >
            <Search size={16} />
          </Button>
        </div>
      </div>

      <RouteOptionList />

      {/* Footer Section */}
      <div className="p-4 border-t text-sm text-gray-500">
        <p>Delays: Moderate traffic in this area</p>
      </div>
    </div>
  );
};
