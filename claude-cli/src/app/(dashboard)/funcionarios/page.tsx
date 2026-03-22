"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useEmployees, useDeleteEmployee, type Employee } from "@/hooks/use-employees";

import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmployeeForm } from "@/components/forms/employee-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FuncionariosPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data, isLoading } = useEmployees();
  const deleteMutation = useDeleteEmployee();

  const employees = data?.data ?? [];

  function handleEdit(employee: Employee) {
    setEditingEmployee(employee);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditingEmployee(null);
    setFormOpen(true);
  }

  async function handleDelete(employee: Employee) {
    try {
      await deleteMutation.mutateAsync(employee.id);
      toast.success("Funcionario desativado com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao desativar funcionario";
      toast.error(message);
    }
  }

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Cargo",
      cell: ({ row }) => <StatusBadge status={row.original.role} />,
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <Badge variant={active ? "default" : "destructive"}>
            {active ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Acoes</span>,
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(employee)}>
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(employee)}
                disabled={!employee.isActive}
              >
                <Trash2 className="h-4 w-4" />
                Desativar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funcionarios"
        description="Gerencie os funcionarios do sistema."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Novo Funcionario
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={employees}
          searchKey="name"
          searchPlaceholder="Buscar por nome..."
        />
      )}

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
      />
    </div>
  );
}
