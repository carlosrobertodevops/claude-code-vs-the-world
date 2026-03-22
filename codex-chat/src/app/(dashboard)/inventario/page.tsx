import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { nextSequence } from "@/lib/numbering";
import { requireSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { productSchema, stockMovementSchema } from "@/lib/validations/product";
import { formatCurrency } from "@/lib/utils";

export default async function InventoryPage() {
  const session = await requireSession();
  const [products, recentMovements] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.stockMovement.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  async function createProduct(formData: FormData) {
    "use server";

    const parsed = productSchema.safeParse({
      name: formData.get("name"),
      unit: formData.get("unit"),
      currentStock: formData.get("currentStock"),
      minimumStock: formData.get("minimumStock"),
      costPrice: formData.get("costPrice"),
    });

    if (!parsed.success) return;

    const product = await prisma.product.create({ data: parsed.data });

    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        userId: session.user.id,
        type: "IN",
        quantity: parsed.data.currentStock,
        unitCost: parsed.data.costPrice,
        note: `Carga inicial do produto ${nextSequence("PRD")}`,
      },
    });

    revalidatePath("/inventario");
    revalidatePath("/dashboard");
  }

  async function addMovement(formData: FormData) {
    "use server";

    const parsed = stockMovementSchema.safeParse({
      productId: formData.get("productId"),
      userId: session.user.id,
      type: formData.get("type"),
      quantity: formData.get("quantity"),
      unitCost: formData.get("unitCost") || undefined,
      note: formData.get("note") || undefined,
    });

    if (!parsed.success) return;

    const delta = parsed.data.type === "OUT" ? -parsed.data.quantity : parsed.data.quantity;

    await prisma.stockMovement.create({ data: parsed.data });
    await prisma.product.update({
      where: { id: parsed.data.productId },
      data: {
        currentStock: {
          increment: delta,
        },
      },
    });

    revalidatePath("/inventario");
    revalidatePath("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Inventario e estoque" description="Monitore insumos, adicione movimentacoes e evite ruptura nos itens essenciais da operacao." />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-slate-950">Cadastrar produto</h2>
          <form action={createProduct} className="mt-6 grid gap-4 md:grid-cols-2">
            <Input name="name" placeholder="Nome do produto" required />
            <Input name="unit" placeholder="Unidade" required />
            <Input name="currentStock" placeholder="Estoque atual" required type="number" />
            <Input name="minimumStock" placeholder="Estoque minimo" required type="number" />
            <Input className="md:col-span-2" name="costPrice" placeholder="Custo unitario" required type="number" step="0.01" />
            <Button className="md:col-span-2" type="submit">Salvar produto</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-slate-950">Registrar movimentacao</h2>
          <form action={addMovement} className="mt-6 grid gap-4 md:grid-cols-2">
            <select className="h-11 rounded-2xl border border-slate-200 px-4 md:col-span-2" name="productId" required>
              <option value="">Produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <select className="h-11 rounded-2xl border border-slate-200 px-4" name="type" required>
              <option value="IN">Entrada</option>
              <option value="OUT">Saida</option>
              <option value="ADJUSTMENT">Ajuste</option>
            </select>
            <Input name="quantity" placeholder="Quantidade" required step="0.01" type="number" />
            <Input name="unitCost" placeholder="Custo unitario" step="0.01" type="number" />
            <Input name="note" placeholder="Observacao" />
            <Button className="md:col-span-2" type="submit">Registrar movimentacao</Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold text-slate-950">Produtos cadastrados</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="pb-3">Produto</th>
                  <th className="pb-3">Estoque</th>
                  <th className="pb-3">Minimo</th>
                  <th className="pb-3">Custo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="py-4">{Number(product.currentStock).toFixed(2)} {product.unit}</td>
                    <td className="py-4">{Number(product.minimumStock).toFixed(2)} {product.unit}</td>
                    <td className="py-4">{formatCurrency(Number(product.costPrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-slate-950">Movimentacoes recentes</h2>
          <div className="mt-6 space-y-3">
            {recentMovements.map((movement) => (
              <div className="rounded-3xl border border-slate-200 p-4" key={movement.id}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{movement.product.name}</p>
                  <StatusBadge status={movement.type} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{Number(movement.quantity).toFixed(2)} • {movement.user.name}</p>
                <p className="mt-1 text-xs text-slate-500">{movement.note ?? "Sem observacao"}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
