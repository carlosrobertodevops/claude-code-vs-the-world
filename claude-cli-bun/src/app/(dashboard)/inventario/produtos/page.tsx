"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/lib/types/product.types";

export default function ProductsPage() {
  const [list, setList] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0.00");
  const [stockQty, setStockQty] = useState("0");

  const load = () => api<Product[]>("/inventario/produtos").then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  async function create() {
    if (!name) return;
    await api("/inventario/produtos", { method: "POST", body: JSON.stringify({ name, price, stockQty: Number(stockQty) }) });
    setName(""); setPrice("0.00"); setStockQty("0"); load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Produtos</h1>
      <div className="mb-6 flex gap-2">
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Preço" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input placeholder="Estoque" type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
        <Button onClick={create}>Criar</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>R$ {p.price}</TableCell>
              <TableCell>{p.stockQty} {p.unit}</TableCell>
              <TableCell>{p.stockQty < 5 && <Badge variant="destructive">Estoque baixo</Badge>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
