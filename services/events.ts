import { EventByIdResponse } from '../types/api';
import { httpGet } from './client';

export function getEventById(id: string) {
  return httpGet<EventByIdResponse>(`/events/${id}`);
}
