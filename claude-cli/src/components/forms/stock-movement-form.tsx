"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createStockMovementSchema,
  type CreateStockMovementInput,
} from "@/lib/validations/product";
import type { Product } from "@/generated/prisma/client";
import { useCreateStockMovement } from "@/hooks/use-inventory";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface StockMovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function StockMovementForm({
  open,
  onOpenChange,
  product,
}: StockMovementFormProps) {
  const createMovement = useCreateStockMovement();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateStockMovementInput>({
    resolver: zodResolver(createStockMovementSchema) as Resolver<CreateStockMovementInput>,
    values: {
      productId: product?.id ?? "",
      type: "IN",
      quantity: 0,
      unitCost: 0,
      notes: "",
    },
  });

  async function onSubmit(data: CreateStockMovementInput) {
    try {
      await createMovement.mutateAsync(data);
      toast.success("Movimentacao registrada com sucesso");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao registrar movimentacao"
      );
    }
  }

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentacao de Estoque</DialogTitle>
          <DialogDescription>
            Registrar movimentacao para: {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
          <span className="text-muted-foreground">Estoque atual:</span>
          <Badge
            variant={
              product.currentStock < product.minimumStock
                ? "destructive"
                : "secondary"
            }
          >
            {product.currentStock} {product.unit}
          </Badge>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("productId")} />

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimentacao</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Entrada</SelectItem>
                    <SelectItem value="OUT">Saida</SelectItem>
                    <SelectItem value="ADJUSTMENT">Ajuste (define estoque)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCost">Custo Unitario (R$)</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                min="0"
                {...register("unitCost")}
              />
              {errors.unitCost && (
                <p className="text-xs text-destructive">{errors.unitCost.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              placeholder="Motivo da movimentacao..."
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
