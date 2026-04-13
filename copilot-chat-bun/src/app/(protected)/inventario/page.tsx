import { PageIntro } from "@/components/layout/page-intro";
import { DataTableCard } from "@/components/ui/data-table-card";
import { MetricGrid } from "@/components/ui/metric-grid";
import { formatCurrency } from "@/lib/utils";
import { listInventoryUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function InventoryPage() {
  const products = await listInventoryUseCase(operationsRepository);
  const lowStock = products.filter((item) => item.stock <= item.minimumStock);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Inventario"
        title="Controle de estoque"
        description="Acompanhe produtos, itens abaixo do minimo e custo unitario dos insumos usados na operacao."
      />

      <MetricGrid
        items={[
          { label: "Produtos cadastrados", value: String(products.length) },
          { label: "Itens em alerta", value: String(lowStock.length) },
          {
            label: "Valor medio por item",
            value: formatCurrency(
              products.reduce((sum, item) => sum + item.unitPrice, 0) / products.length,
            ),
          },
          {
            label: "Saldo em estoque",
            value: String(products.reduce((sum, item) => sum + item.stock, 0)),
          },
        ]}
      />

      <DataTableCard
        title="Produtos"
        subtitle="Visao operacional do estoque atual."
        data={products}
        columns={[
          { key: "name", header: "Produto", render: (item) => item.name },
          { key: "sku", header: "SKU", render: (item) => item.sku },
          { key: "unit", header: "Unidade", render: (item) => item.unit },
          { key: "stock", header: "Saldo", render: (item) => item.stock },
          {
            key: "minimum",
            header: "Minimo",
            render: (item) => item.minimumStock,
          },
          {
            key: "price",
            header: "Preco",
            render: (item) => formatCurrency(item.unitPrice),
          },
        ]}
      />
    </div>
  );
}
