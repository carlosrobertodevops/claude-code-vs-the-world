"use client";

import { useEffect, useState } from "react";
import { useConfig, useUpdateConfig } from "@/hooks/use-config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save, Link, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [simultaneousSlots, setSimultaneousSlots] = useState("2");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (config) {
      setBusinessName(config.businessName);
      setSlug(config.slug);
      setSimultaneousSlots(String(config.simultaneousSlots));
      setPhone(config.phone || "");
      setAddress(config.address || "");
    }
  }, [config]);

  function handleSlugChange(value: string) {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");
    setSlug(sanitized);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!businessName.trim() || !slug.trim()) {
      toast.error("Nome e slug sao obrigatorios.");
      return;
    }

    updateConfig.mutate(
      {
        businessName: businessName.trim(),
        slug: slug.trim(),
        simultaneousSlots: Number(simultaneousSlots) || 2,
        phone: phone.trim() || null,
        address: address.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Configuracoes salvas com sucesso!");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Configuracoes</h1>
        <Skeleton className="h-96 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/fila/${slug}`
      : `/fila/${slug}`;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Configuracoes</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Estabelecimento</CardTitle>
            <CardDescription>
              Informacoes gerais do seu lava-jato.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do Estabelecimento</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: AquaWash Centro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="ex: aquawash-centro"
              />
              <p className="text-xs text-muted-foreground">
                Usado na URL publica da fila. Apenas letras minusculas, numeros e hifens.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simultaneousSlots">Vagas Simultaneas</Label>
              <Input
                id="simultaneousSlots"
                type="number"
                min="1"
                max="20"
                value={simultaneousSlots}
                onChange={(e) => setSimultaneousSlots(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Quantos veiculos podem ser atendidos ao mesmo tempo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua Exemplo, 123 - Centro"
              />
            </div>
          </CardContent>
        </Card>

        {/* Public URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Fila Publica
            </CardTitle>
            <CardDescription>
              Compartilhe este link para que seus clientes acompanhem a fila.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <code className="flex-1 text-sm break-all">{publicUrl}</code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success("Link copiado!");
                }}
              >
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateConfig.isPending} size="lg">
          {updateConfig.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Configuracoes
        </Button>
      </form>
    </div>
  );
}
