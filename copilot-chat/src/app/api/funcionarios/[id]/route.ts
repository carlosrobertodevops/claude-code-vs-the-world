import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { success, error, requireRole, handleApiError } from "@/lib/api";
import { userUpdateSchema } from "@/lib/validations/user";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("MANAGER");
    const { id } = await params;
    const body = await req.json();
    const data = userUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
    });
    return success(user);
  } catch (err) {
    return handleApiError(err);
  }
}
