"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";

interface Employee { id: string; name: string; email: string; role: string; phone: string; isActive: boolean; createdAt: string; _count: { serviceOrders: number }; }
type UserRole = "MANAGER" | "EMPLOYEE";

export default function FuncionariosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{ name: string; email: string; password: string; role: UserRole; phone: string }>({ name: "", email: "", password: "", role: "EMPLOYEE", phone: "" });
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => { try { const res = await fetch("/api/funcionarios"); const json = await res.json(); if (json.success) setEmployees(json.data); } finally { setLoading(false); } };
  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { const res = await fetch("/api/funcionarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); if (res.ok) { setShowForm(false); setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", phone: "" }); fetchEmployees(); } } finally { setSaving(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/funcionarios", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) }); fetchEmployees();
  };

  const columns = [
    { key: "name", header: "Nome", sortable: true },
    { key: "email", header: "Email" },
    { key: "role", header: "Cargo", render: (item: Employee) => ROLE_LABELS[item.role] || item.role },
    { key: "isActive", header: "Status", render: (item: Employee) => <StatusBadge label={item.isActive ? "Ativo" : "Inativo"} colorClass={item.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"} /> },
    { key: "_count", header: "Serviços", render: (item: Employee) => item._count.serviceOrders },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Funcionários</h1><p className="text-sm text-[hsl(var(--muted-foreground))]">Gerencie a equipe</p></div>
      <DataTable data={employees} columns={columns} searchKey="name" searchPlaceholder="Buscar..."
        headerActions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" /> Novo</button>}
        actions={(item: Employee) => (<button onClick={(e) => { e.stopPropagation(); toggleActive(item.id, item.isActive); }} className={`px-3 py-1 rounded-md text-xs font-medium ${item.isActive ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>{item.isActive ? "Desativar" : "Ativar"}</button>)}
      />
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Novo Funcionário</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nome *</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Senha *</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Cargo</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm"><option value="EMPLOYEE">Funcionário</option><option value="MANAGER">Gerente</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
