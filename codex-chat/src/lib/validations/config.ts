import { z } from "zod";

export const configSchema = z.object({
  businessName: z.string().min(3),
  slug: z.string().min(3),
  simultaneousSlots: z.coerce.number().int().min(1).max(10),
  phone: z.string().min(10),
  address: z.string().min(5),
  primaryColor: z.string().min(4),
  queueRefreshSeconds: z.coerce.number().int().min(10).max(120),
  loyaltyEnabled: z.coerce.boolean(),
});
