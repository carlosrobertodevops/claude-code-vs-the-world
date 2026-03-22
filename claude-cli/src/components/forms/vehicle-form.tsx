"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const vehicleFormSchema = z.object({
  plate: z.string().min(7, "Placa inválida").max(8),
  brand: z.string().min(1, "Marca obrigatória"),
  model: z.string().min(1, "Modelo obrigatório"),
  year: z.string().optional(),
  color: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    plate: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function VehicleForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      year: "",
      color: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      plate: data.plate.toUpperCase(),
      brand: data.brand,
      model: data.model,
      year: data.year ? parseInt(data.year, 10) : undefined,
      color: data.color || undefined,
    });
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
          <DialogDescription>
            Preencha os dados do veículo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plate">Placa *</Label>
            <Input
              id="plate"
              placeholder="ABC1D23"
              {...form.register("plate")}
              aria-invalid={!!form.formState.errors.plate}
            />
            {form.formState.errors.plate && (
              <p className="text-xs text-destructive">
                {form.formState.errors.plate.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                placeholder="Toyota"
                {...form.register("brand")}
                aria-invalid={!!form.formState.errors.brand}
              />
              {form.formState.errors.brand && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.brand.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                placeholder="Corolla"
                {...form.register("model")}
                aria-invalid={!!form.formState.errors.model}
              />
              {form.formState.errors.model && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                placeholder="2024"
                {...form.register("year")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                placeholder="Branco"
                {...form.register("color")}
              />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
