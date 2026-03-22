import { z } from "zod";

export const createContractSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório"),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
});

export const updateContractSchema = createContractSchema.partial();

export const signContractSchema = z.object({
  signatureData: z.string().min(1, "Assinatura obrigatória"),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type SignContractInput = z.infer<typeof signContractSchema>;
