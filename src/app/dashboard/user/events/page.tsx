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
import EventDetailPanel from '@/components/userPage/event-details-panel.view';
import OverviewTravelHistoryReport from '@/components/userPage/overview-travel-history-report.view';
import { useUserContext } from '@/contexts/user-context';

export default function UserEvents() {
  const { events } = useUserContext();
  const [googleMaps, setGoogleMaps] = React.useState<
    typeof google.maps | undefined
  >(undefined);
  const [selectedTab, setSelectedTab] = React.useState<string>('all_events');

  const onSelectedTabChange = React.useCallback((tab: string) => {
    setSelectedTab(tab);
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
            <div className="flex p-4 pt-2 pb-0 border-b-2 border-muted gap-2">
              <div
                className={`py-1 px-4 rounded-t-sm font-semibold text-gray-500 bg-gray-50 hover:bg-muted/20 hover:text-primary cursor-pointer ${selectedTab === 'all_events' ? ' text-primary font-semibold bg-muted/50 hover:bg-muted/30' : ''}`}
                onClick={() => onSelectedTabChange('all_events')}
              >
                All Events
              </div>
              <div
                className={`py-1 px-4 rounded-t-sm  font-semibold text-gray-500 bg-gray-50 hover:bg-muted/20 hover:text-primary cursor-pointer ${selectedTab === 'reports' ? 'text-primary font-semibold bg-muted/50 hover:bg-muted/30' : ''}`}
                onClick={() => onSelectedTabChange('reports')}
              >
                Reports
              </div>
            </div>
            {selectedTab === 'reports' ? (
              <OverviewTravelHistoryReport events={events} />
            ) : (
              <div className="flex flex-1 gap-2 pt-4">
                <EventsListPanel extended />
                <div
                  className={`flex flex-1 flex-col overflow-y-auto`}
                  style={{ maxHeight: 'calc(90vh - 0.5rem)' }}
                >
                  <div className="h-fit">
                    <MapContainer />
                  </div>
                  <div className="flex">
                    <Separator orientation="vertical" />
                    <EventDetailPanel extended />
                  </div>
                </div>
              </div>
            )}
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
