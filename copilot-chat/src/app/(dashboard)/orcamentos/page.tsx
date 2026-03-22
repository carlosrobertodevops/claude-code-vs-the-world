"use client";

import { useState } from "react";
import { useQuotes, useCreateQuote, useUpdateQuoteStatus, useDeleteQuote } from "@/hooks/use-quotes";
import { useCustomers } from "@/hooks/use-customers";
import { useServiceTypes } from "@/hooks/use-services";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Send, Check, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type QuoteItem = { id: string; quantity: number; unitPrice: number; discount: number; subtotal: number; serviceType: { name: string } };
type Quote = {
  id: string; quoteNumber: string; status: string; totalAmount: number;
  createdAt: string; notes: string | null;
  customer: { name: string; phone: string };
  items: QuoteItem[];
};
type Customer = { id: string; name: string };
type ServiceType = { id: string; name: string; basePrice: number };

export default function OrcamentosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<{ serviceTypeId: string; quantity: number; unitPrice: number; discount: number }[]>([]);

  const { data: quotes = [], isLoading } = useQuotes() as { data: Quote[]; isLoading: boolean };
  const { data: customers = [] } = useCustomers() as { data: Customer[] };
  const { data: serviceTypes = [] } = useServiceTypes() as { data: ServiceType[] };
  const createQuote = useCreateQuote();
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();

  function addItem() {
    setItems([...items, { serviceTypeId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
  }

  function updateItem(index: number, field: string, value: string | number) {
    const newItems = [...items];
    (newItems[index] as Record<string, unknown>)[field] = value;
    if (field === "serviceTypeId") {
      const st = serviceTypes.find((t: ServiceType) => t.id === value);
      if (st) newItems[index].unitPrice = st.basePrice;
    }
    setItems(newItems);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createQuote.mutateAsync({
        customerId: form.get("customerId") as string,
        notes: form.get("notes") as string,
        validUntil: form.get("validUntil") as string,
        items,
      });
      toast.success("Orcamento criado!");
      setDialogOpen(false);
      setItems([]);
    } catch (err: unknown) { toast.error((err as Error).message); }
  }

  async function handleStatus(id: string, status: string) {
    try { await updateStatus.mutateAsync({ id, status }); toast.success("Status atualizado!"); }
    catch (err: unknown) { toast.error((err as Error).message); }
  }

  const columns: ColumnDef<Quote>[] = [
    { accessorKey: "quoteNumber", header: "Numero" },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "customer", header: "Cliente", cell: ({ row }) => row.original.customer.name },
    { accessorKey: "totalAmount", header: "Total", cell: ({ row }) => `R$ ${row.original.totalAmount.toFixed(2)}` },
    { id: "date", header: "Data", cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy") },
    {
      id: "actions", cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex gap-1">
            {q.status === "DRAFT" && <Button size="sm" variant="outline" onClick={() => handleStatus(q.id, "SENT")}><Send className="h-4 w-4" /></Button>}
            {q.status === "SENT" && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleStatus(q.id, "APPROVED")}><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => handleStatus(q.id, "REJECTED")}><X className="h-4 w-4" /></Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orcamentos</h1>
          <p className="text-muted-foreground">Gerencie orcamentos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}><Plus className="mr-2 h-4 w-4" /> Novo Orcamento</DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Orcamento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select name="customerId">
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c: Customer) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Valido ate</Label><Input name="validUntil" type="date" /></div>
              </div>
              <div className="space-y-2"><Label>Observacoes</Label><Textarea name="notes" /></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Itens</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-1 h-3 w-3" /> Adicionar</Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Select value={item.serviceTypeId} onValueChange={(v) => v && updateItem(i, "serviceTypeId", v)}>
                        <SelectTrigger><SelectValue placeholder="Servico" /></SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((st: ServiceType) => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><Input type="number" placeholder="Qtd" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value))} /></div>
                    <div className="col-span-2"><Input type="number" step="0.01" placeholder="Preco" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value))} /></div>
                    <div className="col-span-2"><Input type="number" placeholder="Desc %" value={item.discount} onChange={(e) => updateItem(i, "discount", parseFloat(e.target.value))} /></div>
                    <div className="col-span-1"><span className="text-sm">R$ {(item.quantity * item.unitPrice * (1 - item.discount / 100)).toFixed(2)}</span></div>
                    <div className="col-span-1"><Button type="button" variant="ghost" size="sm" onClick={() => setItems(items.filter((_, idx) => idx !== i))}><XCircle className="h-4 w-4" /></Button></div>
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={items.length === 0}>Criar Orcamento</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : <DataTable columns={columns} data={quotes} />}
    </div>
  );
}
