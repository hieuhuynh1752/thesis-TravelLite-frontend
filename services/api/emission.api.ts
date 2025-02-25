'use client';
import api from './api';
import { EnrichedStepsResponse, Step } from './type.api';

export const fetchEmissions = async (
  steps: Pick<Step, 'duration' | 'type' | 'vehicleType'>[],
): Promise<EnrichedStepsResponse> => {
  const response = await api.post('/emissionFactors/calculate', {
    steps: steps,
  });
  return response.data;
};
