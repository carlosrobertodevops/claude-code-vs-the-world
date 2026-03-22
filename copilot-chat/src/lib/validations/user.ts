import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
  phone: z.string().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["MANAGER", "EMPLOYEE"]).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
