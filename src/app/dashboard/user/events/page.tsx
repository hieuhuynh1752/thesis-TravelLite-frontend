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
import MapContainer from '@/components/userPage/maps/map.view';
import EventsListPanel from '@/components/userPage/events-list-panel.view';
import EventDetailPanel from '@/components/userPage/event-details-panel.view';
import RoutesPanel from '@/components/userPage/maps/routes-panel.view';
import CreateOrUpdateEventDialog from '@/components/userPage/create-event-dialog.view';
import Image from 'next/image';
import logo_travellite from '@/img/logo_travellite.png';
import { ChevronRight } from 'lucide-react';

export default function UserEvents() {
  const [googleMaps, setGoogleMaps] = React.useState<
    typeof google.maps | undefined
  >(undefined);
  const [showRoutePanel, setShowRoutePanel] = React.useState(true);

  const toggleShowRoutePanel = React.useCallback(() => {
    setShowRoutePanel((prevState) => !prevState);
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
        <SidebarProvider>
          <SidebarLeft />
          <SidebarInset>
            {googleMaps ? (
              <TravelProvider>
                <header className="sticky top-0 flex h-14 border-b-2 border-gray-200 shrink-0 items-center gap-2 bg-background">
                  <div className="flex justify-between w-full">
                    <div className="flex flex-1 items-center gap-2 px-3">
                      <SidebarTrigger />
                      <Separator orientation="vertical" className="mr-2 h-4" />
                      <Image
                        src={logo_travellite}
                        alt="Image"
                        className=" h-fit w-28 md:p-10 dark:brightness-[0.2] dark:grayscale"
                        width={192}
                        style={{ padding: 0 }}
                      />
                      <div className={'flex gap-2 items-center'}>
                        <ChevronRight size={16} />
                        <a>Events </a>
                      </div>
                    </div>
                    <div className="pr-4">
                      <CreateOrUpdateEventDialog />
                    </div>
                  </div>
                </header>
                <div className="flex flex-1 gap-2 pt-2">
                  <div className={`flex flex-1 flex-col`}>
                    <div className="h-fit">
                      <MapContainer />
                    </div>
                    <div className="max-h-[50vh] flex">
                      <EventsListPanel />
                      <Separator orientation="vertical" />
                      <EventDetailPanel
                        isRoutesPanelVisible={showRoutePanel}
                        toggleRoutesPanel={toggleShowRoutePanel}
                      />
                    </div>
                  </div>
                  <div
                    className={`${showRoutePanel ? 'w-[27vw] border-l-2' : 'w-0 border-0'} h-[calc(100vh-4rem)] flex border-muted transition-all duration-300 ease-in-out`}
                  >
                    {showRoutePanel && <RoutesPanel />}
                  </div>
                </div>
              </TravelProvider>
            ) : (
              <>
                <header className="sticky top-0 flex h-14 border-b-2 border-gray-200 shrink-0 items-center gap-2 bg-background">
                  <div className="flex justify-between w-full">
                    <div className="flex flex-1 items-center gap-2 px-3">
                      <SidebarTrigger />
                      <Separator orientation="vertical" className="mr-2 h-4" />
                      <Image
                        src={logo_travellite}
                        alt="Image"
                        className=" h-fit w-28 md:p-10 dark:brightness-[0.2] dark:grayscale"
                        width={192}
                        style={{ padding: 0 }}
                      />
                      <div className={'flex gap-2 items-center'}>
                        <ChevronRight size={16} />
                        <a>Events </a>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="flex flex-1 gap-2 pt-2">
                  <div className="ml-4 h-full w-[30vw] max-w-3xl rounded-xl bg-muted/50" />
                  <Separator orientation="vertical" />
                  <div className="h-full w-full rounded-xl bg-muted/50" />
                </div>
              </>
            )}
          </SidebarInset>
        </SidebarProvider>
      </GoogleMapsContext.Provider>
    </APIProvider>
  );
}
