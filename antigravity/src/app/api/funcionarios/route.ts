import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import bcryptjs from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);
    if (session.user.role !== "MANAGER") return errorResponse("FORBIDDEN", "Acesso negado", 403);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { serviceOrders: true } },
      },
    });

    return successResponse(users);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar funcionários", 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);
    if (session.user.role !== "MANAGER") return errorResponse("FORBIDDEN", "Acesso negado", 403);

    const body = await req.json();
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const existing = await prisma.user.findUnique({ where: { email: validation.data.email } });
    if (existing) return errorResponse("DUPLICATE", "Email já cadastrado", 400);

    const passwordHash = await bcryptjs.hash(validation.data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        passwordHash,
        role: validation.data.role,
        phone: validation.data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao criar funcionário", 500, error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);
    if (session.user.role !== "MANAGER") return errorResponse("FORBIDDEN", "Acesso negado", 403);

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return errorResponse("VALIDATION", "ID é obrigatório", 400);

    const validation = updateUserSchema.safeParse(rest);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const data: Record<string, unknown> = { ...validation.data };
    if (validation.data.password) {
      data.passwordHash = await bcryptjs.hash(validation.data.password, 12);
      delete data.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao atualizar funcionário", 500, error);
  }
}
