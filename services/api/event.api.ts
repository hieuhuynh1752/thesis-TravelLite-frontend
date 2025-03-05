'use client';
import api from './api';
import { FlatEventType, PlaceType } from './type.api';

export interface CreateEventBodyType {
  eventData: Omit<FlatEventType, 'id' | 'createdAt' | 'locationId'>;
  placeData: Omit<PlaceType, 'id'>;
}

export const createEvent = async (data: CreateEventBodyType) => {
  const response = await api.post(`/events`, data);
  return response.data;
};
