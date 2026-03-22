"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/shared/signature-pad";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface ContractData {
  id: string;
  contractNumber: string;
  status: string;
  title: string;
  content: string;
  customer: {
    name: string;
  };
}

export default function SignContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    async function loadContract() {
      try {
        const res = await fetch(`/api/contratos/${id}/assinar`);
        const json = await res.json();

        if (!json.success) {
          setError(json.error?.message || "Contrato nao encontrado");
          return;
        }

        setContract(json.data);

        if (json.data.status === "SIGNED") {
          setSigned(true);
        }
      } catch {
        setError("Erro ao carregar contrato");
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [id]);

  const handleSign = async () => {
    if (!signatureData) return;

    setSigning(true);
    try {
      const res = await fetch(`/api/contratos/${id}/assinar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "Erro ao assinar contrato");
        return;
      }

      setSigned(true);
    } catch {
      setError("Erro ao assinar contrato");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Carregando contrato...</p>
        </div>
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">Erro</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h1 className="text-xl font-bold text-gray-900">
            Contrato Assinado!
          </h1>
          <p className="mt-2 text-muted-foreground">
            O contrato foi assinado com sucesso. Obrigado!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600">AquaWash</h1>
          <p className="text-sm text-muted-foreground">
            Assinatura de Contrato Digital
          </p>
        </div>

        {/* Contract Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
          {/* Contract Info */}
          <div>
            <h2 className="text-lg font-bold">{contract?.title}</h2>
            <p className="text-sm text-muted-foreground">
              Contrato {contract?.contractNumber}
            </p>
          </div>

          {/* Contract Content */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="whitespace-pre-wrap text-sm">
              {contract?.content}
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Assinatura</h3>
            <p className="text-sm text-muted-foreground">
              Desenhe sua assinatura no campo abaixo para confirmar a aceitacao deste contrato.
            </p>
            <SignaturePad onSignatureChange={setSignatureData} />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSign}
            disabled={!signatureData || signing}
          >
            {signing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assinar Contrato
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Ao assinar, voce confirma que leu e concorda com os termos acima.
            Seu endereco IP sera registrado.
          </p>
        </div>
      </div>
    </div>
  );
}
