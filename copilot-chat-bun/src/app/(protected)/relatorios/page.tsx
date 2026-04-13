import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";
import { ReportsChart } from "@/components/dashboard/reports-chart";
import { PageIntro } from "@/components/layout/page-intro";
import { MetricGrid } from "@/components/ui/metric-grid";
import { reportRows } from "@/lib/demo-data";
import { requireManager } from "@/lib/auth-guards";
import { formatCurrency } from "@/lib/utils";
import { getDashboardSummaryUseCase } from "@/server/domain/use-cases/get-dashboard-summary.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  requireManager(session);
  const summary = await getDashboardSummaryUseCase(operationsRepository);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Relatorios"
        title="Indicadores gerenciais"
        description="Acompanhe receita, servicos mais vendidos e exporte dados para contabilidade e operacao."
      />

      <MetricGrid
        items={[
          { label: "Receita do dia", value: formatCurrency(summary.revenueToday) },
          { label: "Ordens abertas", value: String(summary.openOrders) },
          { label: "Quotes pendentes", value: String(summary.pendingQuotes) },
          { label: "Contratos assinados", value: String(summary.signedContracts) },
        ]}
      />

      <div className="flex justify-end">
        <Link
          href="/api/relatorios/csv"
          className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950"
        >
          Baixar CSV
        </Link>
      </div>

      <section className="surface-strong rounded-[28px] p-5">
        <h2 className="text-lg font-semibold text-white">Servicos mais vendidos</h2>
        <p className="mb-5 text-sm text-slate-400">
          Base pronta para exportacao e leitura executiva.
        </p>
        <ReportsChart data={reportRows} />
      </section>
    </div>
  );
}
