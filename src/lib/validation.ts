import { z } from 'zod';

export const userRoles = [
  'Administrator',
  'Special Ed Coordinator',
  'Teacher',
  'IT/Operations',
  'Other',
] as const;

export const attributionSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referrer_url: z.string().url().optional().or(z.literal('')),
  landing_page_url: z.string().url().optional().or(z.literal('')),
});

export const createLeadSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  job_title: z.enum(userRoles),
  district_name: z.string().min(1),
  school_name: z.string().optional(),
  phone_number: z.string().optional(),
  ghost_id: z.string().uuid().optional(),
  attribution: attributionSchema.optional(),
});

export const videoProgressSchema = z.object({
  video_id: z.string().min(1),
  watch_duration_seconds: z.number().int().min(0),
  current_time: z.number().min(0),
  completed: z.boolean().optional(),
  milestone_reached: z.string().optional(),
  clicked_cta_in_video: z.boolean().optional(),
  lead_id: z.string().uuid().optional(),
  ghost_id: z.string().uuid().optional(),
}).refine((data) => data.lead_id || data.ghost_id, {
  message: "Either lead_id or ghost_id is required",
});

const calAttendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  timeZone: z.string().optional(),
});

const calLocationSchema = z.object({
  type: z.string().optional(),
  url: z.string().url().optional(),
});

const calPayloadSchema = z.object({
  uid: z.string(),
  attendees: z.array(calAttendeeSchema),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: calLocationSchema.optional(),
});

export const calendarWebhookSchema = z.object({
  type: z.enum(['booking_created', 'booking_completed', 'booking_cancelled', 'booking_no_show']),
  payload: calPayloadSchema,
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type VideoProgressInput = z.infer<typeof videoProgressSchema>;
export type AttributionInput = z.infer<typeof attributionSchema>;
export type CalendarWebhookInput = z.infer<typeof calendarWebhookSchema>;
