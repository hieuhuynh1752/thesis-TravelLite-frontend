'use client';
import * as React from 'react';
import {
  format,
  getHours,
  isFuture,
  isPast,
  isToday,
  parseISO,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns';
import {
  EventOccurrence,
  EventParticipantStatus,
  EventType,
} from '../../../services/api/type.api';
import { Clock, Repeat } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Separator } from '@/components/ui/separator';
import { useUserContext } from '@/contexts/user-context';
import { useTravelContext } from '@/contexts/travel-context';

const EventsListPanelItems = () => {
  const [eventsList, setEventsList] =
    React.useState<Map<string, EventType[]>>();
  const [showPassedEvent, setShowPassedEvent] = React.useState(false);
  const { events, selectedEvent, setSelectedEvent } = useUserContext();
  const { resetAllTravelLogs } = useTravelContext();

  const handleEvents = React.useCallback(
    (showAll?: boolean) => {
      if (events) {
        const participatedEvents = events
          .filter((event) => event.status === EventParticipantStatus.ACCEPTED)
          .map((p) => p.event);
        const filteredEvents = participatedEvents.filter(
          (event) =>
            isToday(event.dateTime) ||
            isFuture(event.dateTime) ||
            event.occurrence === EventOccurrence.DAILY,
        );
        let sortedEvents = filteredEvents.sort(
          (a, b) =>
            new Date(
              a.occurrence === EventOccurrence.DAILY ? '' : a.dateTime,
            ).getTime() -
            new Date(
              b.occurrence === EventOccurrence.DAILY ? '' : b.dateTime,
            ).getTime(),
        );

        const sortedPastEvents = participatedEvents
          .filter(
            (event) =>
              isPast(event.dateTime) &&
              event.occurrence !== EventOccurrence.DAILY,
          )
          .sort(
            (a, b) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
          );

        if (showAll) {
          sortedEvents = sortedPastEvents.concat(sortedEvents);
        }
        const upcomingEventsMap = new Map<string, EventType[]>();
        for (const event of sortedEvents) {
          let dayObject = new Date(
            event.occurrence === EventOccurrence.DAILY
              ? new Date().setHours(getHours(event.dateTime))
              : event.dateTime,
          );
          dayObject = setHours(
            setMinutes(setSeconds(setMilliseconds(dayObject, 0), 0), 0),
            0,
          );
          const dayString = dayObject.toISOString();
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
    (newSelectedEvent: EventType) => {
      if (newSelectedEvent !== selectedEvent) {
        resetAllTravelLogs();
        setSelectedEvent?.(newSelectedEvent);
      }
    },
    [resetAllTravelLogs, setSelectedEvent, selectedEvent],
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
          <p className="p-4 text-muted-foreground">
            No events scheduled for today.
          </p>
        ) : (
          <div
            className="grid w-full overflow-y-auto flex-col"
            style={{ maxHeight: 'calc(50vh - 2.5rem)' }}
          >
            {Array.from(eventsList).map(([date, eventsToRender], index) => (
              <div
                key={index}
                className={`flex w-full h-full gap-4 p-4 ${isPast(date) && !isToday(date) ? 'bg-muted' : 'bg-white'}`}
              >
                <div className="flex flex-col text-gray-500">
                  <p className="text-5xl font-extrabold self-center text-center w-full">
                    {format(parseISO(date), 'd')}
                  </p>
                  <p className="text-lg font-medium px-4">
                    {format(parseISO(date), 'MMM')}
                  </p>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                  {eventsToRender.map((event, key) => (
                    <div
                      key={key}
                      className={`block shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-md hover:shadow-muted p-4 rounded-md w-full 
                      ${event.id === selectedEvent?.id ? 'border-primary border-2 border-l-8 bg-white' : 'border-muted border-2 border-l-8 bg-white'}
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
                          className={`absolute text-primary top-0 right-0 rounded-bl-md rounded-tr-md p-2 ${event.id === selectedEvent?.id ? 'border-primary border-l-2 border-b-2 bg-white' : 'border-muted border-b-2 border-l-2 bg-white'}`}
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
