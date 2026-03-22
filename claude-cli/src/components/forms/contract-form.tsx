"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createContractSchema,
  type CreateContractInput,
} from "@/lib/validations/contract";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContractInput) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateContractInput>;
}

export function ContractForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
}: ContractFormProps) {
  const form = useForm<CreateContractInput>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      customerId: defaultValues?.customerId || "",
      title: defaultValues?.title || "",
      content: defaultValues?.content || "",
    },
  });

  const customerId = form.watch("customerId");

  const { data: customers } = useCustomers();

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Editar Contrato" : "Novo Contrato"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para {defaultValues ? "editar o" : "criar um novo"} contrato.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select
              value={customerId}
              onValueChange={(val) => form.setValue("customerId", val ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.customerId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.customerId.message}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
            <Input
              id="title"
              placeholder="Titulo do contrato"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteudo *</Label>
            <Textarea
              id="content"
              placeholder="Conteudo do contrato..."
              className="min-h-[200px]"
              {...form.register("content")}
            />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
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
              {defaultValues ? "Salvar" : "Criar Contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
