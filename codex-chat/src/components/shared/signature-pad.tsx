"use client";

import SignatureCanvas from "react-signature-canvas";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SignaturePad({ contractId }: { contractId: string }) {
  const ref = useRef<SignatureCanvas | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitSignature() {
    if (!ref.current || ref.current.isEmpty()) {
      toast.error("Desenhe a assinatura antes de enviar.");
      return;
    }

    setLoading(true);
    const signatureData = ref.current.toDataURL("image/png");
    const response = await fetch(`/api/contratos/${contractId}/assinar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureData }),
    });

    setLoading(false);

    if (!response.ok) {
      toast.error("Nao foi possivel registrar a assinatura.");
      return;
    }

    toast.success("Contrato assinado com sucesso.");
    window.location.reload();
  }

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-slate-950">Assinatura digital</h2>
      <p className="mt-2 text-sm text-slate-600">Assine no quadro abaixo para concluir o contrato.</p>
      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <SignatureCanvas canvasProps={{ className: "h-72 w-full" }} ref={ref} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" onClick={() => ref.current?.clear()} variant="secondary">Limpar</Button>
        <Button disabled={loading} type="button" onClick={submitSignature}>{loading ? "Enviando..." : "Assinar contrato"}</Button>
      </div>
    </Card>
  );
}
