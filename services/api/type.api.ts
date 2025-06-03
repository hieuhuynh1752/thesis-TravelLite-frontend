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

export enum EventVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
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
  travelPlan?: TravelPlanType[];
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
  totalCo2: number;
  travelMode: google.maps.TravelMode;
}

export interface EventType {
  id?: number;
  creator: UserType;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  description: string;
  visibility: EventVisibility;
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
  visibility: EventVisibility;
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
    !!(routes as TransitRoute[])[0].steps.find(
      (step) => !!step.line || step.type === google.maps.TravelMode.WALKING,
    )
  );
}

export interface EnrichedStepsResponse {
  steps: Step[];
}

export interface AirportDetails {
  iataCode: string;
  lat: number;
  lng: number;
}

export interface SerpAirportDetails {
  name: string;
  id: string;
  time: string;
}

export interface SerpFlightDetails {
  departure_airport: SerpAirportDetails;
  arrival_airport: SerpAirportDetails;
  duration: number;
  airplane: string; //airplane model
  airline: string;
  airline_logo: string;
  travel_class: string;
  flight_number: string;
  extensions: string[];
  legroom: string;
  overnight?: boolean;
  often_delayed_by_over_30_min?: boolean;
  plane_and_crew_by?: string;
}

export interface SerpFlightCarbonEmissionDetails {
  this_flight: number;
  typical_for_this_route: number;
  difference_percent: number;
}

export interface FlightDetails {
  flights: SerpFlightDetails[];
  total_duration: number; //"Integer - Total minutes of all flights and layovers"
  carbon_emissions: SerpFlightCarbonEmissionDetails;
  price: number;
  type: string;
  airline_logo: string;
  extensions?: string[];
  departure_token?: string;
  booking_token?: string;
}
