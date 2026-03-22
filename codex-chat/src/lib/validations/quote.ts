import { z } from "zod";

export const quoteSchema = z.object({
  customerId: z.string().min(1),
  serviceTypeId: z.string().min(1),
  quantity: z.coerce.number().positive().default(1),
  discount: z.coerce.number().min(0).default(0),
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]).default("DRAFT"),
  notes: z.string().optional(),
});
