"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User } from "@/lib/types/user.types";

export default function EmployeesPage() {
  const [list, setList] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const load = () => api<User[]>("/funcionarios").then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  async function create() {
    if (!name || !email || !password) return;
    await api("/funcionarios", { method: "POST", body: JSON.stringify({ name, email, password, role: "EMPLOYEE" }) });
    setName(""); setEmail(""); setPassword(""); load();
  }
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Funcionários</h1>
      <div className="mb-6 flex gap-2">
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={create}>Criar</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
        <TableBody>
          {list.map((u) => (
            <TableRow key={u.id}><TableCell>{u.name}</TableCell><TableCell>{u.email}</TableCell><TableCell>{u.role}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
