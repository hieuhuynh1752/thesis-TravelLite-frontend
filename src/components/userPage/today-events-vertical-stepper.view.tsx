'use client';

import * as React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { EventType } from '../../../services/api/type.api';
import { Clock, MapPin } from 'lucide-react';
import { useUserContext } from '@/contexts/user-context';
import { redirect } from 'next/navigation';

const TodayEventsVerticalStepper = () => {
  const [todayEvents, setTodayEvents] = React.useState<EventType[]>([]);
  const { eventsAsParticipantList, setSelectedEvent } = useUserContext();

  const handleSetSelectedEvents = React.useCallback(
    (event: EventType) => {
      setSelectedEvent?.(event);
      redirect('/dashboard/user/events');
    },
    [setSelectedEvent],
  );

  React.useEffect(() => {
    if (eventsAsParticipantList) {
      let filteredEvents = eventsAsParticipantList
        .map((p) => p.event)
        .filter(
          (event) => isToday(event.dateTime) || event.occurrence === 'DAILY',
        );

      filteredEvents = filteredEvents.sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );

      setTodayEvents(filteredEvents);
    }
  }, [eventsAsParticipantList]);

  return todayEvents.length === 0 ? (
    <p className="text-muted-foreground">No events scheduled for today.</p>
  ) : (
    <ol className="overflow-hidden space-y-4 pb-4">
      {todayEvents.map((event, index) => (
        <li
          key={event.id}
          className={`relative flex-1 ${todayEvents.length - 1 === index ? 'after:w-0' : 'after:w-0.5'} after:content-[''] after:h-[70%]  after:bg-gray-300 after:inline-block after:absolute after:-bottom-14 after:left-4 lg:after:left-5 `}
          onClick={() => handleSetSelectedEvents(event)}
        >
          <a className="flex items-start font-medium">
            {/* Step Indicator */}
            <span className="mt-12 w-8 h-8 aspect-square bg-gray-400 border-2 border-transparent rounded-full flex justify-center items-center mr-3 text-sm text-white lg:w-10 lg:h-10">
              {index + 1}
            </span>

            {/* Event Details */}
            <div className="block shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-md hover:shadow-gray-400 p-4 rounded-xl min-w-[50%] max-w-[80%] w-full border-gray-300 border-2">
              <h3 className="text-lg font-medium">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
              <p className="flex text-sm my-1 items-center">
                <MapPin className="mr-2" />
                <span className="font-medium">{event.location.name}</span>,{' '}
                {event.location.address}
              </p>
              <p className="flex text-sm items-center">
                <Clock className="mr-2" />{' '}
                {format(parseISO(event.dateTime), 'hh:mm a')}
              </p>
            </div>
          </a>
        </li>
      ))}
    </ol>
  );
};

export default TodayEventsVerticalStepper;
