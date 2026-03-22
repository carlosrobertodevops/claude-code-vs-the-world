"use client";

import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCreateStockMovement } from "@/hooks/use-inventory";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Package, AlertTriangle, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPrice: number;
  isActive: boolean;
};

export default function InventarioPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const { data: products = [], isLoading } = useProducts(search) as { data: Product[]; isLoading: boolean };
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createMovement = useCreateStockMovement();

  const lowStockProducts = products.filter(
    (p: Product) => p.isActive && p.currentStock <= p.minimumStock
  );

  async function handleSubmitProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      unit: form.get("unit") as string,
      currentStock: parseFloat(form.get("currentStock") as string),
      minimumStock: parseFloat(form.get("minimumStock") as string),
      costPrice: parseFloat(form.get("costPrice") as string),
    };

    try {
      if (editProduct) {
        await updateProduct.mutateAsync({ id: editProduct.id, data });
        toast.success("Produto atualizado!");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Produto criado!");
      }
      setDialogOpen(false);
      setEditProduct(null);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  async function handleSubmitMovement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      productId: form.get("productId") as string,
      type: form.get("type") as string,
      quantity: parseFloat(form.get("quantity") as string),
      unitCost: parseFloat(form.get("unitCost") as string) || undefined,
      notes: form.get("notes") as string,
    };

    try {
      await createMovement.mutateAsync(data);
      toast.success("Movimentacao registrada!");
      setMovementOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "unit", header: "Unidade" },
    {
      accessorKey: "currentStock",
      header: "Estoque Atual",
      cell: ({ row }) => {
        const p = row.original;
        const isLow = p.currentStock <= p.minimumStock;
        return (
          <span className={isLow ? "text-destructive font-bold" : ""}>
            {p.currentStock} {isLow && <AlertTriangle className="inline h-4 w-4" />}
          </span>
        );
      },
    },
    { accessorKey: "minimumStock", header: "Estoque Minimo" },
    {
      accessorKey: "costPrice",
      header: "Preco Custo",
      cell: ({ row }) => `R$ ${row.original.costPrice.toFixed(2)}`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditProduct(row.original);
              setDialogOpen(true);
            }}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedProduct(row.original.id);
              setMovementOpen(true);
            }}
          >
            Movimentar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">Gerencie seus produtos e estoque</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={movementOpen} onOpenChange={setMovementOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <ArrowUpDown className="mr-2 h-4 w-4" /> Movimentar
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Movimentacao</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitMovement} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select name="productId" defaultValue={selectedProduct}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {products.map((p: Product) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select name="type" defaultValue="IN">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">Entrada</SelectItem>
                      <SelectItem value="OUT">Saida</SelectItem>
                      <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input name="quantity" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label>Custo Unitario (opcional)</Label>
                  <Input name="unitCost" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Observacoes</Label>
                  <Input name="notes" />
                </div>
                <Button type="submit" className="w-full">Registrar</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditProduct(null); }}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input name="name" defaultValue={editProduct?.name} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input name="unit" defaultValue={editProduct?.unit || "un"} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Preco Custo</Label>
                    <Input name="costPrice" type="number" step="0.01" defaultValue={editProduct?.costPrice || 0} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estoque Atual</Label>
                    <Input name="currentStock" type="number" step="0.01" defaultValue={editProduct?.currentStock || 0} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Minimo</Label>
                    <Input name="minimumStock" type="number" step="0.01" defaultValue={editProduct?.minimumStock || 0} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editProduct ? "Salvar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Estoque Baixo ({lowStockProducts.length} produtos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((p: Product) => (
                <Badge key={p.id} variant="destructive">
                  {p.name}: {p.currentStock} {p.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <DataTable columns={columns} data={products} />
      )}
    </div>
  );
}
