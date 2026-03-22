import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";
import { apiError, apiSuccess } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);

  const { id } = await params;
  const body = await request.json();
  const parsed = customerSchema.partial().safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const customer = await prisma.customer.update({ where: { id }, data: parsed.data });
  return apiSuccess(customer);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const { id } = await params;
  await prisma.customer.delete({ where: { id } });
  return apiSuccess({ id });
}
