import { buildContractPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await prisma.contract.findUnique({ where: { id }, include: { customer: true } });
  const config = await prisma.carWashConfig.findFirst();
  if (!contract || !config) return new Response("Nao encontrado", { status: 404 });

  const buffer = await buildContractPdf({
    businessName: config.businessName,
    contractNumber: contract.contractNumber,
    customerName: contract.customer.name,
    title: contract.title,
    content: contract.content,
    signedAt: formatDate(contract.signedAt),
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${contract.contractNumber}.pdf"`,
    },
  });
}
