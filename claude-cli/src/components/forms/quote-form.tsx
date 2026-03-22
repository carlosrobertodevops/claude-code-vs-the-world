"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createQuoteSchema,
  type CreateQuoteInput,
} from "@/lib/validations/quote";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { useServiceTypes } from "@/hooks/use-service-orders";
import { useCallback, useMemo } from "react";

interface QuoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateQuoteInput) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateQuoteInput>;
}

export function QuoteForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
}: QuoteFormProps) {
  const form = useForm<CreateQuoteInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createQuoteSchema) as any,
    defaultValues: {
      customerId: defaultValues?.customerId || "",
      notes: defaultValues?.notes || "",
      validUntil: defaultValues?.validUntil || "",
      items: defaultValues?.items || [
        { serviceTypeId: "", quantity: 1, unitPrice: 0, discount: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const customerId = form.watch("customerId");
  const items = form.watch("items");

  const { data: customers } = useCustomers();
  const { data: serviceTypes } = useServiceTypes();

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      return sum + qty * price * (1 - discount / 100);
    }, 0);
  }, [items]);

  const getItemSubtotal = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return 0;
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      return qty * price * (1 - discount / 100);
    },
    [items]
  );

  const handleServiceTypeChange = useCallback(
    (index: number, serviceTypeId: string) => {
      form.setValue(`items.${index}.serviceTypeId`, serviceTypeId);
      const st = serviceTypes?.find((s) => s.id === serviceTypeId);
      if (st) {
        form.setValue(`items.${index}.unitPrice`, st.basePrice);
      }
    },
    [form, serviceTypes]
  );

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Editar Orcamento" : "Novo Orcamento"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para {defaultValues ? "editar o" : "criar um novo"} orcamento.
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

          {/* Valid Until */}
          <div className="space-y-2">
            <Label htmlFor="validUntil">Validade</Label>
            <Input
              id="validUntil"
              type="date"
              {...form.register("validUntil")}
            />
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Itens *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ serviceTypeId: "", quantity: 1, unitPrice: 0, discount: 0 })
                }
              >
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Item {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Servico</Label>
                  <Select
                    value={items[index]?.serviceTypeId || ""}
                    onValueChange={(val) =>
                      handleServiceTypeChange(index, val ?? "")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o servico" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes
                        ?.filter((s) => s.isActive)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} - R$ {s.basePrice.toFixed(2)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Qtd</Label>
                    <Input
                      type="number"
                      min={1}
                      {...form.register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preco Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...form.register(`items.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      {...form.register(`items.${index}.discount`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <p className="text-sm text-right text-muted-foreground">
                  Subtotal: R$ {getItemSubtotal(index).toFixed(2)}
                </p>
              </div>
            ))}

            {form.formState.errors.items && (
              <p className="text-xs text-destructive">
                {typeof form.formState.errors.items.message === "string"
                  ? form.formState.errors.items.message
                  : "Verifique os itens"}
              </p>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-end text-lg font-bold">
            Total: R$ {total.toFixed(2)}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              placeholder="Observacoes sobre o orcamento..."
              {...form.register("notes")}
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
              {defaultValues ? "Salvar" : "Criar Orcamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
