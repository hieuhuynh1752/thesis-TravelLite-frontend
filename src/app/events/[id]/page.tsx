'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EventType } from '../../../../services/api/type.api';
import { getSinglePublicEvent } from '../../../../services/api/event.api';
import { format, parseISO } from 'date-fns';
import {
  Clock,
  MapPin,
  ScanText,
  Share,
  UserCog,
  ClipboardPenLine,
} from 'lucide-react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { GoogleMapsContext } from '@/contexts/google-maps-context';
import { MarkerWithInfoWindow } from '@/components/userPage/maps/custom-marker.view';
import { useRouter } from 'next/navigation';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = React.useState<EventType>();
  const [googleMaps, setGoogleMaps] = React.useState<
    typeof google.maps | undefined
  >(undefined);

  React.useEffect(() => {
    getSinglePublicEvent(Number.parseInt(params.id as string)).then((data) =>
      setEvent(data),
    );
  }, [params.id]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        setGoogleMaps(google.maps);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div>
        <div className="p-4 items-center border-b-2 border-muted/50 border-dashed">
          <div className="flex flex-wrap justify-between w-full">
            <div className="flex gap-4 items-center">
              <div className="flex flex-col text-primary border-2 border-muted rounded-xl h-fit">
                <p className="text-2xl font-extrabold self-center text-center w-full">
                  {event?.dateTime ? format(parseISO(event.dateTime), 'd') : ''}
                </p>
                <p className="text-lg font-medium px-4 bg-muted/20">
                  {event?.dateTime
                    ? format(parseISO(event.dateTime), 'MMM')
                    : ''}
                </p>
              </div>
              <div>
                <p className="font-bold text-3xl">{event?.title}</p>
                <p>at {event?.location.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant={'secondary'}>
                <Share />
                Share
              </Button>
              <Button>
                <ClipboardPenLine />
                Register
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4">
          <div
            className={
              'w-full md:flex-1 md:min-w-[calc(50%-0.5rem)] flex flex-col gap-2'
            }
          >
            <div className={`flex gap-2`}>
              <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20">
                <Clock size={16} className="self-center" />
                {'Time: '}
              </div>
              {event ? format(parseISO(event.dateTime!), 'hh:mm a') : ''}
            </div>
            <div className={`flex gap-2`}>
              <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20">
                <UserCog size={16} className="self-center" /> Host:{' '}
              </div>
              {event?.creator?.name}
            </div>
            <div className={``}>
              <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 mb-2">
                <MapPin size={16} className="self-center" /> Address:{' '}
              </div>
              <p>{event?.location.address}</p>
            </div>
            <div>
              <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 mb-2">
                <ScanText size={16} className="self-center" /> Description:
              </div>
              <p>{event?.description}</p>
            </div>
          </div>
          <div
            className={
              'w-full md:flex-1 md:min-w-[calc(50%-0.5rem)] h-80vh bg-gray-300'
            }
          >
            <APIProvider
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
              libraries={['marker']}
            >
              <GoogleMapsContext.Provider value={googleMaps}>
                {googleMaps && event ? (
                  <div className="h-fit">
                    <div style={{ width: '100%', height: '40vw' }}>
                      <Map
                        defaultCenter={{
                          lat: event.location?.latitude ?? 52.377956,
                          lng: event.location.longtitude ?? 4.89707,
                        }}
                        defaultZoom={12}
                        gestureHandling={'greedy'}
                        mapId={'bf51a910020fa25a'}
                      >
                        {event.location && (
                          <MarkerWithInfoWindow
                            position={{
                              lat: event.location.latitude,
                              lng: event.location.longtitude,
                            }}
                            description={event.location.name}
                          />
                        )}
                      </Map>
                    </div>
                  </div>
                ) : null}
              </GoogleMapsContext.Provider>
            </APIProvider>
          </div>
        </div>
      </div>
    </>
  );
}
