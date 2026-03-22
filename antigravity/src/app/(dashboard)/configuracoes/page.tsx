"use client";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState({ businessName: "", slug: "", simultaneousSlots: 2, phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { (async () => { try { const res = await fetch("/api/configuracoes"); const json = await res.json(); if (json.success && json.data.config) { const c = json.data.config; setConfig({ businessName: c.businessName, slug: c.slug, simultaneousSlots: c.simultaneousSlots, phone: c.phone || "", address: c.address || "" }); } } finally { setLoading(false); } })(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    try { const res = await fetch("/api/configuracoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) }); if (res.ok) setSaved(true); } finally { setSaving(false); setTimeout(() => setSaved(false), 3000); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Configurações</h1><p className="text-sm text-[hsl(var(--muted-foreground))]">Configure seu lava-jato</p></div>
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div><label className="block text-sm font-medium mb-1">Nome do Estabelecimento *</label><input type="text" value={config.businessName} onChange={e => setConfig({...config, businessName: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
          <div><label className="block text-sm font-medium mb-1">Slug da Fila Pública *</label><input type="text" value={config.slug} onChange={e => setConfig({...config, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")})} required className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">URL: /fila/{config.slug}</p></div>
          <div><label className="block text-sm font-medium mb-1">Vagas Simultâneas</label><input type="number" value={config.simultaneousSlots} onChange={e => setConfig({...config, simultaneousSlots: parseInt(e.target.value)})} min={1} max={10} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
          <div><label className="block text-sm font-medium mb-1">Telefone</label><input type="tel" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
          <div><label className="block text-sm font-medium mb-1">Endereço</label><input type="text" value={config.address} onChange={e => setConfig({...config, address: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
            </button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400 animate-fade-in">✓ Salvo com sucesso!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
