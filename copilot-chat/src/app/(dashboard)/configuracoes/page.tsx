"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Copy } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type CarWashConfig = {
  id: string;
  businessName: string;
  slug: string;
  address: string;
  phone: string;
  simultaneousSlots: number;
  publicQueueEnabled: boolean;
  defaultMessage: string;
};

export default function ConfiguracoesPage() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ["config"],
    queryFn: () => apiGet("/api/configuracoes"),
  }) as { data: CarWashConfig | undefined; isLoading: boolean };

  const { register, handleSubmit, reset, setValue, watch } = useForm<CarWashConfig>();

  useEffect(() => {
    if (config) reset(config);
  }, [config, reset]);

  const publicQueueEnabled = watch("publicQueueEnabled");

  const update = useMutation({
    mutationFn: (data: Partial<CarWashConfig>) => apiPut("/api/configuracoes", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["config"] }); toast.success("Configuracoes salvas!"); },
    onError: (err: Error) => toast.error(err.message),
  });

  function copyQueueUrl() {
    if (!config?.slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/fila/${config.slug}`);
    toast.success("Link da fila publica copiado!");
  }

  if (isLoading) return <p className="text-muted-foreground p-6">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuracoes</h1>
        <p className="text-muted-foreground">Configuracoes gerais do lava-jato</p>
      </div>

      <form onSubmit={handleSubmit((data) => update.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Dados do Estabelecimento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Nome</Label><Input {...register("businessName")} /></div>
              <div className="space-y-2"><Label>Slug (URL)</Label><Input {...register("slug")} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input {...register("phone")} /></div>
              <div className="space-y-2"><Label>Vagas Simultaneas</Label><Input type="number" {...register("simultaneousSlots", { valueAsNumber: true })} /></div>
            </div>
            <div className="space-y-2"><Label>Endereco</Label><Textarea {...register("address")} rows={2} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fila Publica</CardTitle>
            <CardDescription>Permita que clientes acompanhem a fila em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={publicQueueEnabled}
                onCheckedChange={(v) => setValue("publicQueueEnabled", v)}
              />
              <Label>Fila publica ativada</Label>
            </div>
            {config?.slug && (
              <div className="flex items-center gap-2">
                <Input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/fila/${config.slug}`} className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={copyQueueUrl}><Copy className="h-4 w-4" /></Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensagem Padrao WhatsApp</CardTitle>
            <CardDescription>Use {"{nome}"} e {"{placa}"} como variaveis</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea {...register("defaultMessage")} rows={3} placeholder="Ola {nome}, seu veiculo {placa} esta pronto!" />
          </CardContent>
        </Card>

        <Button type="submit" size="lg">Salvar Configuracoes</Button>
      </form>
    </div>
  );
}
