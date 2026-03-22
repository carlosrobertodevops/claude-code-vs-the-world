"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from "@/lib/constants";
import { Plus, Loader2, Send, Check, X } from "lucide-react";

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  totalAmount: number;
  notes: string;
  validUntil: string;
  createdAt: string;
  customer: { id: string; name: string };
  items: Array<{ serviceType: { name: string }; quantity: number; unitPrice: number; discount: number; subtotal: number }>;
}

export default function OrcamentosPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string; basePrice: number }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState<Array<{ serviceTypeId: string; quantity: number; unitPrice: number; discount: number }>>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuotes = async () => {
    try {
      const res = await fetch("/api/orcamentos");
      const json = await res.json();
      if (json.success) setQuotes(json.data);
    } finally { setLoading(false); }
  };

  const fetchDeps = async () => {
    const [custRes, confRes] = await Promise.all([fetch("/api/clientes"), fetch("/api/configuracoes")]);
    const [custJson, confJson] = await Promise.all([custRes.json(), confRes.json()]);
    if (custJson.success) setCustomers(custJson.data);
    if (confJson.success) setServiceTypes(confJson.data.serviceTypes || []);
  };

  useEffect(() => { fetchQuotes(); fetchDeps(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomer, notes, items }),
      });
      if (res.ok) { setShowForm(false); setSelectedCustomer(""); setItems([]); setNotes(""); fetchQuotes(); }
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/orcamentos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchQuotes();
  };

  const addItem = () => {
    if (serviceTypes.length > 0) {
      setItems([...items, { serviceTypeId: serviceTypes[0].id, quantity: 1, unitPrice: serviceTypes[0].basePrice, discount: 0 }]);
    }
  };

  const columns = [
    { key: "quoteNumber", header: "Nº", sortable: true, render: (item: Quote) => <span className="font-medium">{item.quoteNumber}</span> },
    { key: "customer", header: "Cliente", render: (item: Quote) => item.customer.name },
    { key: "status", header: "Status", render: (item: Quote) => <StatusBadge label={QUOTE_STATUS_LABELS[item.status]} colorClass={QUOTE_STATUS_COLORS[item.status]} /> },
    { key: "totalAmount", header: "Valor", render: (item: Quote) => formatCurrency(item.totalAmount) },
    { key: "createdAt", header: "Data", sortable: true, render: (item: Quote) => formatDate(item.createdAt) },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Orçamentos</h1><p className="text-sm text-[hsl(var(--muted-foreground))]">Crie e gerencie orçamentos</p></div>

      <DataTable data={quotes} columns={columns} searchKey="quoteNumber" searchPlaceholder="Buscar orçamento..."
        headerActions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" /> Novo Orçamento</button>}
        actions={(item: Quote) => (
          <>
            {item.status === "DRAFT" && <button onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, "SENT"); }} className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Enviar"><Send className="w-4 h-4" /></button>}
            {item.status === "SENT" && <>
              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, "APPROVED"); }} className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600" title="Aprovar"><Check className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, "REJECTED"); }} className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Rejeitar"><X className="w-4 h-4" /></button>
            </>}
          </>
        )}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Novo Orçamento</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Cliente *</label><select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"><option value="">Selecione...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Serviços *</label><button type="button" onClick={addItem} className="text-xs text-[hsl(var(--primary))] hover:underline">+ Adicionar</button></div>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <select value={item.serviceTypeId} onChange={e => { const st = serviceTypes.find(s => s.id === e.target.value); const newItems = [...items]; newItems[i] = { ...item, serviceTypeId: e.target.value, unitPrice: st?.basePrice || 0 }; setItems(newItems); }} className="flex-1 px-2 py-1.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm">{serviceTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    <input type="number" value={item.quantity} onChange={e => { const newItems = [...items]; newItems[i] = { ...item, quantity: parseInt(e.target.value) }; setItems(newItems); }} className="w-14 px-2 py-1.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm" min={1} placeholder="Qtd" />
                    <input type="number" step="0.01" value={item.unitPrice} onChange={e => { const newItems = [...items]; newItems[i] = { ...item, unitPrice: parseFloat(e.target.value) }; setItems(newItems); }} className="w-24 px-2 py-1.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm" placeholder="Preço" />
                    <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-lg">×</button>
                  </div>
                ))}
                {items.length > 0 && <p className="text-sm font-medium text-right mt-2">Total: {formatCurrency(items.reduce((s, i) => s + i.unitPrice * i.quantity - i.discount, 0))}</p>}
              </div>
              <div><label className="block text-sm font-medium mb-1">Observações</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))]">Cancelar</button>
                <button type="submit" disabled={saving || items.length === 0} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
