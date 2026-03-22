"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/generated/prisma/client";
import { useProducts, useDeleteProduct } from "@/hooks/use-inventory";
import { DataTable } from "@/components/tables/data-table";
import { ProductForm } from "@/components/forms/product-form";
import { StockMovementForm } from "@/components/forms/stock-movement-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Package, Plus, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

export function InventoryContent() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  function handleEdit(product: Product) {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  }

  function handleNewProduct() {
    setSelectedProduct(null);
    setProductDialogOpen(true);
  }

  function handleMovement(product: Product) {
    setSelectedProduct(product);
    setMovementDialogOpen(true);
  }

  async function handleDelete(product: Product) {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Produto excluido com sucesso");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir produto"
      );
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unidade",
    },
    {
      accessorKey: "currentStock",
      header: "Estoque Atual",
      cell: ({ row }) => {
        const product = row.original;
        const isLow = product.currentStock < product.minimumStock;
        return (
          <div className="flex items-center gap-2">
            <span>{product.currentStock}</span>
            {isLow && (
              <Badge variant="destructive">
                Baixo
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "minimumStock",
      header: "Estoque Minimo",
    },
    {
      accessorKey: "costPrice",
      header: "Preco de Custo",
      cell: ({ row }) => {
        const price = row.getValue("costPrice") as number;
        return `R$ ${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleMovement(product)}
              title="Movimentacao de estoque"
            >
              <Package className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" />}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMovement(product)}>
                  Movimentacao
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(product)}
                  className="text-destructive"
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e estoque.
          </p>
        </div>
        <Button onClick={handleNewProduct}>
          <Plus className="mr-1 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          Carregando...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Buscar produto..."
        />
      )}

      <ProductForm
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
      />

      <StockMovementForm
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        product={selectedProduct}
      />
    </div>
  );
}
