import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  currentStock: z.coerce.number().min(0),
  minimumStock: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
});

export const stockMovementSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0).optional(),
  note: z.string().optional(),
});
