import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { PageIntro } from "@/components/layout/page-intro";
import { DataTableCard } from "@/components/ui/data-table-card";
import { MetricGrid } from "@/components/ui/metric-grid";
import { requireManager } from "@/lib/auth-guards";
import { listEmployeesUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  requireManager(session);
  const employees = await listEmployeesUseCase(operationsRepository);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Equipe"
        title="Gestao de colaboradores"
        description="Acompanhe perfis, papeis e acessos da operacao."
      />

      <MetricGrid
        items={[
          { label: "Usuarios", value: String(employees.length) },
          {
            label: "Gerentes",
            value: String(employees.filter((item) => item.role === "MANAGER").length),
          },
          {
            label: "Colaboradores",
            value: String(employees.filter((item) => item.role === "EMPLOYEE").length),
          },
          { label: "Autenticacao", value: "JWT stateless" },
        ]}
      />

      <DataTableCard
        title="Usuarios do sistema"
        subtitle="Acesso segmentado por funcao."
        data={employees}
        columns={[
          { key: "name", header: "Nome", render: (item) => item.name },
          { key: "email", header: "Email", render: (item) => item.email },
          { key: "role", header: "Perfil", render: (item) => item.role },
        ]}
      />
    </div>
  );
}
