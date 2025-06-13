import {
  EventOccurrence,
  EventParticipantType,
  UserType,
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
  isPast,
} from 'date-fns';

export type TravelHistoryDataType = {
  co2?: number;
  date?: string;
  title?: string;
  occurrence?: string;
  location?: string;
  travelMode?: google.maps.TravelMode;
  user?: UserType;
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

export const getTravelHistoryData = (
  events: EventParticipantType[],
  filterBy: { month?: string; year?: string } = {},
) => {
  // We’ll collect occurrences of recurring events by their occurrence key.
  const recursedEvents: Map<EventOccurrence, TravelHistoryDataType[]> =
    new Map();

  // Step 1: flatMap over events, then over event.travelPlan (which is now an array).
  // Only include plans where the event date is in the past.
  let data: TravelHistoryDataType[] = events
    .flatMap((participant) => {
      // If there is no travelPlan array or the event date isn't past, return an empty array.
      if (
        !participant.travelPlan ||
        !Array.isArray(participant.travelPlan) ||
        !isPast(participant.event.dateTime)
      ) {
        return [];
      }

      // Otherwise, for each travelPlan item inside participant.travelPlan[], produce one TravelHistoryDataType.
      return participant.travelPlan.map((onePlan) => {
        const entry: TravelHistoryDataType = {
          co2: onePlan.totalCo2,
          date: participant.event.dateTime,
          title: participant.event.title,
          location: participant.event.location.name,
          occurrence: participant.event.occurrence,
          user: participant.user,
          travelMode: onePlan.travelMode,
        };

        // If this event is recurring, stash it for later expansion.
        if (participant.event.occurrence !== EventOccurrence.SINGLE) {
          const occKey = participant.event.occurrence;
          if (recursedEvents.has(occKey)) {
            recursedEvents.get(occKey)!.push(entry);
          } else {
            recursedEvents.set(occKey, [entry]);
          }
        }

        return entry;
      });
    })
    // Filter out any “undefined” or empty pieces, though flatMap above should handle it.
    .filter((x) => x !== undefined);

  // Step 2: Expand all recurring‐event dates.
  const toBeAddedEntries: TravelHistoryDataType[] = [];
  for (const [occurrenceKey, baseEntries] of recursedEvents.entries()) {
    for (const base of baseEntries) {
      const originalDate = new Date(base.date!);

      if (occurrenceKey === EventOccurrence.DAILY) {
        const daysDiff = differenceInCalendarDays(new Date(), originalDate);
        for (let j = 1; j <= daysDiff; j++) {
          toBeAddedEntries.push({
            ...base,
            date: addDays(originalDate, j).toISOString(),
          });
        }
      }

      if (occurrenceKey === EventOccurrence.WEEKLY) {
        const weeksDiff = differenceInCalendarWeeks(new Date(), originalDate);
        for (let j = 1; j <= weeksDiff; j++) {
          toBeAddedEntries.push({
            ...base,
            date: addWeeks(originalDate, j).toISOString(),
          });
        }
      }

      if (occurrenceKey === EventOccurrence.MONTHLY) {
        const monthsDiff = differenceInCalendarMonths(new Date(), originalDate);
        for (let j = 1; j <= monthsDiff; j++) {
          toBeAddedEntries.push({
            ...base,
            date: addMonths(originalDate, j).toISOString(),
          });
        }
      }

      if (occurrenceKey === EventOccurrence.YEARLY) {
        const yearsDiff = differenceInCalendarYears(new Date(), originalDate);
        for (let j = 1; j <= yearsDiff; j++) {
          toBeAddedEntries.push({
            ...base,
            date: addYears(originalDate, j).toISOString(),
          });
        }
      }
    }
  }

  // Merge the “expanded” occurrences back into the main array
  data = data.concat(toBeAddedEntries);

  // Step 3: Sort ascending by date
  data.sort(
    (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime(),
  );

  // Step 4: Apply the month/year filter if provided
  data = data.filter((item) => {
    const dateObj = parseISO(item.date!);
    const matchesMonth = filterBy.month
      ? dateObj.getMonth() + 1 === parseInt(filterBy.month, 10)
      : true;
    const matchesYear = filterBy.year
      ? dateObj.getFullYear().toString() === filterBy.year
      : true;
    return matchesMonth && matchesYear;
  });

  // Step 5: Re‐format each date string for display
  data = data.map((item) => ({
    ...item,
    date: format(parseISO(item.date!), 'MMM d yyyy'),
  }));

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
  const travelModeCounts: Record<string, number> = {};
  data.forEach(({ travelMode }) => {
    if (travelMode) {
      travelModeCounts[travelMode] = (travelModeCounts[travelMode] || 0) + 1;
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

export const calculatePersonalEmissionRateOnEvent = (
  data: EventParticipantType[],
  userId: number,
): { name: string; value: number }[] => {
  const output: { name: string; value: number }[] = [];
  const filteredData = data.filter((participant) => !!participant.travelPlan);
  output.push({
    name: 'You',
    value:
      filteredData
        .find((participant) => participant.user.id === userId)
        ?.travelPlan?.reduce((co2PerPlanAcc, plan) => {
          const subCo2 = plan.totalCo2;
          return co2PerPlanAcc + subCo2;
        }, 0) ?? 0,
  });
  let totalCo2OfAllParticipants = 0;
  filteredData.forEach(
    (participant) =>
      (totalCo2OfAllParticipants +=
        participant.travelPlan?.reduce((co2PerPlanAcc, plan) => {
          const subCo2 = plan.totalCo2;
          return co2PerPlanAcc + subCo2;
        }, 0) ?? 0),
  );
  output.push({
    name: 'Average',
    value: totalCo2OfAllParticipants / filteredData.length,
  });
  output.push({
    name: 'Total',
    value: totalCo2OfAllParticipants,
  });
  return output;
};

export const calculatePersonalEmissionPercentageOnEvent = (
  data: EventParticipantType[],
  userId: number,
): { name: string; value: number }[] => {
  const output: { name: string; value: number }[] = [];
  output.push({
    name: 'You',
    value:
      data
        .find((participant) => participant.user.id === userId)
        ?.travelPlan?.reduce((co2PerPlanAcc, plan) => {
          const subCo2 = plan.totalCo2;
          return co2PerPlanAcc + subCo2;
        }, 0) ?? 0,
  });
  let totalCo2OfAllParticipants = 0;
  data.forEach((participant) => {
    if (participant.user.id !== userId) {
      totalCo2OfAllParticipants +=
        participant.travelPlan?.reduce((co2PerPlanAcc, plan) => {
          const subCo2 = plan.totalCo2;
          return co2PerPlanAcc + subCo2;
        }, 0) ?? 0;
    }
  });
  output.push({
    name: 'Others (Total)',
    value: totalCo2OfAllParticipants,
  });
  return output;
};

export const calculateParticipantsEmissionRateOnEvent = (
  data: EventParticipantType[],
): { name: string; value: number }[] => {
  const output = data.map((participant) => {
    return {
      name: participant.user.name ?? '',
      value:
        participant.travelPlan?.reduce((co2PerPlanAcc, plan) => {
          const subCo2 = plan.totalCo2;
          return co2PerPlanAcc + subCo2;
        }, 0) ?? 0,
    };
  });
  return output;
};

export const calculateParticipantsTravelModePreferencesOnEvent = (
  data: EventParticipantType[],
) => {
  const travelModeCounts: Record<string, number> = {};

  data.forEach(({ travelPlan }) => {
    if (Array.isArray(travelPlan)) {
      travelPlan.forEach((plan) => {
        if (plan.travelMode) {
          travelModeCounts[plan.travelMode] =
            (travelModeCounts[plan.travelMode] || 0) + 1;
        }
      });
    }
  });
  const travelModeData = Object.keys(travelModeCounts).map((mode) => ({
    name: mode.charAt(0) + mode.slice(1).toLowerCase(),
    value: travelModeCounts[mode],
  }));

  return travelModeData;
};
