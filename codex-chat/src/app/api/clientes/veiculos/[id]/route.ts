import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations/customer";
import { apiError, apiSuccess } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const { id } = await params;
  const body = await request.json();
  const parsed = vehicleSchema.partial().safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const vehicle = await prisma.vehicle.update({ where: { id }, data: parsed.data });
  return apiSuccess(vehicle);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const { id } = await params;
  await prisma.vehicle.delete({ where: { id } });
  return apiSuccess({ id });
}
