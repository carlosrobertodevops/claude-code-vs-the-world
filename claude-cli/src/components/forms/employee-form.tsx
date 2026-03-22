"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createUserSchema, type CreateUserInput, type UpdateUserInput } from "@/lib/validations/user";
import { useCreateEmployee, useUpdateEmployee, type Employee } from "@/hooks/use-employees";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeForm({ open, onOpenChange, employee }: EmployeeFormProps) {
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      phone: "",
    },
  });

  const roleValue = watch("role");

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name,
        email: employee.email,
        password: "",
        role: employee.role as "MANAGER" | "EMPLOYEE",
        phone: employee.phone || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        phone: "",
      });
    }
  }, [employee, reset]);

  async function onSubmit(data: CreateUserInput) {
    try {
      if (isEditing && employee) {
        const updateData: UpdateUserInput = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateMutation.mutateAsync({ id: employee.id, data: updateData });
        toast.success("Funcionario atualizado com sucesso.");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Funcionario criado com sucesso.");
      }

      onOpenChange(false);
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar funcionario";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Funcionario" : "Novo Funcionario"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados do funcionario."
              : "Preencha os dados para cadastrar um novo funcionario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emp-name">Nome</Label>
            <Input
              id="emp-name"
              placeholder="Nome completo"
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-email">Email</Label>
            <Input
              id="emp-email"
              type="email"
              placeholder="email@exemplo.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-password">
              Senha {isEditing && "(deixe vazio para manter)"}
            </Label>
            <Input
              id="emp-password"
              type="password"
              placeholder={isEditing ? "Nova senha (opcional)" : "Minimo 6 caracteres"}
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select
              value={roleValue}
              onValueChange={(val) => setValue("role", val as "MANAGER" | "EMPLOYEE")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANAGER">Gerente</SelectItem>
                <SelectItem value="EMPLOYEE">Funcionario</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-phone">Telefone</Label>
            <Input
              id="emp-phone"
              type="tel"
              placeholder="(00) 00000-0000"
              disabled={isLoading}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
