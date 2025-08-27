import { AttendeesResponse, CheckinRequest, CheckinResponse } from '../types/api';
import { httpGet, httpPost } from './client';

export function getAttendees(eventId: string, search = '', page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return httpGet<AttendeesResponse>(`/events/${eventId}/attendees?${params.toString()}`);
}

export function postCheckin(eventId: string, body: CheckinRequest) {
  return httpPost<CheckinResponse>(`/events/${eventId}/checkin`, {
    body: JSON.stringify(body),
  });
}
