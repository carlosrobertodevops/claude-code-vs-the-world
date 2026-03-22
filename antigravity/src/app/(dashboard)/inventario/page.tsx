"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { STOCK_MOVEMENT_LABELS } from "@/lib/constants";
import { Plus, Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPrice: number;
  isActive: boolean;
  movements: Array<{
    id: string;
    type: string;
    quantity: number;
    notes: string;
    createdAt: string;
    user: { name: string };
  }>;
}

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMovement, setShowMovement] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", unit: "un", currentStock: 0, minimumStock: 0, costPrice: 0 });
  const [movementData, setMovementData] = useState({ type: "IN", quantity: 0, notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/inventario");
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", unit: "un", currentStock: 0, minimumStock: 0, costPrice: 0 });
        fetchProducts();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMovement) return;
    setSaving(true);
    try {
      const res = await fetch("/api/inventario/movimentacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...movementData, productId: showMovement }),
      });
      if (res.ok) {
        setShowMovement(null);
        setMovementData({ type: "IN", quantity: 0, notes: "" });
        fetchProducts();
      }
    } finally {
      setSaving(false);
    }
  };

  const lowStockCount = products.filter(p => p.isActive && p.currentStock <= p.minimumStock).length;

  const columns = [
    { key: "name", header: "Produto", sortable: true },
    { key: "unit", header: "Unidade" },
    {
      key: "currentStock",
      header: "Estoque",
      sortable: true,
      render: (item: Product) => (
        <span className={item.currentStock <= item.minimumStock ? "text-red-600 dark:text-red-400 font-semibold" : ""}>
          {item.currentStock} {item.unit}
          {item.currentStock <= item.minimumStock && (
            <AlertTriangle className="inline w-3.5 h-3.5 ml-1" />
          )}
        </span>
      ),
    },
    { key: "minimumStock", header: "Mín.", render: (item: Product) => `${item.minimumStock} ${item.unit}` },
    { key: "costPrice", header: "Custo Unit.", render: (item: Product) => formatCurrency(item.costPrice) },
    {
      key: "isActive",
      header: "Status",
      render: (item: Product) => (
        <StatusBadge
          label={item.isActive ? "Ativo" : "Inativo"}
          colorClass={item.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventário</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Gerencie seus produtos e estoque</p>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>{lowStockCount}</strong> produto(s) com estoque abaixo do mínimo
          </p>
        </div>
      )}

      <DataTable
        data={products}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar produto..."
        headerActions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        }
        actions={(item: Product) => (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMovement(item.id); }}
              className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              title="Movimentação de estoque"
            >
              <Package className="w-4 h-4" />
            </button>
          </>
        )}
      />

      {/* Create Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Novo Produto</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Unidade</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
                    <option value="un">Unidade</option>
                    <option value="L">Litro</option>
                    <option value="mL">Mililitro</option>
                    <option value="kg">Kg</option>
                    <option value="g">Grama</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Custo Unit.</label>
                  <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Estoque Inicial</label>
                  <input type="number" step="0.1" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: parseFloat(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                  <input type="number" step="0.1" value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: parseFloat(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowMovement(null)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Movimentação de Estoque</h2>
            <form onSubmit={handleMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["IN", "OUT", "ADJUSTMENT"] as const).map(type => (
                    <button key={type} type="button" onClick={() => setMovementData({...movementData, type})}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                        movementData.type === type
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                      }`}>
                      {type === "IN" && <ArrowDownCircle className="w-4 h-4" />}
                      {type === "OUT" && <ArrowUpCircle className="w-4 h-4" />}
                      {type === "ADJUSTMENT" && <Package className="w-4 h-4" />}
                      {STOCK_MOVEMENT_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <input type="number" step="0.1" min="0.1" value={movementData.quantity} onChange={e => setMovementData({...movementData, quantity: parseFloat(e.target.value)})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea value={movementData.notes} onChange={e => setMovementData({...movementData, notes: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMovement(null)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
