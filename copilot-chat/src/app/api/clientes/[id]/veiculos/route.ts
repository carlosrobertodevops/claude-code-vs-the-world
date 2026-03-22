import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireAuth, handleApiError } from "@/lib/api";
import { vehicleSchema } from "@/lib/validations/customer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = vehicleSchema.parse({ ...body, customerId: id });
    const vehicle = await prisma.vehicle.create({ data });
    return success(vehicle);
  } catch (err) {
    return handleApiError(err);
  }
}
