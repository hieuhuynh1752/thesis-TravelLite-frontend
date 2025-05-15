import { EventType } from '../../services/api/type.api';
import { parseISO } from 'date-fns';

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
