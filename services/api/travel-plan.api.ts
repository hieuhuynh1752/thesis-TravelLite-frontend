'use client';
import api from './api';
import { FlattenedSelectedRoute } from '@/contexts/travel-context';

export const getTravelPlanByParticipant = async (
  participantId: number,
): Promise<FlattenedSelectedRoute & { eventParticipantId: number }> => {
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
