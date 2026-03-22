import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/api";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPdf } from "@/lib/pdf";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } } },
    });
    if (!contract) return new Response("Not found", { status: 404 });

    const buffer = await renderToBuffer(
      <ContractPdf contract={{
        ...contract,
        createdAt: contract.createdAt.toISOString(),
        signedAt: contract.signedAt?.toISOString(),
        signatureIp: contract.signatureIp ?? undefined,
      }} />
    );

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${contract.contractNumber}.pdf"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
