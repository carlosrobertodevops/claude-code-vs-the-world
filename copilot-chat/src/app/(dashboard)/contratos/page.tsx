"use client";

import { useState } from "react";
import { useContracts, useCreateContract, useUpdateContractStatus } from "@/hooks/use-contracts";
import { useCustomers } from "@/hooks/use-customers";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Send, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Contract = {
  id: string; contractNumber: string; title: string; status: string;
  createdAt: string; signedAt: string | null;
  customer: { name: string };
};
type Customer = { id: string; name: string };

export default function ContratosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: contracts = [], isLoading } = useContracts() as { data: Contract[]; isLoading: boolean };
  const { data: customers = [] } = useCustomers() as { data: Customer[] };
  const createContract = useCreateContract();
  const updateStatus = useUpdateContractStatus();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createContract.mutateAsync({
        customerId: form.get("customerId") as string,
        title: form.get("title") as string,
        content: form.get("content") as string,
      });
      toast.success("Contrato criado!");
      setDialogOpen(false);
    } catch (err: unknown) { toast.error((err as Error).message); }
  }

  async function handleStatus(id: string, status: string) {
    try { await updateStatus.mutateAsync({ id, status }); toast.success("Status atualizado!"); }
    catch (err: unknown) { toast.error((err as Error).message); }
  }

  function copySignUrl(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/contratos/${id}/assinar`);
    toast.success("Link de assinatura copiado!");
  }

  const columns: ColumnDef<Contract>[] = [
    { accessorKey: "contractNumber", header: "Numero" },
    { accessorKey: "title", header: "Titulo" },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "customer", header: "Cliente", cell: ({ row }) => row.original.customer.name },
    { id: "date", header: "Data", cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy") },
    { id: "signed", header: "Assinado em", cell: ({ row }) => row.original.signedAt ? format(new Date(row.original.signedAt), "dd/MM/yyyy HH:mm") : "-" },
    {
      id: "actions", cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex gap-1">
            {c.status === "DRAFT" && <Button size="sm" variant="outline" onClick={() => handleStatus(c.id, "PENDING_SIGNATURE")}><Send className="h-4 w-4 mr-1" /> Enviar</Button>}
            {c.status === "PENDING_SIGNATURE" && (
              <Button size="sm" variant="outline" onClick={() => copySignUrl(c.id)}><FileSignature className="h-4 w-4 mr-1" /> Link</Button>
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
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">Gerencie contratos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}><Plus className="mr-2 h-4 w-4" /> Novo Contrato</DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Novo Contrato</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select name="customerId">
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c: Customer) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Titulo</Label><Input name="title" required /></div>
              <div className="space-y-2"><Label>Conteudo</Label><Textarea name="content" rows={10} required /></div>
              <Button type="submit" className="w-full">Criar Contrato</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : <DataTable columns={columns} data={contracts} />}
    </div>
  );
}
