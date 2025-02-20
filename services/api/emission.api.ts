'use client';
import api from './api';
import { EnrichedStepsResponse, Step } from './type.api';

export const fetchEmissions = async (
  steps: Step[],
): Promise<EnrichedStepsResponse> => {
  const response = await api.post('/calculate', steps);
  return response.data;
};
