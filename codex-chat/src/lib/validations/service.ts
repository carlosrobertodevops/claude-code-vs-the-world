import { z } from "zod";

export const serviceOrderSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  employeeId: z.string().optional(),
  serviceTypeId: z.string().min(1),
  productId: z.string().optional(),
  status: z.enum(["WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("WAITING"),
  notes: z.string().optional(),
});

export const serviceStatusSchema = z.object({
  status: z.enum(["WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});
