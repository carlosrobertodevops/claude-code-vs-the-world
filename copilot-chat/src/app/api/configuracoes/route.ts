import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireRole, handleApiError } from "@/lib/api";
import { configSchema } from "@/lib/validations/config";

export async function GET() {
  try {
    await requireRole("MANAGER");
    let config = await prisma.carWashConfig.findFirst();
    if (!config) {
      config = await prisma.carWashConfig.create({
        data: {
          businessName: "AquaFlow Lava-Jato",
          slug: "aquaflow",
          simultaneousSlots: 2,
        },
      });
    }
    return success(config);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole("MANAGER");
    const body = await req.json();
    const data = configSchema.parse(body);

    let config = await prisma.carWashConfig.findFirst();
    if (config) {
      config = await prisma.carWashConfig.update({
        where: { id: config.id },
        data,
      });
    } else {
      config = await prisma.carWashConfig.create({ data });
    }
    return success(config);
  } catch (err) {
    return handleApiError(err);
  }
}
