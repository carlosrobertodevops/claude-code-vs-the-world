import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireAuth, handleApiError } from "@/lib/api";
import { serviceTypeSchema } from "@/lib/validations/service";

export async function GET() {
  try {
    await requireAuth();
    const types = await prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return success(types);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = serviceTypeSchema.parse(body);
    const type = await prisma.serviceType.create({ data });
    return success(type);
  } catch (err) {
    return handleApiError(err);
  }
}
