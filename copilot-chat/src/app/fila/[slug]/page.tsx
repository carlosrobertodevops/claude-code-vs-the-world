"use client";

import { use } from "react";
import { usePublicQueue } from "@/hooks/use-queue";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Car, Droplets, RefreshCw } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

type PublicQueueEntry = {
  position: number;
  plate: string;
  status: string;
  estimatedMinutes: number;
  estimatedWait: number;
};

type PublicQueueData = {
  businessName: string;
  phone: string;
  queue: PublicQueueEntry[];
};

export default function PublicQueuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = usePublicQueue(slug) as {
    data: PublicQueueData | undefined; isLoading: boolean; isError: boolean
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin"><RefreshCw className="h-8 w-8 text-muted-foreground" /></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Fila nao encontrada ou desativada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">{data.businessName}</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <RefreshCw className="h-3 w-3" /> Atualiza a cada 30s
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">Fila de Atendimento</h1>
          <p className="text-sm text-muted-foreground">{data.queue.length} veiculo(s) na fila</p>
        </div>

        {data.queue.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Car className="mx-auto h-12 w-12 mb-4" />
              <p>Nenhum veiculo na fila no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.queue.map((entry, idx) => (
              <Card key={idx} className={idx === 0 ? "border-primary" : ""}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Badge variant={idx === 0 ? "default" : "outline"} className="text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full">
                    {entry.position}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{entry.plate}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={entry.status === "IN_PROGRESS" ? "default" : "secondary"}>
                      {entry.status === "IN_PROGRESS" ? "Lavando" : "Aguardando"}
                    </Badge>
                    {entry.estimatedWait > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" /> ~{entry.estimatedWait} min
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">{APP_NAME}</p>
      </main>
    </div>
  );
}
