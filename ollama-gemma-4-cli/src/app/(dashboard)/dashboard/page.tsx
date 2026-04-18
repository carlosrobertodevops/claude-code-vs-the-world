import DashboardLayout from "./layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-slate-500">Bem-vindo ao controle do seu lava-jato.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KPI Cards would be implemented here */}
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-slate-500">Veículos na Fila</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-slate-500">Serviços Hoje</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-slate-500">Faturamento Diário</p>
            <p className="text-3xl font-bold mt-2">R$ 0,00</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
