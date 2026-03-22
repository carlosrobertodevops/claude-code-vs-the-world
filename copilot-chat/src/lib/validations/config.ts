import { z } from "zod";

export const configSchema = z.object({
  businessName: z.string().min(2, "Nome do negocio obrigatorio"),
  slug: z.string().min(2, "Slug obrigatorio").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  simultaneousSlots: z.coerce.number().int().positive().max(20),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  publicQueueEnabled: z.boolean().optional(),
  defaultMessage: z.string().optional().or(z.literal("")),
});

export type ConfigInput = z.infer<typeof configSchema>;
