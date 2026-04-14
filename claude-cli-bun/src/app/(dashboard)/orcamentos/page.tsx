"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Quote } from "@/lib/types/quote.types";

export default function QuotesPage() {
  const [list, setList] = useState<Quote[]>([]);
  useEffect(() => { api<Quote[]>("/orcamentos").then(setList).catch(() => setList([])); }, []);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Orçamentos</h1>
      <Table>
        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {list.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-mono text-xs">{q.id.slice(0, 8)}</TableCell>
              <TableCell><Badge>{q.status}</Badge></TableCell>
              <TableCell>R$ {q.total}</TableCell>
              <TableCell><a className="text-sm underline" href={`/api/orcamentos/${q.id}/pdf`} target="_blank" rel="noreferrer">PDF</a></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
