import { z } from "zod";

export const quoteItemSchema = z.object({
  serviceTypeId: z.string().min(1, "Servico obrigatorio"),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100).optional(),
});

export const quoteSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio"),
  notes: z.string().optional().or(z.literal("")),
  validUntil: z.string().optional().or(z.literal("")),
  items: z.array(quoteItemSchema).min(1, "Adicione pelo menos um item"),
});

export const quoteStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
