import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { success, error, requireRole, handleApiError } from "@/lib/api";
import { userCreateSchema, userUpdateSchema } from "@/lib/validations/user";

export async function GET() {
  try {
    await requireRole("MANAGER");
    const users = await prisma.user.findMany({
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
      orderBy: { name: "asc" },
    });
    return success(users);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("MANAGER");
    const body = await req.json();
    const data = userCreateSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return error("Email ja cadastrado", 400);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        phone: data.phone,
      },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });
    return success(user);
  } catch (err) {
    return handleApiError(err);
  }
}
