'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { getPublicEvents } from '../../../services/api/event.api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EventType } from '../../../services/api/type.api';
import { CheckCircle, Clock, MapPin, ScanText, UserCog } from 'lucide-react';
import { format, isFuture, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/user-context';
import { getUserById } from '../../../services/api/user.api';
import { getMe } from '../../../services/api/auth.api';
import { participantSubscribeToEvent } from '../../../services/api/event-participant.api';
import { toast } from 'sonner';

export default function ExplorePage() {
  const router = useRouter();
  const { user, setUser, setEventsAsParticipantList } = useUserContext();
  const [userId, setUserId] = React.useState<number | undefined>();
  const [publicEvents, setPublicEvents] = React.useState<EventType[]>([]);

  const handleGetUserData = React.useCallback(() => {
    if (!!userId) {
      getUserById(userId).then((value) => {
        setUser?.({
          id: value.id,
          name: value.name,
          email: value.email,
          role: value.role,
        });
        setEventsAsParticipantList?.(value.eventsParticipated);
      });
    }
  }, [userId, setUser, setEventsAsParticipantList]);

  const handleRegisterToEvent = React.useCallback(
    (event: EventType) => {
      if (!!userId && event.id) {
        participantSubscribeToEvent({ userId, eventId: event.id });
        getPublicEvents().then((events) => setPublicEvents(events));
        toast(`You have registered to the event: ${event.title}`);
      }
    },
    [userId],
  );

  React.useEffect(() => {
    getPublicEvents().then((events) => setPublicEvents(events));
    getMe().then((userId) => setUserId(userId));
    handleGetUserData();
  }, [handleGetUserData]);

  return (
    <div className="mx-auto px-4 py-4 md:px-8">
      <h2 className="mb-4 text-2xl font-bold sm:text-4xl">
        Upcoming Public Events
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {publicEvents &&
          publicEvents
            .filter((event) => isFuture(event.dateTime))
            .map((event, index) => {
              return (
                <div
                  key={index}
                  className="w-full sm:w-[22rem] md:w-[20rem] lg:w-[22rem] xl:w-[24rem]"
                >
                  <Card className="h-full border-muted shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-muted flex flex-col">
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
                        <CardDescription>
                          at {event.location.name}
                        </CardDescription>
                      </CardHeader>
                    </div>
                    <CardContent className="flex flex-col gap-2 p-4 pt-2 border-t-2 border-dashed border-muted">
                      <div className={`flex gap-2`}>
                        <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20">
                          <Clock size={16} className="self-center" />
                          {'Time: '}
                        </div>
                        {event
                          ? format(parseISO(event.dateTime!), 'hh:mm a')
                          : ''}
                      </div>
                      <div className={`flex gap-2`}>
                        <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20">
                          <UserCog size={16} className="self-center" />{' '}
                          Host:{' '}
                        </div>
                        {event.creator?.name}
                      </div>
                      <div className={``}>
                        <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 mb-2">
                          <MapPin size={16} className="self-center" />{' '}
                          Address:{' '}
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
                    <CardFooter
                      className={'justify-end gap-2 p-4 pt-0 mt-auto'}
                    >
                      <Button
                        variant={'secondary'}
                        onClick={() =>
                          router.push('/explore/events/' + event.id)
                        }
                      >
                        See more
                      </Button>
                      {event.participants.find(
                        (participant) => participant.user.id === user?.id,
                      ) ? (
                        <div
                          className={
                            'flex gap-2 items-center text-sm font-bold text-primary border-primary border-dashed border rounded p-2 '
                          }
                        >
                          <CheckCircle size={16} /> Registered
                        </div>
                      ) : (
                        <Button onClick={() => handleRegisterToEvent(event)}>
                          Register now!
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
      </div>
    </div>
  );
}
