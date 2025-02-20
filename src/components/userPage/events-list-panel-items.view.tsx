'use client';
import * as React from 'react';
import {
  format,
  getHours,
  isFuture,
  isPast,
  isToday,
  parseISO,
} from 'date-fns';
import { EventOccurrence, EventType } from '../../../services/api/type.api';
import { Clock, Repeat } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Separator } from '@/components/ui/separator';
import { useUserContext } from '@/contexts/user-context';

const EventsListPanelItems = () => {
  const [eventsList, setEventsList] =
    React.useState<Map<string, EventType[]>>();
  const [showPassedEvent, setShowPassedEvent] = React.useState(false);
  const { events, selectedEvent, setSelectedEvent } = useUserContext();

  const handleEvents = React.useCallback(
    (showAll?: boolean) => {
      if (events) {
        const participatedEvents = events.map((p) => p.event);
        const filteredEvents = showAll
          ? participatedEvents
          : participatedEvents.filter(
              (event) =>
                isToday(event.dateTime) ||
                isFuture(event.dateTime) ||
                event.occurrence === EventOccurrence.DAILY,
            );
        const sortedEvents = filteredEvents.sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
        );
        const upcomingEventsMap = new Map<string, EventType[]>();
        for (const event of sortedEvents) {
          const dayString = new Date(
            event.occurrence === EventOccurrence.DAILY
              ? new Date().setHours(getHours(event.dateTime))
              : event.dateTime,
          ).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          });
          if (upcomingEventsMap.has(dayString)) {
            const newList = upcomingEventsMap.get(dayString);
            newList!.push(event);
            upcomingEventsMap.set(dayString, newList as EventType[]);
          } else {
            upcomingEventsMap.set(dayString, [event]);
          }
        }
        setEventsList(upcomingEventsMap);

        if (showAll === undefined) {
          const item = upcomingEventsMap.entries().next().value;
          if (item) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, eventItem] = item;
            setSelectedEvent?.(eventItem[0]);
          }
        }
      }
    },
    [events, setSelectedEvent],
  );

  const handleSelectEvent = React.useCallback(
    (selectedEvent: EventType) => {
      setSelectedEvent?.(selectedEvent);
    },
    [setSelectedEvent],
  );

  const handleShowAllCheckboxChange = React.useCallback(
    (checked: CheckedState) => {
      if (checked !== 'indeterminate') {
        handleEvents(checked);
        setShowPassedEvent(checked);
      }
    },
    [handleEvents],
  );

  React.useEffect(() => {
    handleEvents();
  }, [handleEvents]);
  console.log(eventsList);
  return (
    <div className="flex flex-col pt-4">
      <div className="flex gap-4 p-4 pt-0">
        <Checkbox
          id="showAll"
          className="flex items-center space-x-2"
          onCheckedChange={handleShowAllCheckboxChange}
          checked={showPassedEvent}
        />{' '}
        <label
          htmlFor="showAll"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show all passed events
        </label>
      </div>
      <Separator orientation={'horizontal'} />
      {eventsList ? (
        eventsList.size === 0 ? (
          <p className="text-muted-foreground">
            No events scheduled for today.
          </p>
        ) : (
          <div className="grid max-h-[80vh] w-full overflow-y-auto flex-col">
            {Array.from(eventsList).map(([date, eventsToRender], index) => (
              <div
                key={index}
                className={`flex flex-col w-full h-full gap-2 px-4 py-4 ${isPast(date) && !isToday(date) ? 'bg-muted' : 'bg-white'}`}
              >
                <p className="text-2xl">
                  <span className="font-bold">{date.split(',')[0]},</span>
                  <span className="text-gray-500">{date.split(',')[1]}</span>
                </p>
                <div className="flex flex-col gap-4">
                  {eventsToRender.map((event, key) => (
                    <div
                      key={key}
                      className={`block shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-md hover:shadow-gray-400 p-4 rounded-md w-full 
                      ${event.id === selectedEvent?.id ? 'border-gray-500 border-2 border-l-8 bg-white' : 'border-gray-300 border-2 border-l-8 bg-white'}
                       relative`}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <h3 className="text-lg font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      <p className="flex text-sm items-center">
                        <Clock className="mr-2" size={16} />{' '}
                        {format(parseISO(event.dateTime), 'hh:mm a')}
                      </p>
                      {event.occurrence === EventOccurrence.DAILY && (
                        <div
                          className={`absolute top-0 right-0 rounded-bl-md rounded-tr-md p-2 ${event.id === selectedEvent?.id ? 'border-gray-500 border-l-2 border-b-2 bg-white' : 'border-gray-300 border-b-2 border-l-2 bg-white'}`}
                        >
                          <Repeat size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
};

export default EventsListPanelItems;
