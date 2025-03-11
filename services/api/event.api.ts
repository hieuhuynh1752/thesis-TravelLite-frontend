'use client';
import api from './api';
import { FlatEventType, PlaceType } from './type.api';

export interface CreateEventBodyType {
  eventData: Omit<FlatEventType, 'id' | 'createdAt' | 'locationId'>;
  placeData: Omit<PlaceType, 'id'>;
}

export interface UpdateEventBodyType {
  eventData: Omit<FlatEventType, 'id' | 'createdAt'>;
  placeData: Omit<PlaceType, 'id'> | undefined;
}

export const createEvent = async (data: CreateEventBodyType) => {
  const response = await api.post(`/events`, data);
  return response.data;
};

export const updateEvent = async (
  eventId: number,
  data: UpdateEventBodyType,
) => {
  const response = await api.put(`/events/${eventId}`, data);
  return response.data;
};
