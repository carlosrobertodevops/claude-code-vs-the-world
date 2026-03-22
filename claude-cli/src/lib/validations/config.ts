import { z } from "zod";

export const updateConfigSchema = z.object({
  businessName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens").optional(),
  simultaneousSlots: z.coerce.number().min(1, "Mínimo 1 box").max(20).optional(),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
