'use client';
import { SidebarLeft } from '@/components/sidebar-left';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import Cookie from 'js-cookie';
import * as React from 'react';
import { redirect } from 'next/navigation';
import { UserRole } from '../../../../../services/api/type.api';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GoogleMapsContext } from '@/contexts/google-maps-context';
import { TravelProvider } from '@/contexts/travel-context';
import MapContainer from '@/components/userPage/maps/map-container.view';
import EventsListPanel from '@/components/userPage/events-list-panel.view';
import EventDetailPanel from '@/components/userPage/event-details-panel.view';

export default function UserEvents() {
  const [googleMaps, setGoogleMaps] = React.useState<
    typeof google.maps | undefined
  >(undefined);

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
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="p-2 bg-gray-100 rounded-md">
              <a>Events</a>
            </div>
          </div>
        </header>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMapsContext.Provider value={googleMaps}>
            <div className="flex flex-1 pr-4">
              {googleMaps ? (
                <TravelProvider>
                  <EventsListPanel />
                  <Separator orientation="vertical" />
                  <EventDetailPanel />
                  <div className="relative flex-1">
                    <MapContainer />
                  </div>
                </TravelProvider>
              ) : (
                <>
                  <div className="ml-4 h-full w-[30vw] max-w-3xl rounded-xl bg-muted/50" />
                  <Separator orientation="vertical" />
                  <div className="h-full w-full rounded-xl bg-muted/50" />
                </>
              )}
            </div>
          </GoogleMapsContext.Provider>
        </APIProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
