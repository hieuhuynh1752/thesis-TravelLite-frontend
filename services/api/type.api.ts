export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export enum EventOccurrence {
  SINGLE = 'SINGLE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export enum EventParticipantStatus {
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
}

export interface UserType {
  id: number;
  email?: string;
  name?: string;
  role?: UserRole;
  createAt?: string;
}

export interface AccountType {
  user: UserType;
  access_token: string;
}

export interface EventParticipantType {
  id: number;
  event: EventType;
  user: UserType;
  assignedAt: string;
  status: EventParticipantStatus;
  userId?: number;
}

export interface PlaceType {
  id: number;
  name: string;
  address: string;
  googlePlaceId: string;
  latitude: number;
  longtitude: number;
}

export interface TravelPlanType {
  id: number;
}

export interface EventType {
  id?: number;
  creator: UserType;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  description: string;
  occurrence: EventOccurrence;
  participants: EventParticipantType[];
  status?: EventStatus;
  dateTime: string;
  location: PlaceType;
  travelPlans?: TravelPlanType[];
}

export interface FlatEventType {
  id: number;
  creatorId: number;
  participantIds?: number[];
  locationId: number | null;
  dateTime: Date;
  occurrence: EventOccurrence;
  title: string;
  description?: string;
  createdAt?: Date;
}

export interface Step {
  type: string;
  distance: number;
  vehicleType?: string;
  duration?: string;
  line?: string;
  vehicle?: string;
  departureStop?: string;
  arrivalStop?: string;
  departureTime?: string;
  arrivalTime?: string;
  numberOfStops?: number;
  color?: string;
  textColor?: string;
  shortName?: string;
  summary?: string;
  co2?: number; // Calculated COc emission
  steps?: google.maps.DirectionsStep[];
}

export interface TransitRoute {
  steps: Step[];
  duration?: string;
  arrivalTime?: string;
  departureTime?: string;
  totalCo2?: number;
}

export function isTransitRoutes(
  routes: Step[] | TransitRoute[],
): routes is TransitRoute[] {
  return (
    routes.length > 0 &&
    ((routes as TransitRoute[])[0].steps[0].line !== undefined ||
      (routes as TransitRoute[])[0].steps[0].type ===
        google.maps.TravelMode.WALKING)
  );
}

export interface EnrichedStepsResponse {
  steps: Step[];
}
