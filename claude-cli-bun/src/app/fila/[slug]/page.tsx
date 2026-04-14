"use client";

import { useEffect, useState, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PublicEntry { position: number; status: string; vehicle: { plate: string; model?: string | null } }

export default function PublicQueuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [list, setList] = useState<PublicEntry[]>([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href); // eslint-disable-line react-hooks/set-state-in-effect
    const load = () =>
      fetch(`/api/fila/publica/${slug}`)
        .then((r) => r.json())
        .then((j) => setList(j.success ? j.data : []))
        .catch(() => setList([]));
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [slug]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Fila — {slug}</h1>
      <div className="mb-6 flex items-start gap-6">
        <Card className="p-4">
          <p className="mb-2 text-sm text-muted-foreground">Escaneie para acompanhar</p>
          {url && <QRCodeSVG value={url} size={128} />}
        </Card>
        <div className="flex-1">
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Veículo</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Fila vazia</TableCell></TableRow>
              )}
              {list.map((e) => (
                <TableRow key={e.position}>
                  <TableCell>{e.position}</TableCell>
                  <TableCell>{e.vehicle.plate} {e.vehicle.model && `— ${e.vehicle.model}`}</TableCell>
                  <TableCell><Badge>{e.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Atualização automática a cada 15s</p>
    </main>
  );
}
