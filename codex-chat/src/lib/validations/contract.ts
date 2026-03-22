import { z } from "zod";

export const contractSchema = z.object({
  customerId: z.string().min(1),
  title: z.string().min(3),
  content: z.string().min(20),
  status: z.enum(["DRAFT", "PENDING_SIGNATURE", "SIGNED", "CANCELLED"]).default("DRAFT"),
});

export const contractSignatureSchema = z.object({
  signatureData: z.string().min(3),
});
