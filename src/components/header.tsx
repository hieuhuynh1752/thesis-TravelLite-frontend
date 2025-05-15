'use client';
import * as React from 'react';
import { SidebarLeft } from '@/components/sidebar-left';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import logo_travellite from '@/img/logo_travellite.png';
import { ChevronRight } from 'lucide-react';
import Cookie from 'js-cookie';
import { UserRole } from '../../services/api/type.api';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import CreateOrUpdateEventDialog from '@/components/userPage/create-event-dialog.view';
import { GoogleMapsContext } from '@/contexts/google-maps-context';
import { TravelProvider } from '@/contexts/travel-context';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function HeaderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathName = usePathname();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [shouldShowHeader, setShouldShowHeader] =
    React.useState<boolean>(false);
  const [googleMaps, setGoogleMaps] = React.useState<
    typeof google.maps | undefined
  >(undefined);
  const currentPageInfo = React.useMemo(() => {
    const breadcrumbs = pathName.split('/');
    if (breadcrumbs[1] === 'dashboard') {
      if (!!breadcrumbs[3]) {
        if (breadcrumbs[3] === 'events') {
          return 'Events';
        }
        if (breadcrumbs[3] === 'travelPlans') {
          return 'Travel Plans';
        }
        if (breadcrumbs[3] === 'reports') {
          return 'Reports';
        }
      } else return 'Home';
    } else return breadcrumbs[1];
  }, [pathName]);

  React.useEffect(() => {
    if (pathName !== '/login' && pathName !== '/register') {
      setShouldShowHeader(true);
      const role = Cookie.get('role');
      if (role === UserRole.USER || role === UserRole.ADMIN) {
        setIsLoggedIn(true);
        const interval = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps) {
            setGoogleMaps(google.maps);
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      } else {
        setIsLoggedIn(false);
      }
    } else {
      setShouldShowHeader(false);
      setIsLoggedIn(false);
    }
  }, [pathName]);

  return (
    <SidebarProvider>
      {isLoggedIn && <SidebarLeft />}
      <SidebarInset>
        {shouldShowHeader && (
          <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background z-10 border-b-2 border-muted/30">
            <div className="flex justify-between w-full">
              {isLoggedIn ? (
                <>
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
                      <a className="capitalize">{currentPageInfo} </a>
                    </div>
                  </div>
                  {currentPageInfo === 'Events' && googleMaps && (
                    <APIProvider
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                      libraries={['marker']}
                    >
                      <GoogleMapsContext value={googleMaps}>
                        <TravelProvider>
                          <div className="pr-4">
                            <CreateOrUpdateEventDialog />
                          </div>
                        </TravelProvider>
                      </GoogleMapsContext>
                    </APIProvider>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-1 items-center gap-2 px-3">
                    <a
                      className="hover:cursor-pointer"
                      onClick={() => router.push('/')}
                    >
                      <Image
                        src={logo_travellite}
                        alt="Image"
                        className=" h-fit w-28 md:p-10 dark:brightness-[0.2] dark:grayscale"
                        width={192}
                        style={{ padding: 0 }}
                      />
                    </a>
                  </div>
                  <div className="pr-4">
                    <Button onClick={() => router.push('/login')}>Login</Button>
                  </div>
                </>
              )}
            </div>
          </header>
        )}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
