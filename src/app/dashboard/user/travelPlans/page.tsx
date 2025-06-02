'use client';
import { Separator } from '@/components/ui/separator';

import Cookie from 'js-cookie';
import * as React from 'react';
import { redirect } from 'next/navigation';
import { UserRole } from '../../../../../services/api/type.api';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GoogleMapsContext } from '@/contexts/google-maps-context';
import { TravelProvider } from '@/contexts/travel-context';
import MapContainer from '@/components/userPage/maps/map.view';
import EventsListPanel from '@/components/userPage/events-list-panel.view';
import EventDetailsPanel from '@/components/userPage/event-details-panel.view';
import { TravelPlansPanel } from '@/components/userPage/maps/travel-plans-panel.view';

export default function UserEvents() {
  const [googleMaps, setGoogleMaps] = React.useState<
    typeof google.maps | undefined
  >(undefined);
  const [showTravelPlansPanel, setShowTravelPlansPanel] = React.useState(true);

  const toggleShowTravelPlansPanel = React.useCallback(() => {
    setShowTravelPlansPanel((prevState) => !prevState);
  }, []);

  React.useEffect(() => {
    const role = Cookie.get('role');
    if (role !== UserRole.USER) {
      redirect('/dashboard'); // Prevent access if not a regular user
    }
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        setGoogleMaps(google.maps);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={['marker']}
    >
      <GoogleMapsContext.Provider value={googleMaps}>
        {googleMaps ? (
          <TravelProvider>
            <div className="flex flex-1 gap-2 pt-2">
              <div className={`flex flex-1 flex-col`}>
                <div className="h-fit">
                  <MapContainer />
                </div>
                <div className="max-h-[50vh] flex">
                  <EventsListPanel />
                  <Separator orientation="vertical" />
                  <EventDetailsPanel
                    isTravelPlansPanelVisible={showTravelPlansPanel}
                    toggleTravelPlansPanel={toggleShowTravelPlansPanel}
                  />
                </div>
              </div>
              <div
                className={`${showTravelPlansPanel ? 'w-[27vw] border-l' : 'w-0 border-0'} h-[calc(100vh-4rem)] flex border-gray-200 transition-all duration-300 ease-in-out`}
              >
                {showTravelPlansPanel && <TravelPlansPanel />}
              </div>
            </div>
          </TravelProvider>
        ) : (
          <>
            <div className="flex flex-1 gap-2 pt-2">
              <div className="ml-4 h-full w-[30vw] max-w-3xl rounded-xl bg-muted/50" />
              <Separator orientation="vertical" />
              <div className="h-full w-full rounded-xl bg-muted/50" />
            </div>
          </>
        )}
      </GoogleMapsContext.Provider>
    </APIProvider>
  );
}
