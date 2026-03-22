import Image from "next/image";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireManagerPage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { configSchema } from "@/lib/validations/config";

export default async function SettingsPage() {
  await requireManagerPage();
  const config = await prisma.carWashConfig.findFirstOrThrow();
  const queueUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/fila/${config.slug}`;
  const qrCode = await QRCode.toDataURL(queueUrl, { margin: 1, width: 220 });

  async function updateConfig(formData: FormData) {
    "use server";

    const parsed = configSchema.safeParse({
      businessName: formData.get("businessName"),
      slug: formData.get("slug"),
      simultaneousSlots: formData.get("simultaneousSlots"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      primaryColor: formData.get("primaryColor"),
      queueRefreshSeconds: formData.get("queueRefreshSeconds"),
      loyaltyEnabled: formData.get("loyaltyEnabled") === "on",
    });

    if (!parsed.success) return;

    await prisma.carWashConfig.update({ where: { id: config.id }, data: parsed.data });
    revalidatePath("/configuracoes");
    revalidatePath("/fila");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configuracoes" description="Personalize a operacao, ajuste fila publica e mantenha a identidade do JatoFlow alinhada ao seu negocio." />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-xl font-semibold text-slate-950">Dados do lava-jato</h2>
          <form action={updateConfig} className="mt-6 grid gap-4 md:grid-cols-2">
            <Input defaultValue={config.businessName} name="businessName" placeholder="Nome do negocio" required />
            <Input defaultValue={config.slug} name="slug" placeholder="Slug publico" required />
            <Input defaultValue={config.phone ?? ""} name="phone" placeholder="Telefone" required />
            <Input defaultValue={config.simultaneousSlots} min="1" name="simultaneousSlots" type="number" />
            <Input defaultValue={config.queueRefreshSeconds} min="10" name="queueRefreshSeconds" type="number" />
            <Input defaultValue={config.primaryColor} name="primaryColor" placeholder="#0b132b" required />
            <Input className="md:col-span-2" defaultValue={config.address ?? ""} name="address" placeholder="Endereco" required />
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2">
              <input defaultChecked={config.loyaltyEnabled} name="loyaltyEnabled" type="checkbox" />
              Programa de fidelidade ativo
            </label>
            <Button className="md:col-span-2" type="submit">Salvar configuracoes</Button>
          </form>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Features extras</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Fila publica + QR Code</h2>
          <Image alt="QR Code da fila publica" className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4" height={220} src={qrCode} unoptimized width={220} />
          <p className="mt-4 break-all text-sm text-slate-600">{queueUrl}</p>
          <div className="mt-6 space-y-3 rounded-[28px] bg-slate-50 p-5 text-sm text-slate-600">
            <p><strong>Dark mode:</strong> disponivel no topo do painel.</p>
            <p><strong>Fidelidade:</strong> pontos gerados em ordens concluidas.</p>
            <p><strong>Exportacao CSV:</strong> disponivel em relatorios.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
