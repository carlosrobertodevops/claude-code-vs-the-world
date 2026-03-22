import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  phone: z.string().min(8, "Telefone invalido"),
  cpfCnpj: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const vehicleSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio"),
  plate: z.string().min(7, "Placa invalida").max(8),
  brand: z.string().min(1, "Marca obrigatoria"),
  model: z.string().min(1, "Modelo obrigatorio"),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  color: z.string().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
