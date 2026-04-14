"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ServiceType } from "@/lib/types/service-type.types";

export default function ServiceTypesPage() {
  const [list, setList] = useState<ServiceType[]>([]);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("0.00");

  const load = () => api<ServiceType[]>("/inventario/servicos").then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  async function create() {
    if (!name) return;
    await api("/inventario/servicos", { method: "POST", body: JSON.stringify({ name, basePrice }) });
    setName(""); setBasePrice("0.00"); load();
  }
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tipos de Serviço</h1>
      <div className="mb-6 flex gap-2">
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Preço base" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
        <Button onClick={create}>Criar</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Preço</TableHead></TableRow></TableHeader>
        <TableBody>
          {list.map((s) => (
            <TableRow key={s.id}><TableCell>{s.name}</TableCell><TableCell>R$ {s.basePrice}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
