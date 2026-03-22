import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(8, "Telefone inválido"),
  cpfCnpj: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createVehicleSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório"),
  plate: z.string().min(7, "Placa inválida").max(8),
  brand: z.string().min(1, "Marca obrigatória"),
  model: z.string().min(1, "Modelo obrigatório"),
  year: z.coerce.number().min(1900).max(2100).optional(),
  color: z.string().optional().or(z.literal("")),
});

export const updateVehicleSchema = createVehicleSchema.partial().omit({ customerId: true });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
