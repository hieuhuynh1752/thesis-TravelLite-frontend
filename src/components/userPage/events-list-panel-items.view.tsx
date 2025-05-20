'use client';
import * as React from 'react';
import {
  format,
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
import { getNextOccurrenceDate } from '@/utils/events-util';

interface EventsListPanelItemsProps {
  extended?: boolean;
  adminMode?: boolean;
}

const EventsListPanelItems = ({
  extended,
  adminMode,
}: EventsListPanelItemsProps) => {
  const [eventsList, setEventsList] =
    React.useState<Map<string, EventType[]>>();
  const [showPassedEvent, setShowPassedEvent] = React.useState(false);
  const {
    eventsAsParticipantList,
    allEvents,
    selectedEvent,
    setSelectedEvent,
  } = useUserContext();
  const { resetAllTravelLogs } = useTravelContext();

  const handleEvents = React.useCallback(
    (showAll?: boolean) => {
      console.log(allEvents);
      if ((!adminMode && !eventsAsParticipantList) || (adminMode && !allEvents))
        return;
      console.log(showAll);
      // pull out accepted events
      const rawEvents = adminMode
        ? allEvents
        : eventsAsParticipantList!
            .filter((p) => p.status === EventParticipantStatus.ACCEPTED)
            .map((p) => p.event);

      // attach nextDate to each
      const withNext = rawEvents!.map((ev) => ({
        ...ev,
        nextDate: getNextOccurrenceDate(ev),
      }));

      // filter out past/single unless extended or showAll
      const filtered = extended
        ? withNext
        : withNext.filter(
            (ev) =>
              ev.occurrence !== EventOccurrence.SINGLE ||
              isToday(ev.nextDate) ||
              isFuture(ev.nextDate),
          );

      // sort by nextDate (or reverse if extended)
      let sorted = filtered.sort((a, b) => {
        const diff = a.nextDate.getTime() - b.nextDate.getTime();
        return extended ? -diff : diff;
      });

      // if showAll, prepend truly past singletons
      if (showAll) {
        const pastSingles = withNext
          .filter(
            (ev) =>
              ev.occurrence === EventOccurrence.SINGLE && isPast(ev.nextDate),
          )
          .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
        sorted = pastSingles.concat(sorted);
      }

      // group into a Map<dayString, EventType[]>
      const upcomingEventsMap = new Map<string, EventType[]>();
      for (const ev of sorted) {
        // floor to midnight
        const dayStart = setHours(
          setMinutes(
            setSeconds(setMilliseconds(new Date(ev.nextDate), 0), 0),
            0,
          ),
          0,
        );
        const key = dayStart.toISOString();
        const list = upcomingEventsMap.get(key) || [];
        list.push(ev);
        upcomingEventsMap.set(key, list);
      }

      // update state if changed
      setEventsList(upcomingEventsMap);

      // auto-select first if needed
      if (showAll === undefined) {
        console.log('here');
        const first = upcomingEventsMap.entries().next().value;
        if (first) {
          const [day, items] = first;
          setSelectedEvent?.(items[0]);
        }
      }
    },
    [adminMode, allEvents, eventsAsParticipantList, extended, setSelectedEvent],
  );

  const handleSelectEvent = React.useCallback(
    (newSelectedEvent: EventType) => {
      if (newSelectedEvent !== selectedEvent) {
        if (!extended) {
          resetAllTravelLogs();
        }
        setSelectedEvent?.(newSelectedEvent);
      }
    },
    [resetAllTravelLogs, setSelectedEvent, selectedEvent, extended],
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
  }, [allEvents, eventsAsParticipantList, handleEvents]);

  return (
    <div className="flex flex-col">
      {!extended && (
        <>
          <div className="flex gap-4 p-4">
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
        </>
      )}
      {eventsList ? (
        eventsList.size === 0 ? (
          <p className="p-4 text-muted-foreground">
            No events scheduled for today.
          </p>
        ) : (
          <div
            className="grid w-full overflow-y-auto flex-col"
            style={{
              maxHeight: extended
                ? 'calc(90vh - 0.5rem)'
                : 'calc(50vh - 2.5rem)',
            }}
          >
            {Array.from(eventsList).map(([date, eventsToRender], index) => (
              <div
                key={index}
                className={`flex flex-col w-full h-full gap-2 p-4 ${extended ? 'pt-0' : 'pt-4'} ${!extended && isPast(date) && !isToday(date) ? 'bg-gray-100' : 'bg-white'}`}
              >
                <p className="text-xl">
                  <span className="font-bold">
                    {format(parseISO(date), 'MMM')}{' '}
                    {format(parseISO(date), 'd')},{' '}
                  </span>
                  <span className="text-gray-500">
                    {format(parseISO(date), 'y')}
                  </span>
                </p>

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
                      <p className="flex text-sm items-center mt-2 p-1 px-2 border-gray-400 bg-gray-50 border w-fit rounded-full">
                        <Clock className="mr-2" size={16} />{' '}
                        {format(parseISO(event.dateTime), 'hh:mm a')}
                      </p>
                      {event.occurrence !== EventOccurrence.SINGLE && (
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
