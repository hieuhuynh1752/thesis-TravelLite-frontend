import {
  EventOccurrence,
  EventParticipantType,
} from '../../services/api/type.api';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  format,
  parseISO,
} from 'date-fns';

export type TravelHistoryDataType = {
  co2?: number;
  date?: string;
  title?: string;
  travelMode?: google.maps.TravelMode;
};

export type ReducedTravelHistoryDataType = {
  totalCo2?: number;
  date?: string;
  historyItems?: TravelHistoryDataType[];
};

export type ReducedTravelPreferencesDataType = {
  name: string;
  value: number;
};

export const getTravelHistoryData = (events: EventParticipantType[]) => {
  const recursedEvents: Map<EventOccurrence, TravelHistoryDataType[]> =
    new Map();
  console.log(events);
  let data: TravelHistoryDataType[] | undefined = events
    .filter((event) => !!event.travelPlan)
    .map((eventWithTravelPlan) => {
      const dataToRender: TravelHistoryDataType = {
        co2: eventWithTravelPlan.travelPlan?.totalCo2,
        date: eventWithTravelPlan.event.dateTime,
        title: eventWithTravelPlan.event.title,
        travelMode: eventWithTravelPlan.travelPlan?.travelMode,
      };
      if (eventWithTravelPlan.event.occurrence !== EventOccurrence.SINGLE) {
        if (recursedEvents.has(eventWithTravelPlan.event.occurrence)) {
          const updatedRecursedEvents = recursedEvents.get(
            eventWithTravelPlan.event.occurrence,
          );
          updatedRecursedEvents?.push(dataToRender);
          recursedEvents.set(
            eventWithTravelPlan.event.occurrence,
            updatedRecursedEvents!,
          );
        } else {
          recursedEvents.set(eventWithTravelPlan.event.occurrence, [
            dataToRender,
          ]);
        }
      }
      return dataToRender;
    });

  if (!!data) {
    const toBeAddedEntries: TravelHistoryDataType[] = [];
    for (const [key, value] of recursedEvents.entries()) {
      for (let i = 0; i < value.length; i++) {
        if (key === EventOccurrence.DAILY) {
          console.log(value);
          for (
            let j = 1;
            j <= differenceInCalendarDays(new Date(), new Date(value[i].date!));
            j++
          ) {
            toBeAddedEntries.push({
              ...value[i],
              date: addDays(new Date(value[i].date!), j).toISOString(),
            });
          }
        }
        if (key === EventOccurrence.MONTHLY) {
          for (
            let j = 1;
            j <=
            differenceInCalendarMonths(new Date(), new Date(value[i].date!));
            j++
          ) {
            toBeAddedEntries.push({
              ...value[i],
              date: addMonths(new Date(value[i].date!), j).toISOString(),
            });
          }
        }
        if (key === EventOccurrence.WEEKLY) {
          for (
            let j = 1;
            j <=
            differenceInCalendarWeeks(new Date(), new Date(value[i].date!));
            j++
          ) {
            toBeAddedEntries.push({
              ...value[i],
              date: addWeeks(new Date(value[i].date!), j).toISOString(),
            });
          }
        }
        if (key === EventOccurrence.YEARLY) {
          for (
            let j = 1;
            j <=
            differenceInCalendarYears(new Date(), new Date(value[i].date!));
            j++
          ) {
            toBeAddedEntries.push({
              ...value[i],
              date: addYears(new Date(value[i].date!), j).toISOString(),
            });
          }
        }
      }
    }
    data = data.concat(toBeAddedEntries);
    data.sort(
      (itemA, itemB) =>
        new Date(itemA.date!).getTime() - new Date(itemB.date!).getTime(),
    );
    data = data.map((item) => {
      return {
        ...item,
        date:
          format(parseISO(item.date!), 'MMM') +
          ' ' +
          format(parseISO(item.date!), 'd'),
      };
    });
  }
  console.log(data);
  return data;
};

export const flattenTravelHistoryChartData = (
  data: TravelHistoryDataType[],
) => {
  const dataMap = new Map<string, ReducedTravelHistoryDataType>();
  for (const item of data) {
    if (dataMap.has(item.date!)) {
      const updatedInstance = dataMap.get(item.date!)!;
      updatedInstance.historyItems?.push(item);
      updatedInstance.totalCo2! += item.co2!;
      dataMap.set(item.date!, updatedInstance);
    } else {
      dataMap.set(item.date!, {
        totalCo2: item.co2,
        historyItems: [item],
        date: item.date!,
      });
    }
  }
  const output = Array.from(dataMap.values());
  return output;
};

export const flattenTravelPreferencesHistoryChartData = (
  data: TravelHistoryDataType[],
): ReducedTravelPreferencesDataType[] => {
  console.log(data);
  const travelModeCounts: Record<string, number> = {};
  data.forEach(({ travelMode }) => {
    if (travelMode) {
      travelModeCounts[travelMode] = (travelModeCounts[travelMode] || 0) + 1;
      console.log(travelMode, travelModeCounts[travelMode]);
    }
  });
  const travelModeData = Object.keys(travelModeCounts).map((mode) => ({
    name: mode.charAt(0) + String(mode).slice(1).toLowerCase(),
    value: travelModeCounts[mode],
  }));
  return travelModeData;
};

export const calculateTotalCo2 = (
  data: ReducedTravelHistoryDataType[],
): string => {
  let counter = 0;
  for (const item of data) {
    counter += item.totalCo2!;
  }
  return counter.toFixed(2);
};
