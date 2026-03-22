"use client";

import { use, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileSignature, Loader2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { toast } from "sonner";

type ContractData = {
  id: string;
  contractNumber: string;
  title: string;
  content: string;
  status: string;
  customer: { name: string };
};

export default function AssinarContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ["contract-sign", id],
    queryFn: () => apiGet<ContractData>(`/api/contratos/${id}/publico`),
  });

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    ctx.beginPath();
    ctx.moveTo(point.clientX - rect.left, point.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(point.clientX - rect.left, point.clientY - rect.top);
    ctx.stroke();
  }

  function stopDraw() {
    setDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  async function handleSubmit() {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    setSubmitting(true);
    try {
      const signatureData = canvas.toDataURL("image/png");
      await apiPost(`/api/contratos/${id}/assinar`, { signatureData });
      setSigned(true);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Contrato nao encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signed || contract.status === "SIGNED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Contrato Assinado!</h2>
            <p className="text-muted-foreground">Obrigado, {contract.customer.name}. Sua assinatura foi registrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contract.status !== "PENDING_SIGNATURE") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Este contrato nao esta disponivel para assinatura.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <FileSignature className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{APP_NAME}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{contract.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Contrato #{contract.contractNumber} - {contract.customer.name}</p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {contract.content}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assinatura</CardTitle>
            <p className="text-sm text-muted-foreground">Desenhe sua assinatura no campo abaixo</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md bg-white">
              <canvas
                ref={canvasRef}
                width={560}
                height={200}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearSignature} className="flex-1">
                Limpar
              </Button>
              <Button onClick={handleSubmit} disabled={!hasSignature || submitting} className="flex-1">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Assinar Contrato
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">{APP_NAME}</p>
      </main>
    </div>
  );
}
