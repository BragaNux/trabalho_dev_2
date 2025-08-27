export interface EventStats { total: number; checkedIn: number; absent: number }
export interface EventDTO {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  stats: EventStats;
}
export interface EventByIdResponse extends EventDTO {}

export interface AttendeeDTO {
  id: string;
  name: string;
  email?: string;
  document?: string;
  checkedInAt?: string | null;
}
export interface AttendeesResponse {
  data: AttendeeDTO[];
  page: number;
  limit: number;
  total: number;
}
export interface CheckinRequest { attendeeId: string }
export interface CheckinResponse { attendeeId: string; checkedInAt: string }
