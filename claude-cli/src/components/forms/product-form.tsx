"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@/lib/validations/product";
import type { Product } from "@/generated/prisma/client";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-inventory";
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
import { toast } from "sonner";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as Resolver<CreateProductInput>,
    values: product
      ? {
          name: product.name,
          unit: product.unit,
          currentStock: product.currentStock,
          minimumStock: product.minimumStock,
          costPrice: product.costPrice,
        }
      : {
          name: "",
          unit: "un",
          currentStock: 0,
          minimumStock: 0,
          costPrice: 0,
        },
  });

  async function onSubmit(data: CreateProductInput) {
    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, data });
        toast.success("Produto atualizado com sucesso");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Produto criado com sucesso");
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar produto");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informacoes do produto."
              : "Preencha os dados do novo produto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Nome do produto" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input id="unit" placeholder="un, L, kg..." {...register("unit")} />
              {errors.unit && (
                <p className="text-xs text-destructive">{errors.unit.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preco de Custo (R$)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                {...register("costPrice")}
              />
              {errors.costPrice && (
                <p className="text-xs text-destructive">{errors.costPrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Estoque Atual</Label>
              <Input
                id="currentStock"
                type="number"
                step="0.01"
                min="0"
                {...register("currentStock")}
              />
              {errors.currentStock && (
                <p className="text-xs text-destructive">{errors.currentStock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumStock">Estoque Minimo</Label>
              <Input
                id="minimumStock"
                type="number"
                step="0.01"
                min="0"
                {...register("minimumStock")}
              />
              {errors.minimumStock && (
                <p className="text-xs text-destructive">{errors.minimumStock.message}</p>
              )}
            </div>
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
              {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
