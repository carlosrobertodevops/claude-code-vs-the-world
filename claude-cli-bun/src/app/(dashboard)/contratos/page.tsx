"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Contract } from "@/lib/types/contract.types";

export default function ContractsPage() {
  const [list, setList] = useState<Contract[]>([]);
  useEffect(() => { api<Contract[]>("/contratos").then(setList).catch(() => setList([])); }, []);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Contratos</h1>
      <Table>
        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Status</TableHead><TableHead>Link assinatura</TableHead></TableRow></TableHeader>
        <TableBody>
          {list.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs">{c.id.slice(0, 8)}</TableCell>
              <TableCell><Badge>{c.status}</Badge></TableCell>
              <TableCell className="font-mono text-xs">POST /api/contratos/{c.id}/assinar (token: {c.signatureToken.slice(0, 8)}...)</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
