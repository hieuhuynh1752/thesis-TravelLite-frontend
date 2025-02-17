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
}

export interface PlaceType {
  id: number;
  name: string;
  address: string;
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
