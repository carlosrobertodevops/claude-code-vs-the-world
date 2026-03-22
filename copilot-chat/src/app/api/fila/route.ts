import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireAuth, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireAuth();
    const entries = await prisma.queueEntry.findMany({
      include: {
        serviceOrder: {
          include: {
            customer: { select: { name: true, phone: true } },
            vehicle: { select: { plate: true, brand: true, model: true, color: true } },
            employee: { select: { name: true } },
            items: { include: { serviceType: true } },
          },
        },
      },
      orderBy: { position: "asc" },
    });
    return success(entries);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const { entries } = body as { entries: { id: string; position: number }[] };

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.queueEntry.update({
          where: { id: entry.id },
          data: { position: entry.position },
        })
      )
    );

    return success({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
