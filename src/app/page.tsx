'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { getPublicEvents } from '../../services/api/event.api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EventType } from '../../services/api/type.api';
import { Clock, MapPin, ScanText, UserCog } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useRouter, redirect } from 'next/navigation';
import { UserRole } from '../../services/api/type.api';
import Cookie from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const [publicEvents, setPublicEvents] = React.useState<EventType[]>([]);

  React.useEffect(() => {
    const role = Cookie.get('role');
    if (role === UserRole.ADMIN || role === UserRole.USER) {
      redirect('/dashboard');
    } else {
      getPublicEvents().then((events) => setPublicEvents(events));
    }
  }, []);

  return (
    <>
      <p className="text-3xl font-bold p-4">Upcoming Events</p>
      <div className="flex flex-wrap gap-4 p-4">
        {publicEvents &&
          publicEvents.map((event, index) => {
            return (
              <Card
                key={index}
                className="max-w-72 h-fit border-muted shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-muted"
              >
                <div className={'flex gap-2 p-4 pb-2'}>
                  <div className="flex flex-col text-primary border-2 border-muted rounded-xl h-fit">
                    <p className="text-2xl font-extrabold self-center text-center w-full">
                      {format(parseISO(event.dateTime), 'd')}
                    </p>
                    <p className="text-lg font-medium px-4 bg-muted/20">
                      {format(parseISO(event.dateTime), 'MMM')}
                    </p>
                  </div>
                  <CardHeader className={'p-2'}>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>at {event.location.name}</CardDescription>
                  </CardHeader>
                </div>
                <CardContent className="flex flex-col gap-2 p-4 pt-2 border-t-2 border-dashed border-muted">
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
                    {event.creator?.name}
                  </div>
                  <div className={``}>
                    <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 mb-2">
                      <MapPin size={16} className="self-center" /> Address:{' '}
                    </div>
                    <p>{event.location.address}</p>
                  </div>
                  <div>
                    <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 mb-2">
                      <ScanText size={16} className="self-center" />{' '}
                      Description:
                    </div>
                    <p>{event?.description}</p>
                  </div>
                </CardContent>
                <CardFooter className={'justify-end gap-2 p-4 pt-0'}>
                  <Button
                    variant={'secondary'}
                    onClick={() => router.push('/explore/events/' + event.id)}
                  >
                    See more
                  </Button>
                  <Button
                    onClick={() =>
                      router.push('/login?eventRegister=' + event.id)
                    }
                  >
                    Register now!
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
      </div>
    </>
  );
}
