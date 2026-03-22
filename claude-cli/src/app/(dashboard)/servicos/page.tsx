"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreHorizontal,
  Play,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  useServiceOrders,
  useUpdateServiceOrderStatus,
  useDeleteServiceOrder,
  type ServiceOrderListItem,
} from "@/hooks/use-service-orders";
import { ServiceOrderForm } from "@/components/forms/service-order-form";
import { useCreateServiceOrder } from "@/hooks/use-service-orders";
import { toast } from "sonner";
import { format } from "date-fns";
import type { CreateServiceOrderInput } from "@/lib/validations/service";

const STATUS_TABS = [
  { value: "ALL", label: "Todas" },
  { value: "WAITING", label: "Aguardando" },
  { value: "IN_PROGRESS", label: "Em Andamento" },
  { value: "COMPLETED", label: "Concluídas" },
  { value: "CANCELLED", label: "Canceladas" },
];

function OrderActions({ order }: { order: ServiceOrderListItem }) {
  const updateStatus = useUpdateServiceOrderStatus(order.id);
  const deleteMutation = useDeleteServiceOrder();

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync(status);
      toast.success("Status atualizado com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta OS?")) return;
    try {
      await deleteMutation.mutateAsync(order.id);
      toast.success("OS excluída com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {order.status === "WAITING" && (
          <DropdownMenuItem onClick={() => handleStatusChange("IN_PROGRESS")}>
            <Play className="h-4 w-4" />
            Iniciar
          </DropdownMenuItem>
        )}
        {(order.status === "WAITING" || order.status === "IN_PROGRESS") && (
          <DropdownMenuItem onClick={() => handleStatusChange("COMPLETED")}>
            <CheckCircle className="h-4 w-4" />
            Concluir
          </DropdownMenuItem>
        )}
        {(order.status === "WAITING" || order.status === "IN_PROGRESS") && (
          <DropdownMenuItem onClick={() => handleStatusChange("CANCELLED")}>
            <XCircle className="h-4 w-4" />
            Cancelar
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<ServiceOrderListItem>[] = [
  {
    accessorKey: "orderNumber",
    header: "Número",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.orderNumber}</span>
    ),
  },
  {
    id: "customer",
    header: "Cliente",
    cell: ({ row }) => row.original.customer.name,
    filterFn: (row, _, filterValue) => {
      const name = row.original.customer.name.toLowerCase();
      return name.includes((filterValue as string).toLowerCase());
    },
  },
  {
    id: "vehicle",
    header: "Veículo",
    cell: ({ row }) => row.original.vehicle.plate,
  },
  {
    id: "employee",
    header: "Funcionário",
    cell: ({ row }) => row.original.employee?.name || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => `R$ ${row.original.totalAmount.toFixed(2)}`,
  },
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <OrderActions order={row.original} />,
  },
];

export default function ServiceOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);

  const { data: orders, isLoading } = useServiceOrders(statusFilter);
  const createMutation = useCreateServiceOrder();

  const handleCreate = async (data: CreateServiceOrderInput) => {
    try {
      await createMutation.mutateAsync(data);
      setFormOpen(false);
      toast.success("Ordem de serviço criada com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar OS");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ordens de Serviço" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-lg" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie as ordens de serviço do lava-jato."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova OS
          </Button>
        }
      />

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={orders ?? []}
        searchKey="customer"
        searchPlaceholder="Buscar por cliente..."
      />

      <ServiceOrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
