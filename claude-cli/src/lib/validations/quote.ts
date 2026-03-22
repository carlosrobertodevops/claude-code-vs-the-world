import { z } from "zod";

export const createQuoteSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório"),
  notes: z.string().optional().or(z.literal("")),
  validUntil: z.string().optional(),
  items: z.array(z.object({
    serviceTypeId: z.string().min(1, "Serviço obrigatório"),
    quantity: z.coerce.number().min(1).default(1),
    unitPrice: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).max(100).default(0),
  })).min(1, "Adicione pelo menos um item"),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
