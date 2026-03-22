"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from "@/lib/constants";
import { Plus, Loader2, Play, CheckCircle, XCircle } from "lucide-react";

interface ServiceOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  notes: string;
  createdAt: string;
  startedAt: string;
  completedAt: string;
  customer: { id: string; name: string; phone: string };
  vehicle: { id: string; plate: string; brand: string; model: string };
  employee: { id: string; name: string } | null;
  items: Array<{ id: string; description: string; quantity: number; unitPrice: number; subtotal: number; serviceType: { name: string } | null }>;
}

export default function ServicosPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; vehicles: Array<{ id: string; plate: string; brand: string; model: string }> }>>([]);
  const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string; basePrice: number }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [items, setItems] = useState<Array<{ serviceTypeId: string; quantity: number; unitPrice: number }>>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    try {
      const url = statusFilter ? `/api/servicos?status=${statusFilter}` : "/api/servicos";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeps = async () => {
    const [custRes, confRes, empRes] = await Promise.all([
      fetch("/api/clientes"), fetch("/api/configuracoes"), fetch("/api/funcionarios"),
    ]);
    const [custJson, confJson, empJson] = await Promise.all([custRes.json(), confRes.json(), empRes.json()]);
    if (custJson.success) setCustomers(custJson.data);
    if (confJson.success) setServiceTypes(confJson.data.serviceTypes || []);
    if (empJson.success) setEmployees(empJson.data);
  };

  useEffect(() => { fetchOrders(); fetchDeps(); }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer,
          vehicleId: selectedVehicle,
          employeeId: selectedEmployee || undefined,
          notes,
          items,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchOrders();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/servicos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders();
  };

  const resetForm = () => {
    setSelectedCustomer(""); setSelectedVehicle(""); setSelectedEmployee("");
    setItems([]); setNotes("");
  };

  const addItem = () => {
    if (serviceTypes.length > 0) {
      setItems([...items, { serviceTypeId: serviceTypes[0].id, quantity: 1, unitPrice: serviceTypes[0].basePrice }]);
    }
  };

  const customerVehicles = customers.find(c => c.id === selectedCustomer)?.vehicles || [];

  const columns = [
    { key: "orderNumber", header: "OS", sortable: true, render: (item: ServiceOrder) => <span className="font-medium">{item.orderNumber}</span> },
    { key: "customer", header: "Cliente", render: (item: ServiceOrder) => item.customer.name },
    { key: "vehicle", header: "Veículo", render: (item: ServiceOrder) => `${item.vehicle.brand} ${item.vehicle.model} - ${item.vehicle.plate}` },
    { key: "employee", header: "Funcionário", render: (item: ServiceOrder) => item.employee?.name || "—" },
    { key: "status", header: "Status", render: (item: ServiceOrder) => <StatusBadge label={SERVICE_ORDER_STATUS_LABELS[item.status]} colorClass={SERVICE_ORDER_STATUS_COLORS[item.status]} /> },
    { key: "totalAmount", header: "Valor", render: (item: ServiceOrder) => formatCurrency(item.totalAmount) },
    { key: "createdAt", header: "Data", sortable: true, render: (item: ServiceOrder) => formatDateTime(item.createdAt) },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Gerencie as ordens de serviço</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${statusFilter === s ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted)/0.8)]"}`}>
            {s ? SERVICE_ORDER_STATUS_LABELS[s] : "Todos"}
          </button>
        ))}
      </div>

      <DataTable
        data={orders}
        columns={columns}
        searchKey="orderNumber"
        searchPlaceholder="Buscar por OS, cliente..."
        headerActions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Nova OS
          </button>
        }
        actions={(item: ServiceOrder) => (
          <>
            {item.status === "WAITING" && (
              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, "IN_PROGRESS"); }} className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors" title="Iniciar">
                <Play className="w-4 h-4" />
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, "COMPLETED"); }} className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors" title="Concluir">
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            {["WAITING", "IN_PROGRESS"].includes(item.status) && (
              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, "CANCELLED"); }} className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors" title="Cancelar">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      />

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Nova Ordem de Serviço</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <select value={selectedCustomer} onChange={e => { setSelectedCustomer(e.target.value); setSelectedVehicle(""); }} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
                  <option value="">Selecione...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedCustomer && (
                <div>
                  <label className="block text-sm font-medium mb-1">Veículo *</label>
                  <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
                    <option value="">Selecione...</option>
                    {customerVehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Funcionário</label>
                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
                  <option value="">Selecione...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Serviços *</label>
                  <button type="button" onClick={addItem} className="text-xs text-[hsl(var(--primary))] hover:underline">+ Adicionar serviço</button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={item.serviceTypeId} onChange={e => {
                      const st = serviceTypes.find(s => s.id === e.target.value);
                      const newItems = [...items]; newItems[i] = { ...item, serviceTypeId: e.target.value, unitPrice: st?.basePrice || 0 }; setItems(newItems);
                    }} className="flex-1 px-2 py-1.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm">
                      {serviceTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="number" value={item.quantity} onChange={e => { const newItems = [...items]; newItems[i] = { ...item, quantity: parseInt(e.target.value) }; setItems(newItems); }} className="w-16 px-2 py-1.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm" min={1} />
                    <input type="number" step="0.01" value={item.unitPrice} onChange={e => { const newItems = [...items]; newItems[i] = { ...item, unitPrice: parseFloat(e.target.value) }; setItems(newItems); }} className="w-24 px-2 py-1.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm" />
                    <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="px-2 text-red-500 hover:text-red-700">×</button>
                  </div>
                ))}
                {items.length > 0 && (
                  <p className="text-sm font-medium text-right mt-2">Total: {formatCurrency(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))}</p>
                )}
              </div>

              <div><label className="block text-sm font-medium mb-1">Observações</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))]">Cancelar</button>
                <button type="submit" disabled={saving || items.length === 0} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Criar OS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
