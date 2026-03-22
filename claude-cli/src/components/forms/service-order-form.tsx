"use client";

import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createServiceOrderSchema,
  type CreateServiceOrderInput,
} from "@/lib/validations/service";
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
import { useCustomers, useCustomerVehicles } from "@/hooks/use-customers";
import {
  useServiceTypes,
  useEmployees,
} from "@/hooks/use-service-orders";
import { useCallback, useMemo } from "react";

interface ServiceOrderFormValues {
  customerId: string;
  vehicleId: string;
  employeeId: string;
  notes: string;
  items: {
    serviceTypeId?: string;
    productId?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface ServiceOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateServiceOrderInput) => Promise<void>;
  isLoading?: boolean;
}

export function ServiceOrderForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: ServiceOrderFormProps) {
  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(createServiceOrderSchema) as Resolver<ServiceOrderFormValues>,
    defaultValues: {
      customerId: "",
      vehicleId: "",
      employeeId: "",
      notes: "",
      items: [{ serviceTypeId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const customerId = form.watch("customerId");
  const items = form.watch("items");

  const { data: customers } = useCustomers();
  const { data: vehicles } = useCustomerVehicles(customerId);
  const { data: serviceTypes } = useServiceTypes();
  const { data: employees } = useEmployees();

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);
  }, [items]);

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
    await onSubmit(data as unknown as CreateServiceOrderInput);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova OS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select
              value={customerId}
              onValueChange={(val) => {
                form.setValue("customerId", val ?? "");
                form.setValue("vehicleId", "");
              }}
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

          {/* Vehicle */}
          <div className="space-y-2">
            <Label>Veículo *</Label>
            <Select
              value={form.watch("vehicleId")}
              onValueChange={(val) => form.setValue("vehicleId", val ?? "")}
              disabled={!customerId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    customerId
                      ? "Selecione o veículo"
                      : "Selecione um cliente primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehicles?.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.plate} - {v.brand} {v.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.vehicleId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.vehicleId.message}
              </p>
            )}
          </div>

          {/* Employee */}
          <div className="space-y-2">
            <Label>Funcionário</Label>
            <Select
              value={form.watch("employeeId") || ""}
              onValueChange={(val) => form.setValue("employeeId", val ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  append({ serviceTypeId: "", quantity: 1, unitPrice: 0 })
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
                  <Label>Tipo de Serviço</Label>
                  <Select
                    value={items[index]?.serviceTypeId || ""}
                    onValueChange={(val) =>
                      handleServiceTypeChange(index, val ?? "")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o serviço" />
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
                    <Label>Descrição</Label>
                    <Input
                      placeholder="Opcional"
                      {...form.register(`items.${index}.description`)}
                    />
                  </div>
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
                    <Label>Preço Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...form.register(`items.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <p className="text-sm text-right text-muted-foreground">
                  Subtotal: R${" "}
                  {(
                    (Number(items[index]?.quantity) || 0) *
                    (Number(items[index]?.unitPrice) || 0)
                  ).toFixed(2)}
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
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o serviço..."
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
              Criar OS
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
