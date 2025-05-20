import { EventOccurrence, EventType } from '../../services/api/type.api';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  getDate,
  getDay,
  getMonth,
  isBefore,
  parseISO,
  setDate,
  setDay,
  setHours,
  setMilliseconds,
  setMinutes,
  setMonth,
  setSeconds,
} from 'date-fns';

export function getFilteredEvents(
  events: EventType[],
  filterBy: { month?: string; year?: string } = {},
) {
  const data = events.filter((item) => {
    const dateObj = parseISO(item.dateTime!);
    const matchesMonth = filterBy.month
      ? dateObj.getMonth() + 1 === parseInt(filterBy.month)
      : true;
    const matchesYear = filterBy.year
      ? dateObj.getFullYear().toString() === filterBy.year
      : true;
    return matchesMonth && matchesYear;
  });
  console.log(data);
  return data;
}

export function getNextOccurrenceDate(event: EventType): Date {
  const orig = new Date(event.dateTime);
  const now = new Date();

  // Start from “today” at the event’s time
  let candidate = setHours(
    setMinutes(
      setSeconds(setMilliseconds(new Date(), 0), orig.getSeconds()),
      orig.getMinutes(),
    ),
    orig.getHours(),
  );

  switch (event.occurrence) {
    case EventOccurrence.SINGLE:
      return orig;

    case EventOccurrence.DAILY:
      if (isBefore(candidate, now)) {
        candidate = addDays(candidate, 1);
      }
      return candidate;

    case EventOccurrence.WEEKLY: {
      const targetDow = getDay(orig);
      // setDay will move to this week’s targetDow
      candidate = setDay(candidate, targetDow, { weekStartsOn: 0 });
      if (isBefore(candidate, now)) {
        candidate = addWeeks(candidate, 1);
      }
      return candidate;
    }

    case EventOccurrence.MONTHLY: {
      const targetDate = getDate(orig);
      candidate = setDate(candidate, targetDate);
      if (isBefore(candidate, now)) {
        candidate = addMonths(candidate, 1);
      }
      return candidate;
    }

    case EventOccurrence.YEARLY: {
      candidate = setMonth(candidate, getMonth(orig));
      candidate = setDate(candidate, getDate(orig));
      if (isBefore(candidate, now)) {
        candidate = addYears(candidate, 1);
      }
      return candidate;
    }

    default:
      return orig;
  }
}

export function compareEventsMaps(
  map1: Map<string, EventType[]>,
  map2: Map<string, EventType[]>,
) {
  if (map1.size !== map2.size) return false;
  for (const [key, val1] of map1) {
    const val2 = map2.get(key);
    if (!val2 || val1.length !== val2.length) return false;
    for (let i = 0; i < val1.length; i++) {
      if (val1[i].id !== val2[i].id) return false;
    }
  }
  return true;
}
