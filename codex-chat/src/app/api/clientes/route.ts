import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const customers = await prisma.customer.findMany({ include: { vehicles: true }, orderBy: { name: "asc" } });
  return apiSuccess(customers);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const body = await request.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const customer = await prisma.customer.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      cpfCnpj: parsed.data.cpfCnpj || null,
      address: parsed.data.address || null,
    },
  });
  return apiSuccess(customer);
}
