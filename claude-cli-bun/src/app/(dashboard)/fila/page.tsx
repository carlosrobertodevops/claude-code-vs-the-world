"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { QueueEntry } from "@/lib/types/queue.types";

export default function QueueAdminPage() {
  const [slug, setSlug] = useState("lavaflow-centro");
  const [list, setList] = useState<QueueEntry[]>([]);
  const load = () => api<QueueEntry[]>(`/fila/${slug}`).then(setList).catch(() => setList([]));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Fila (Admin)</h1>
      <Input className="mb-4 max-w-xs" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <Table>
        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>OS</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {list.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.position}</TableCell>
              <TableCell className="font-mono text-xs">{e.serviceOrderId.slice(0, 8)}</TableCell>
              <TableCell><Badge>{e.status}</Badge></TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={async () => { await api(`/fila/${e.id}`, { method: "DELETE" }); load(); }}>Remover</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-4 text-sm text-muted-foreground">URL pública: <a className="underline" href={`/fila/${slug}`}>/fila/{slug}</a></p>
    </div>
  );
}
