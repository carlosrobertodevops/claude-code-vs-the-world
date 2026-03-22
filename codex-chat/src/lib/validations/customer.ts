import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10),
  cpfCnpj: z.string().min(11).max(18).optional().or(z.literal("")),
  address: z.string().min(5).optional().or(z.literal("")),
});

export const vehicleSchema = z.object({
  customerId: z.string().min(1),
  plate: z.string().min(7).max(8),
  brand: z.string().min(2),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1990).max(2035),
  color: z.string().min(3),
});
