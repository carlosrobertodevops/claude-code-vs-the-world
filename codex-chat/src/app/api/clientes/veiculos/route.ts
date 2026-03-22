import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations/customer";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const body = await request.json();
  const parsed = vehicleSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const vehicle = await prisma.vehicle.create({ data: parsed.data });
  return apiSuccess(vehicle);
}
