import { z } from 'zod';

export const RunIdSchema = z
  .string()
  .min(6)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const UserIdSchema = z.string().min(1).max(128);

export const MaintenanceSchema = z.object({
  op: z.literal('ttl_cleanup'),
  // optionally accept a soft limit to keep the route future-proof
  maxRows: z.number().int().min(1).max(10_000).optional(),
});

export type MaintenanceInput = z.infer<typeof MaintenanceSchema>;
