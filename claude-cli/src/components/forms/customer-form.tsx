"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCustomerSchema,
  type CreateCustomerInput,
} from "@/lib/validations/customer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { CustomerWithCount } from "@/hooks/use-customers";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCustomerInput) => Promise<void>;
  customer?: CustomerWithCount | null;
  isLoading?: boolean;
}

export function CustomerForm({
  open,
  onOpenChange,
  onSubmit,
  customer,
  isLoading,
}: CustomerFormProps) {
  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      cpfCnpj: customer?.cpfCnpj ?? "",
      address: customer?.address ?? "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Atualize as informações do cliente."
              : "Preencha os dados para cadastrar um novo cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Nome completo"
              {...form.register("name")}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              {...form.register("phone")}
              aria-invalid={!!form.formState.errors.phone}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              {...form.register("email")}
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
            <Input
              id="cpfCnpj"
              placeholder="000.000.000-00"
              {...form.register("cpfCnpj")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              placeholder="Rua, número, bairro"
              {...form.register("address")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {customer ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
