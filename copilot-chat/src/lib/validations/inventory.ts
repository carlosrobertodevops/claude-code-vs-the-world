import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  unit: z.string().min(1, "Unidade obrigatoria"),
  currentStock: z.coerce.number().min(0, "Estoque nao pode ser negativo"),
  minimumStock: z.coerce.number().min(0, "Estoque minimo nao pode ser negativo"),
  costPrice: z.coerce.number().min(0, "Preco nao pode ser negativo"),
  isActive: z.boolean().optional(),
});

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Produto obrigatorio"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unitCost: z.coerce.number().min(0).optional(),
  notes: z.string().optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
