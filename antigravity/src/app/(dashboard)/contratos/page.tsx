"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from "@/lib/constants";
import { Plus, Loader2, Send, Eye } from "lucide-react";

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  createdAt: string;
  signedAt: string;
  customer: { id: string; name: string };
}

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({ customerId: "", title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const fetchContracts = async () => { try { const res = await fetch("/api/contratos"); const json = await res.json(); if (json.success) setContracts(json.data); } finally { setLoading(false); } };
  const fetchCustomers = async () => { const res = await fetch("/api/clientes"); const json = await res.json(); if (json.success) setCustomers(json.data); };

  useEffect(() => { fetchContracts(); fetchCustomers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contratos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setShowForm(false); setFormData({ customerId: "", title: "", content: "" }); fetchContracts(); }
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/contratos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchContracts();
  };

  const columns = [
    { key: "contractNumber", header: "Nº", sortable: true, render: (item: Contract) => <span className="font-medium">{item.contractNumber}</span> },
    { key: "title", header: "Título" },
    { key: "customer", header: "Cliente", render: (item: Contract) => item.customer.name },
    { key: "status", header: "Status", render: (item: Contract) => <StatusBadge label={CONTRACT_STATUS_LABELS[item.status]} colorClass={CONTRACT_STATUS_COLORS[item.status]} /> },
    { key: "createdAt", header: "Data", sortable: true, render: (item: Contract) => formatDate(item.createdAt) },
    { key: "signedAt", header: "Assinado em", render: (item: Contract) => item.signedAt ? formatDate(item.signedAt) : "—" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Contratos</h1><p className="text-sm text-[hsl(var(--muted-foreground))]">Gerencie contratos com clientes</p></div>

      <DataTable data={contracts} columns={columns} searchKey="title" searchPlaceholder="Buscar contrato..."
        headerActions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" /> Novo Contrato</button>}
        actions={(item: Contract) => (
          <>
            {item.status === "DRAFT" && <button onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, "PENDING_SIGNATURE"); }} className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Enviar p/ assinatura"><Send className="w-4 h-4" /></button>}
          </>
        )}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Novo Contrato</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Cliente *</label><select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"><option value="">Selecione...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Título *</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              <div><label className="block text-sm font-medium mb-1">Conteúdo *</label><textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required rows={8} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" placeholder="Conteúdo do contrato..." /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))]">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
