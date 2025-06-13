'use client';
import api from './api';
import {
  FlattenedSelectedFlight,
  FlattenedSelectedRoute,
  SavedTravelPlanType,
} from '@/contexts/travel-context';

export const getTravelPlanByParticipant = async (
  participantId: number,
): Promise<SavedTravelPlanType[]> => {
  const response = await api.get(`/travel-plans/participant/${participantId}`);
  return response.data;
};

export const createTravelPlan = async (
  data: FlattenedSelectedRoute & { eventParticipantId: number },
): Promise<FlattenedSelectedRoute & { eventParticipantId: number }> => {
  const response = await api.post(`/travel-plans`, {
    data: data,
  });
  return response.data;
};

export const createFlightPlan = async (
  data: FlattenedSelectedFlight & { eventParticipantId: number },
): Promise<FlattenedSelectedFlight & { eventParticipantId: number }> => {
  const response = await api.post(`/travel-plans`, {
    data: data,
  });
  return response.data;
};

export const updateTravelPlanById = async (
  id: number,
  data: FlattenedSelectedRoute,
): Promise<FlattenedSelectedRoute & { eventParticipantId: number }> => {
  const response = await api.put(`/travel-plans/${id}`, {
    data: data,
  });
  return response.data;
};

export const updateTravelPlanToFlightById = async (
  id: number,
  data: FlattenedSelectedFlight,
): Promise<FlattenedSelectedFlight & { eventParticipantId: number }> => {
  const response = await api.put(`/travel-plans/${id}`, {
    data: data,
  });
  return response.data;
};
