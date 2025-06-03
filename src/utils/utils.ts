import { nanoid } from 'nanoid';

export function generateRandomId(): string {
  return nanoid();
}

export function minutesToHoursAndMinutes(minutes: number): {
  hours: number;
  minutes: number;
} {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return { hours, minutes: remainingMinutes };
}
