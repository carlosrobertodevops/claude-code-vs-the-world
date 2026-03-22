"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/data-table";
import { formatPhone, formatCpfCnpj, generateWhatsAppLink } from "@/lib/utils";
import { Plus, Loader2, Car, MessageCircle } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: string;
  vehicles: Array<{ id: string; plate: string; brand: string; model: string; color: string }>;
  _count: { serviceOrders: number };
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
  const [vehicleData, setVehicleData] = useState({ plate: "", brand: "", model: "", year: "", color: "" });
  const [saving, setSaving] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/clientes");
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
        fetchCustomers();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVehicleForm) return;
    setSaving(true);
    try {
      const res = await fetch("/api/clientes/veiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vehicleData, customerId: showVehicleForm, year: vehicleData.year ? parseInt(vehicleData.year) : undefined }),
      });
      if (res.ok) {
        setShowVehicleForm(null);
        setVehicleData({ plate: "", brand: "", model: "", year: "", color: "" });
        fetchCustomers();
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", header: "Nome", sortable: true },
    { key: "phone", header: "Telefone", render: (item: Customer) => (
      <div className="flex items-center gap-2">
        <span>{formatPhone(item.phone)}</span>
        <a href={generateWhatsAppLink(item.phone)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-500 transition-colors" title="WhatsApp">
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>
    )},
    { key: "cpfCnpj", header: "CPF/CNPJ", render: (item: Customer) => item.cpfCnpj ? formatCpfCnpj(item.cpfCnpj) : "—" },
    { key: "vehicles", header: "Veículos", render: (item: Customer) => (
      <span className="flex items-center gap-1.5">
        <Car className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        {item.vehicles.length}
      </span>
    )},
    { key: "_count", header: "Serviços", render: (item: Customer) => item._count.serviceOrders },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Gerenciamento de clientes e veículos</p>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar cliente..."
        onRowClick={(item) => setExpandedCustomer(expandedCustomer === item.id ? null : item.id)}
        headerActions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        }
        actions={(item: Customer) => (
          <button onClick={(e) => { e.stopPropagation(); setShowVehicleForm(item.id); }} className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors" title="Adicionar veículo">
            <Car className="w-4 h-4" />
          </button>
        )}
      />

      {/* Expanded customer vehicles */}
      {expandedCustomer && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 animate-fade-in">
          <h3 className="font-semibold mb-3">Veículos de {customers.find(c => c.id === expandedCustomer)?.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customers.find(c => c.id === expandedCustomer)?.vehicles.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                <Car className="w-5 h-5 text-[hsl(var(--primary))]" />
                <div>
                  <p className="text-sm font-medium">{v.brand} {v.model}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{v.plate} {v.color ? `• ${v.color}` : ''}</p>
                </div>
              </div>
            ))}
            {(customers.find(c => c.id === expandedCustomer)?.vehicles.length || 0) === 0 && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] col-span-full">Nenhum veículo cadastrado</p>
            )}
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Novo Cliente</h2>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nome *</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              <div><label className="block text-sm font-medium mb-1">Telefone *</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" placeholder="(11) 99999-9999" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              <div><label className="block text-sm font-medium mb-1">CPF/CNPJ</label><input type="text" value={formData.cpfCnpj} onChange={e => setFormData({...formData, cpfCnpj: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              <div><label className="block text-sm font-medium mb-1">Endereço</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Vehicle Modal */}
      {showVehicleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowVehicleForm(null)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Novo Veículo</h2>
            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Placa *</label><input type="text" value={vehicleData.plate} onChange={e => setVehicleData({...vehicleData, plate: e.target.value.toUpperCase()})} required maxLength={8} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" placeholder="ABC1D23" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Marca *</label><input type="text" value={vehicleData.brand} onChange={e => setVehicleData({...vehicleData, brand: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
                <div><label className="block text-sm font-medium mb-1">Modelo *</label><input type="text" value={vehicleData.model} onChange={e => setVehicleData({...vehicleData, model: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Ano</label><input type="number" value={vehicleData.year} onChange={e => setVehicleData({...vehicleData, year: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
                <div><label className="block text-sm font-medium mb-1">Cor</label><input type="text" value={vehicleData.color} onChange={e => setVehicleData({...vehicleData, color: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowVehicleForm(null)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
