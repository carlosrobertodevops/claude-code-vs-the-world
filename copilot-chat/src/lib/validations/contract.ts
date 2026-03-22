import { z } from "zod";

export const contractSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio"),
  title: z.string().min(2, "Titulo obrigatorio"),
  content: z.string().min(10, "Conteudo obrigatorio"),
});

export const contractStatusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_SIGNATURE", "SIGNED", "CANCELLED"]),
});

export const contractSignatureSchema = z.object({
  signatureData: z.string().min(1, "Assinatura obrigatoria"),
});

export type ContractInput = z.infer<typeof contractSchema>;
