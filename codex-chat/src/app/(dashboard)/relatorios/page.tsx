import Link from "next/link";

import { RevenueChart } from "@/components/charts/revenue-chart";
import { ServiceMixChart } from "@/components/charts/service-mix-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { requireManagerPage } from "@/lib/permissions";
import { getReportData } from "@/lib/reports";

export default async function ReportsPage() {
  await requireManagerPage();
  const report = await getReportData();

  return (
    <div className="space-y-6">
      <PageHeader title="Relatorios" description="Acompanhe desempenho da operacao, exporte CSV e identifique gargalos de estoque ou mix de servicos.">
        <Link className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-4 text-sm font-semibold text-white" href="/api/relatorios/export?type=services">Exportar servicos CSV</Link>
        <Link className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700" href="/api/relatorios/export?type=customers">Exportar clientes CSV</Link>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-2">
        <RevenueChart data={report.revenueByDay} />
        <ServiceMixChart data={report.serviceMix} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold text-slate-950">Clientes com mais pontos</h2>
          <div className="mt-6 space-y-3">
            {report.topCustomers.map((customer) => (
              <div className="rounded-3xl border border-slate-200 p-4" key={customer.id}>
                <p className="font-semibold text-slate-900">{customer.name}</p>
                <p className="mt-1 text-sm text-slate-600">{customer.loyaltyPoints} pontos</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-slate-950">Itens em alerta</h2>
          <div className="mt-6 space-y-3">
            {report.lowStock.map((product) => (
              <div className="rounded-3xl border border-slate-200 p-4" key={product.id}>
                <p className="font-semibold text-slate-900">{product.name}</p>
                <p className="mt-1 text-sm text-slate-600">{Number(product.currentStock).toFixed(2)} {product.unit} disponiveis</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
