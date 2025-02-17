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
