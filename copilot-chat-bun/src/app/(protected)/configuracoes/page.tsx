import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { PageIntro } from "@/components/layout/page-intro";
import { MetricGrid } from "@/components/ui/metric-grid";
import { requireManager } from "@/lib/auth-guards";
import { carWashConfig } from "@/lib/demo-data";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  requireManager(session);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Configuracoes"
        title="Parametros da operacao"
        description="Configuracoes base para identidade visual, fila publica e estrutura da unidade."
      />

      <MetricGrid
        items={[
          { label: "Unidade", value: carWashConfig.name },
          { label: "Slug publico", value: carWashConfig.slug },
          { label: "Tema dark", value: carWashConfig.darkBackground },
          { label: "Tema light", value: carWashConfig.lightBackground },
        ]}
      />

      <section className="surface-strong rounded-[28px] p-5">
        <h2 className="text-lg font-semibold text-white">Endereco</h2>
        <p className="mt-2 text-slate-400">{carWashConfig.address}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="surface-soft rounded-3xl p-4">
            <p className="text-sm text-slate-400">Cor de destaque</p>
            <p className="mt-2 font-medium text-white">{carWashConfig.themeAccent}</p>
          </div>
          <div className="surface-soft rounded-3xl p-4">
            <p className="text-sm text-slate-400">Fila publica</p>
            <p className="mt-2 font-medium text-white">
              {carWashConfig.publicQueueEnabled ? "Ativada" : "Desativada"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
