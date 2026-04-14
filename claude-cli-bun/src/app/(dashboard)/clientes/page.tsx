"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customer } from "@/lib/types/customer.types";

export default function CustomersPage() {
  const [list, setList] = useState<Customer[]>([]);
  const [term, setTerm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const load = () => {
    api<Customer[]>(term ? `/clientes?q=${encodeURIComponent(term)}` : "/clientes").then(setList).catch(() => setList([]));
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [term]);

  async function create() {
    if (!name) return;
    await api("/clientes", { method: "POST", body: JSON.stringify({ name, phone }) });
    setName(""); setPhone(""); load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Clientes</h1>
      <div className="mb-4 flex gap-2">
        <Input placeholder="Buscar..." value={term} onChange={(e) => setTerm(e.target.value)} className="max-w-xs" />
      </div>
      <div className="mb-6 flex gap-2">
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button onClick={create}>Criar</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.phone ?? "-"}</TableCell>
              <TableCell>{c.email ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
