"use client";

import { useState } from "react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useCreateVehicle } from "@/hooks/use-customers";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Car, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";

type Vehicle = { id: string; plate: string; brand: string; model: string; year: number | null; color: string | null };
type Customer = {
  id: string; name: string; email: string | null; phone: string;
  cpfCnpj: string | null; address: string | null;
  vehicles: Vehicle[];
  _count: { serviceOrders: number };
};

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data: customers = [], isLoading } = useCustomers(search) as { data: Customer[]; isLoading: boolean };
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const createVehicle = useCreateVehicle();

  async function handleSubmitCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      cpfCnpj: form.get("cpfCnpj") as string,
      address: form.get("address") as string,
    };
    try {
      if (editCustomer) {
        await updateCustomer.mutateAsync({ id: editCustomer.id, data });
        toast.success("Cliente atualizado!");
      } else {
        await createCustomer.mutateAsync(data);
        toast.success("Cliente criado!");
      }
      setDialogOpen(false);
      setEditCustomer(null);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  async function handleSubmitVehicle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      plate: (form.get("plate") as string).toUpperCase(),
      brand: form.get("brand") as string,
      model: form.get("model") as string,
      year: form.get("year") ? parseInt(form.get("year") as string) : undefined,
      color: form.get("color") as string,
    };
    try {
      await createVehicle.mutateAsync({ customerId: selectedCustomerId, data });
      toast.success("Veiculo adicionado!");
      setVehicleDialogOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  function getWhatsAppLink(phone: string) {
    const cleaned = phone.replace(/\D/g, "");
    const num = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    return `https://wa.me/${num}`;
  }

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "phone", header: "Telefone" },
    { accessorKey: "cpfCnpj", header: "CPF/CNPJ" },
    {
      id: "vehicles",
      header: "Veiculos",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.vehicles.map((v) => (
            <Badge key={v.id} variant="secondary">{v.plate}</Badge>
          ))}
        </div>
      ),
    },
    {
      id: "orders",
      header: "Servicos",
      cell: ({ row }) => row.original._count.serviceOrders,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditCustomer(row.original); setDialogOpen(true); }}>Editar</Button>
          <Button size="sm" variant="outline" onClick={() => { setSelectedCustomerId(row.original.id); setVehicleDialogOpen(true); }}>
            <Car className="h-4 w-4" />
          </Button>
          <a href={getWhatsAppLink(row.original.phone)} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline"><MessageCircle className="h-4 w-4" /></Button>
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie clientes e veiculos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditCustomer(null); }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editCustomer ? "Editar" : "Novo"} Cliente</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmitCustomer} className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input name="name" defaultValue={editCustomer?.name} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Telefone</Label><Input name="phone" defaultValue={editCustomer?.phone} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editCustomer?.email || ""} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>CPF/CNPJ</Label><Input name="cpfCnpj" defaultValue={editCustomer?.cpfCnpj || ""} /></div>
                <div className="space-y-2"><Label>Endereco</Label><Input name="address" defaultValue={editCustomer?.address || ""} /></div>
              </div>
              <Button type="submit" className="w-full">{editCustomer ? "Salvar" : "Criar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Veiculo</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitVehicle} className="space-y-4">
            <div className="space-y-2"><Label>Placa</Label><Input name="plate" placeholder="ABC1D23" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marca</Label><Input name="brand" required /></div>
              <div className="space-y-2"><Label>Modelo</Label><Input name="model" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ano</Label><Input name="year" type="number" /></div>
              <div className="space-y-2"><Label>Cor</Label><Input name="color" /></div>
            </div>
            <Button type="submit" className="w-full">Adicionar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Input placeholder="Buscar por nome, telefone ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : <DataTable columns={columns} data={customers} />}
    </div>
  );
}
