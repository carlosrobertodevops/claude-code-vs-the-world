import { z } from "zod";

export const serviceTypeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  basePrice: z.coerce.number().positive("Preco deve ser positivo"),
  estimatedMinutes: z.coerce.number().int().positive("Tempo deve ser positivo"),
  isActive: z.boolean().optional(),
});

export const serviceOrderSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio"),
  vehicleId: z.string().min(1, "Veiculo obrigatorio"),
  employeeId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(z.object({
    serviceTypeId: z.string().optional(),
    productId: z.string().optional(),
    description: z.string().min(1, "Descricao obrigatoria"),
    quantity: z.coerce.number().positive(),
    unitPrice: z.coerce.number().min(0),
  })).min(1, "Adicione pelo menos um item"),
});

export const serviceOrderStatusSchema = z.object({
  status: z.enum(["WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export type ServiceTypeInput = z.infer<typeof serviceTypeSchema>;
export type ServiceOrderInput = z.infer<typeof serviceOrderSchema>;
