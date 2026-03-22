import { z } from "zod";

// ===== User Schemas =====
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["MANAGER", "EMPLOYEE"]).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ===== Customer Schemas =====
export const createCustomerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  cpfCnpj: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ===== Vehicle Schemas =====
export const createVehicleSchema = z.object({
  customerId: z.string().cuid("Cliente inválido"),
  plate: z.string().min(7, "Placa inválida").max(8),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.coerce.number().int().min(1900).max(2030).optional(),
  color: z.string().optional().or(z.literal("")),
});

export const updateVehicleSchema = createVehicleSchema.partial().omit({ customerId: true });

// ===== Product Schemas =====
export const createProductSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  unit: z.string().default("un"),
  currentStock: z.coerce.number().min(0).default(0),
  minimumStock: z.coerce.number().min(0).default(0),
  costPrice: z.coerce.number().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const stockMovementSchema = z.object({
  productId: z.string().cuid(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unitCost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

// ===== ServiceType Schemas =====
export const createServiceTypeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  basePrice: z.coerce.number().min(0, "Preço deve ser positivo"),
  estimatedMinutes: z.coerce.number().int().min(1).default(60),
  isActive: z.boolean().default(true),
});

export const updateServiceTypeSchema = createServiceTypeSchema.partial();

// ===== Quote Schemas =====
export const createQuoteSchema = z.object({
  customerId: z.string().cuid("Cliente inválido"),
  notes: z.string().optional().or(z.literal("")),
  validUntil: z.string().optional(),
  items: z.array(z.object({
    serviceTypeId: z.string().cuid(),
    quantity: z.coerce.number().int().min(1).default(1),
    unitPrice: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
  })).min(1, "Adicione pelo menos um item"),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]),
});

// ===== Contract Schemas =====
export const createContractSchema = z.object({
  customerId: z.string().cuid("Cliente inválido"),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "Conteúdo é obrigatório"),
});

export const updateContractSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  status: z.enum(["DRAFT", "PENDING_SIGNATURE", "SIGNED", "CANCELLED"]).optional(),
});

export const signContractSchema = z.object({
  signatureData: z.string().min(1, "Assinatura é obrigatória"),
});

// ===== ServiceOrder Schemas =====
export const createServiceOrderSchema = z.object({
  customerId: z.string().cuid("Cliente inválido"),
  vehicleId: z.string().cuid("Veículo inválido"),
  employeeId: z.string().cuid().optional(),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(z.object({
    serviceTypeId: z.string().cuid().optional(),
    productId: z.string().cuid().optional(),
    description: z.string().optional(),
    quantity: z.coerce.number().int().min(1).default(1),
    unitPrice: z.coerce.number().min(0),
  })).min(1, "Adicione pelo menos um item"),
});

export const updateServiceOrderStatusSchema = z.object({
  status: z.enum(["WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

// ===== CarWashConfig Schemas =====
export const updateConfigSchema = z.object({
  businessName: z.string().min(2).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens").optional(),
  simultaneousSlots: z.coerce.number().int().min(1).max(10).optional(),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

// ===== Pagination Schema =====
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type CreateServiceTypeInput = z.infer<typeof createServiceTypeSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
