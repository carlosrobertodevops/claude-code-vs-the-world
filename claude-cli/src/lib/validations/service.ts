import { z } from "zod";

export const createServiceTypeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  basePrice: z.coerce.number().min(0, "Preço não pode ser negativo"),
  estimatedMinutes: z.coerce.number().min(1, "Tempo estimado deve ser positivo"),
});

export const updateServiceTypeSchema = createServiceTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createServiceOrderSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório"),
  vehicleId: z.string().min(1, "Veículo obrigatório"),
  employeeId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(z.object({
    serviceTypeId: z.string().optional(),
    productId: z.string().optional(),
    description: z.string().optional(),
    quantity: z.coerce.number().min(1).default(1),
    unitPrice: z.coerce.number().min(0),
  })).min(1, "Adicione pelo menos um item"),
});

export const updateServiceOrderStatusSchema = z.object({
  status: z.enum(["WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export type CreateServiceTypeInput = z.infer<typeof createServiceTypeSchema>;
export type UpdateServiceTypeInput = z.infer<typeof updateServiceTypeSchema>;
export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
