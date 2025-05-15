'use client';
import api from './api';
import { EventParticipantStatus } from './type.api';

export const updateParticipantStatus = async (
  id: number,
  data: { status: EventParticipantStatus },
) => {
  const response = await api.put(`/participants/${id}`, data);
  return response.data;
};

export const participantSubscribeToEvent = async (data: {
  userId: number;
  eventId: number;
}) => {
  const response = await api.post(`participants`, data);
  return response.data;
};

export const getAllEventParticipants = async () => {
  const response = await api.get('/participants');
  return response.data;
};
