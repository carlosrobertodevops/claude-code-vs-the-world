"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCustomers,
  useCreateCustomer,
  useDeleteCustomer,
  type CustomerWithCount,
} from "@/hooks/use-customers";
import { CustomerForm } from "@/components/forms/customer-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import type { CreateCustomerInput } from "@/lib/validations/customer";

const columns: ColumnDef<CustomerWithCount>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <Link
        href={`/clientes/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "-",
  },
  {
    accessorKey: "cpfCnpj",
    header: "CPF/CNPJ",
    cell: ({ row }) => row.original.cpfCnpj || "-",
  },
  {
    id: "vehicles",
    header: "Veículos",
    cell: ({ row }) => row.original._count.vehicles,
  },
  {
    id: "actions",
    header: "",
    cell: function ActionsCell({ row }) {
      return <CustomerActions customer={row.original} />;
    },
  },
];

function CustomerActions({ customer }: { customer: CustomerWithCount }) {
  const [editOpen, setEditOpen] = useState(false);
  const deleteMutation = useDeleteCustomer();
  const updateMutation = useCreateCustomer();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      await deleteMutation.mutateAsync(customer.id);
      toast.success("Cliente excluído com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerForm
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        isLoading={updateMutation.isPending}
        onSubmit={async (data: CreateCustomerInput) => {
          try {
            await fetch(`/api/clientes/${customer.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            updateMutation.reset();
            setEditOpen(false);
            toast.success("Cliente atualizado com sucesso");
            window.location.reload();
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Erro ao atualizar"
            );
          }
        }}
      />
    </>
  );
}

export default function CustomersPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: customers, isLoading } = useCustomers();
  const createMutation = useCreateCustomer();

  const handleCreate = async (data: CreateCustomerInput) => {
    try {
      await createMutation.mutateAsync(data);
      setFormOpen(false);
      toast.success("Cliente cadastrado com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Clientes" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes e veículos."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={customers ?? []}
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
      />

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
