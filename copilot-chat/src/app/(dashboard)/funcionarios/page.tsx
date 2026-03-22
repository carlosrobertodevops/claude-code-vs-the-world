"use client";

import { useState } from "react";
import { useEmployees, useCreateEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS } from "@/lib/constants";

type Employee = {
  id: string; name: string; email: string; role: string; active: boolean;
};

export default function FuncionariosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const { data: employees = [], isLoading } = useEmployees() as { data: Employee[]; isLoading: boolean };
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(e: Employee) { setEditing(e); setDialogOpen(true); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      role: form.get("role") as string,
    };
    const password = form.get("password") as string;
    if (password) payload.password = password;
    try {
      if (editing) {
        await updateEmployee.mutateAsync({ id: editing.id, data: payload });
        toast.success("Funcionario atualizado!");
      } else {
        if (!password) { toast.error("Senha obrigatoria para novo funcionario"); return; }
        payload.password = password;
        await createEmployee.mutateAsync(payload);
        toast.success("Funcionario criado!");
      }
      setDialogOpen(false);
    } catch (err: unknown) { toast.error((err as Error).message); }
  }

  const columns: ColumnDef<Employee>[] = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "email", header: "Email" },
    { id: "role", header: "Perfil", cell: ({ row }) => <Badge variant="outline">{ROLE_LABELS[row.original.role] || row.original.role}</Badge> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.active ? "default" : "secondary"}>{row.original.active ? "Ativo" : "Inativo"}</Badge> },
    { id: "actions", cell: ({ row }) => <Button size="icon" variant="ghost" onClick={() => openEdit(row.original)}><Pencil className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funcionarios</h1>
          <p className="text-muted-foreground">Gerencie a equipe</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />} onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Novo Funcionario</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Funcionario</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input name="name" defaultValue={editing?.name ?? ""} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editing?.email ?? ""} required /></div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select name="role" defaultValue={editing?.role ?? "EMPLOYEE"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="EMPLOYEE">Funcionario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Senha {editing ? "(deixe vazio para manter)" : ""}</Label><Input name="password" type="password" required={!editing} /></div>
              <Button type="submit" className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : <DataTable columns={columns} data={employees} />}
    </div>
  );
}
