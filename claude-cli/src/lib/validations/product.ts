import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  unit: z.string().min(1, "Unidade obrigatória"),
  currentStock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  minimumStock: z.coerce.number().min(0, "Estoque mínimo não pode ser negativo"),
  costPrice: z.coerce.number().min(0, "Preço não pode ser negativo"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createStockMovementSchema = z.object({
  productId: z.string().min(1, "Produto obrigatório"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unitCost: z.coerce.number().min(0).optional(),
  notes: z.string().optional().or(z.literal("")),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
