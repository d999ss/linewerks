import z from "zod";

// Strava API types
export const StravaActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  total_elevation_gain: z.number(),
  start_date_local: z.string(),
  map: z.object({
    polyline: z.string().nullable(),
    summary_polyline: z.string().nullable(),
  }),
  sport_type: z.string(),
});

export type StravaActivity = z.infer<typeof StravaActivitySchema>;

// Database types
export const RideSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  strava_activity_id: z.string(),
  name: z.string(),
  distance: z.number().nullable(),
  moving_time: z.number().nullable(),
  total_elevation_gain: z.number().nullable(),
  start_date_local: z.string().nullable(),
  polyline: z.string().nullable(),
  summary_polyline: z.string().nullable(),
  sport_type: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Ride = z.infer<typeof RideSchema>;

export const PosterSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  ride_id: z.number(),
  name: z.string(),
  map_style: z.enum(['standard', 'terrain', 'satellite', 'dark']).default('standard'),
  primary_color: z.string().default('#ff6b35'),
  secondary_color: z.string().default('#2c3e50'),
  layout: z.enum(['portrait', 'landscape', 'square']).default('portrait'),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  show_stats: z.boolean().default(true),
  show_elevation: z.boolean().default(true),
  custom_title: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Poster = z.infer<typeof PosterSchema>;

// API request/response schemas
export const CreatePosterRequestSchema = z.object({
  ride_id: z.number(),
  name: z.string(),
  map_style: z.enum(['standard', 'terrain', 'satellite', 'dark']).optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  layout: z.enum(['portrait', 'landscape', 'square']).optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  show_stats: z.boolean().optional(),
  show_elevation: z.boolean().optional(),
  custom_title: z.string().optional(),
});

export type CreatePosterRequest = z.infer<typeof CreatePosterRequestSchema>;

export const UpdatePosterRequestSchema = CreatePosterRequestSchema.partial();
export type UpdatePosterRequest = z.infer<typeof UpdatePosterRequestSchema>;
