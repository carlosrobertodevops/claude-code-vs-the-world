"use client";

import { useState } from "react";
import { useServiceOrders, useCreateServiceOrder, useUpdateServiceOrderStatus, useServiceTypes } from "@/hooks/use-services";
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
import { Plus, Play, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ServiceOrder = {
  id: string; orderNumber: string; status: string; totalAmount: number;
  createdAt: string; notes: string | null;
  customer: { name: string; phone: string };
  vehicle: { plate: string; brand: string; model: string };
  employee: { name: string } | null;
  items: { id: string; description: string; quantity: number; unitPrice: number; subtotal: number }[];
};
type Customer = { id: string; name: string; vehicles: { id: string; plate: string; brand: string; model: string }[] };
type ServiceType = { id: string; name: string; basePrice: number; estimatedMinutes: number };

export default function ServicosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState<{ serviceTypeId: string; description: string; quantity: number; unitPrice: number }[]>([]);

  const { data: orders = [], isLoading } = useServiceOrders(statusFilter, search) as { data: ServiceOrder[]; isLoading: boolean };
  const { data: customers = [] } = useCustomers() as { data: Customer[] };
  const { data: serviceTypes = [] } = useServiceTypes() as { data: ServiceType[] };
  const createOrder = useCreateServiceOrder();
  const updateStatus = useUpdateServiceOrderStatus();

  const customer = customers.find((c: Customer) => c.id === selectedCustomer);

  function addItem() {
    setItems([...items, { serviceTypeId: "", description: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateItem(index: number, field: string, value: string | number) {
    const newItems = [...items];
    (newItems[index] as Record<string, unknown>)[field] = value;
    if (field === "serviceTypeId") {
      const st = serviceTypes.find((t: ServiceType) => t.id === value);
      if (st) {
        newItems[index].description = st.name;
        newItems[index].unitPrice = st.basePrice;
      }
    }
    setItems(newItems);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createOrder.mutateAsync({
        customerId: selectedCustomer,
        vehicleId: form.get("vehicleId") as string,
        employeeId: form.get("employeeId") as string,
        notes: form.get("notes") as string,
        items,
      });
      toast.success("Ordem de servico criada!");
      setDialogOpen(false);
      setItems([]);
      setSelectedCustomer("");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status atualizado!");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  const columns: ColumnDef<ServiceOrder>[] = [
    { accessorKey: "orderNumber", header: "Numero" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "customer",
      header: "Cliente",
      cell: ({ row }) => row.original.customer.name,
    },
    {
      id: "vehicle",
      header: "Veiculo",
      cell: ({ row }) => `${row.original.vehicle.plate} - ${row.original.vehicle.brand} ${row.original.vehicle.model}`,
    },
    {
      id: "employee",
      header: "Responsavel",
      cell: ({ row }) => row.original.employee?.name || "-",
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => `R$ ${row.original.totalAmount.toFixed(2)}`,
    },
    {
      id: "date",
      header: "Data",
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="flex gap-1">
            {o.status === "WAITING" && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange(o.id, "IN_PROGRESS")}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            {o.status === "IN_PROGRESS" && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange(o.id, "COMPLETED")}>
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {(o.status === "WAITING" || o.status === "IN_PROGRESS") && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange(o.id, "CANCELLED")}>
                <XCircle className="h-4 w-4" />
              </Button>
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
          <h1 className="text-2xl font-bold">Ordens de Servico</h1>
          <p className="text-muted-foreground">Gerencie as ordens de servico</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Nova OS
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nova Ordem de Servico</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={selectedCustomer} onValueChange={(v) => v && setSelectedCustomer(v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c: Customer) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Veiculo</Label>
                  <Select name="vehicleId">
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {customer?.vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observacoes</Label>
                <Textarea name="notes" />
              </div>
              <input type="hidden" name="employeeId" value="" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Itens</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-1 h-3 w-3" /> Adicionar
                  </Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Select value={item.serviceTypeId} onValueChange={(v) => v && updateItem(i, "serviceTypeId", v)}>
                        <SelectTrigger><SelectValue placeholder="Servico" /></SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((st: ServiceType) => (
                            <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input placeholder="Descricao" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="Qtd" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value))} />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" step="0.01" placeholder="Preco" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value))} />
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length > 0 && (
                  <p className="text-right font-bold">
                    Total: R$ {items.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toFixed(2)}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={items.length === 0}>Criar Ordem</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <Input placeholder="Buscar por numero, cliente ou placa..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todos status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="WAITING">Aguardando</SelectItem>
            <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
            <SelectItem value="COMPLETED">Concluido</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : <DataTable columns={columns} data={orders} />}
    </div>
  );
}
